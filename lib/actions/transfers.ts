"use server";

import { revalidatePath } from "next/cache";

import { StockMovementType, TransferStatus } from "@/generated/prisma/enums";

import type { ActionResult } from "@/lib/actions/common";
import {
  createDocumentNumber,
  getActionActorByPermission,
  getActionErrorMessage,
  normalizeOptionalString,
  parseInputDate,
} from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import {
  createAuditLog,
  recordStockMovement,
  syncLowStockAlert,
} from "@/lib/services/inventory-ledger";
import { transferSchema, type TransferFormInput } from "@/lib/validation/transfer";

export async function createTransferAction(
  input: TransferFormInput,
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("inventory:transfer");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to create transfers.",
    };
  }

  const parsed = transferSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Transfer payload did not validate.",
    };
  }

  const transferAt = parseInputDate(parsed.data.transferAt);

  if (!transferAt) {
    return {
      success: false,
      message: "Transfer date is invalid.",
    };
  }

  const note = normalizeOptionalString(parsed.data.note);

  try {
    const transferReference = await prisma.$transaction(async (tx) => {
      const assignments = await tx.$queryRaw<{ locationId: string }[]>`
        SELECT "locationId"
        FROM user_branches
        WHERE "userId" = ${actor.id}
        AND "isActive" = true
        AND "locationId" IN (${parsed.data.sourceLocationId}, ${parsed.data.destinationLocationId})
      `;

      const locationIds = assignments.map((a) => a.locationId);
      const validLocations = await tx.location.findMany({
        where: {
          id: { in: locationIds },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
        },
      });

      const sourceLocation = validLocations.find(
        (loc) => loc.id === parsed.data.sourceLocationId,
      );
      const destinationLocation = validLocations.find(
        (loc) => loc.id === parsed.data.destinationLocationId,
      );

      if (!sourceLocation || !destinationLocation) {
        throw new Error(
          "You must be assigned to both the source and destination locations.",
        );
      }

      const productIds = [...new Set(parsed.data.items.map((item) => item.productId))];
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          minimumStockAlert: true,
          unitId: true,
          buyingPrice: true,
          sellingPrice: true,
        },
      });

      if (products.length !== productIds.length) {
        throw new Error("One or more selected items no longer exist.");
      }

      const productMap = new Map(products.map((product) => [product.id, product]));
      const unitIds = [...new Set(parsed.data.items.map((item) => item.unitId))];
      const units = await tx.unit.findMany({
        where: { id: { in: unitIds } },
        select: { id: true, name: true },
      });
      const unitMap = new Map(units.map((u) => [u.id, u.name]));

      const transferNumber = createDocumentNumber("TRN", transferAt);

      const transfer = await tx.transfer.create({
        data: {
          transferNumber,
          sourceLocationId: sourceLocation.id,
          destinationLocationId: destinationLocation.id,
          status: TransferStatus.RECEIVED,
          sentById: actor.id,
          receivedById: actor.id,
          sentAt: transferAt,
          receivedAt: transferAt,
          ...(note ? { note } : {}),
        },
        select: {
          id: true,
          transferNumber: true,
        },
      });

      for (const item of parsed.data.items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error("Transfer line references an unknown item.");
        }

        const baseQuantity = item.quantity;
        const unitLabel = unitMap.get(item.unitId);

        if (!unitLabel) {
          throw new Error("Selected unit was not found.");
        }

        const transferItem = await tx.transferItem.create({
          data: {
            transferId: transfer.id,
            productId: product.id,
            quantity: baseQuantity,
            unitCost: product.buyingPrice,
            sellingPrice: product.sellingPrice,
          },
          select: {
            id: true,
          },
        });

        await recordStockMovement(tx, {
          locationId: sourceLocation.id,
          productId: product.id,
          movementType: StockMovementType.TRANSFER_OUT,
          quantity: -baseQuantity,
          unitCost: product.buyingPrice,
          unitValue: product.sellingPrice,
          movementDate: transferAt,
          sourceType: "Transfer",
          sourceId: transfer.id,
          sourceLineId: transferItem.id,
          counterpartyType: "Location",
          counterpartyId: destinationLocation.id,
        });

        await recordStockMovement(tx, {
          locationId: destinationLocation.id,
          productId: product.id,
          movementType: StockMovementType.TRANSFER_IN,
          quantity: baseQuantity,
          unitCost: product.buyingPrice,
          unitValue: product.sellingPrice,
          movementDate: transferAt,
          sourceType: "Transfer",
          sourceId: transfer.id,
          sourceLineId: transferItem.id,
          counterpartyType: "Location",
          counterpartyId: sourceLocation.id,
        });

        await syncLowStockAlert(tx, {
          locationId: sourceLocation.id,
          productId: product.id,
          threshold: product.minimumStockAlert,
          evaluatedAt: transferAt,
        });

        await syncLowStockAlert(tx, {
          locationId: destinationLocation.id,
          productId: product.id,
          threshold: product.minimumStockAlert,
          evaluatedAt: transferAt,
        });
      }

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "TRANSFER_CREATE",
        entityType: "Transfer",
        entityId: transfer.id,
        locationId: sourceLocation.id,
        after: {
          transferNumber: transfer.transferNumber,
          sourceLocationId: sourceLocation.id,
          destinationLocationId: destinationLocation.id,
          itemCount: parsed.data.items.length,
        },
      });

      return transfer.transferNumber;
    }, { timeout: 90000 });

    revalidatePath("/inventory/transfers");
    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/low-stock");
    revalidatePath("/inventory/out-of-stock");
    revalidatePath("/sales/new");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Transfer ${transferReference} posted successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(
        error,
        "Unable to post the transfer right now.",
      ),
    };
  }
}