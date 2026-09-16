"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/actions/common";
import { getActionActorByPermission, getActionErrorMessage } from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/services/inventory-ledger";
import { stockAdjustmentSchema, type StockAdjustmentFormInput } from "@/lib/validation/stock-adjustment";
import { Prisma, StockMovementType } from "@/generated/prisma/client";

function money(value: Prisma.Decimal | number | string | null | undefined) {
  return new Prisma.Decimal(value ?? 0);
}

export async function adjustStockLevelAction(input: StockAdjustmentFormInput): Promise<ActionResult> {
  const actor = await getActionActorByPermission("admin:manage");

  if (!actor || actor.role !== "ADMIN") {
    return {
      success: false,
      message: "Only admins can edit stock levels.",
    };
  }

  const parsed = stockAdjustmentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Stock adjustment details are invalid.",
    };
  }

  const { locationId, productId, quantity, reason } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const [location, product, aggregate] = await Promise.all([
        tx.location.findUnique({ where: { id: locationId }, select: { id: true, name: true } }),
        tx.product.findUnique({
          where: { id: productId },
          select: {
            id: true,
            name: true,
            sku: true,
            unitId: true,
            buyingPrice: true,
          },
        }),
        tx.stockMovement.aggregate({
          where: { locationId, productId },
          _sum: { quantity: true },
        }),
      ]);

      if (!location) {
        throw new Error("Selected location was not found.");
      }

      if (!product) {
        throw new Error("Selected item was not found.");
      }

      const previousQuantity = aggregate._sum.quantity ?? 0;
      const quantity = 0;
      const newQuantity = quantity;
      const adjustmentQuantity = newQuantity - previousQuantity;
      const adjustmentDirection =
        adjustmentQuantity > 0 ? "INCREASE" : adjustmentQuantity < 0 ? "DECREASE" : "NO_CHANGE";

      if (adjustmentQuantity === 0) {
        throw new Error("Stock level is already at that value.");
      }

      const reference = `MANUAL-${Date.now().toString(36).toUpperCase()}`;

      const movement = await tx.stockMovement.create({
        data: {
          locationId,
          productId,
          movementType: StockMovementType.ADJUSTMENT,
          quantity: adjustmentQuantity,
          unitCost: money(product.buyingPrice),
          unitValue: money(product.buyingPrice),
          movementDate: new Date(),
          sourceType: "MANUAL_STOCK_ADJUSTMENT",
          sourceId: reference,
          sourceLineId: product.sku,
          counterpartyType: `ADMIN_STOCK_${adjustmentDirection}`,
          counterpartyId: reason,
          balanceAfter: newQuantity,
        },
        select: { id: true },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "STOCK_LEVEL_EDIT",
        entityType: "StockMovement",
        entityId: movement.id,
        locationId,
        before: {
          productId,
          productName: product.name,
          locationName: location.name,
          quantity: previousQuantity,
        },
        after: {
          productId,
          productName: product.name,
          locationName: location.name,
          actorUserId: actor.id,
          actorName: actor.name,
          quantity: newQuantity,
          adjustmentQuantity,
          adjustmentDirection,
          reason,
          reference,
        },
      });

      return {
        productName: product.name,
        locationName: location.name,
        previousQuantity,
        newQuantity,
        adjustmentDirection,
        adjustmentQuantity,
      };
    });

    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/stock-movements");
    revalidatePath("/inventory/low-stock");
    revalidatePath("/inventory/out-of-stock");
    revalidatePath("/inventory/stock/details");
    revalidatePath("/admin/audit-logs");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `${result.productName} at ${result.locationName} ${result.adjustmentDirection.toLowerCase()}d from ${result.previousQuantity} to ${result.newQuantity}.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to update stock level right now."),
    };
  }
}