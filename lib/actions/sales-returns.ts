"use server";

import { revalidatePath } from "next/cache";

import {
  LedgerDirection,
  LedgerEntryType,
  SaleStatus,
  StockMovementType,
} from "@/generated/prisma/enums";
import type { ActionResult } from "@/lib/actions/common";
import {
  createDocumentNumber,
  getActionActorByPermission,
  getActionErrorMessage,
  normalizeOptionalString,
  toDecimal,
} from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import {
  createAuditLog,
  recordStockMovement,
  syncLowStockAlert,
} from "@/lib/services/inventory-ledger";
import { salesReturnSchema, type SalesReturnInput } from "@/lib/validation/sales-return";

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function getLineValue(quantity: number, unitPrice: unknown, discount: unknown) {
  return Number((quantity * Math.max(0, toNumber(unitPrice) - toNumber(discount))).toFixed(2));
}

function packageSplitForReturnedQuantity(_item: { quantity: number }, returnQuantity: number) {
  return { quantity: returnQuantity };
}

export async function createSalesReturnAction(input: SalesReturnInput): Promise<ActionResult> {
  const actor = await getActionActorByPermission("sales.return.create");

  if (!actor) {
    return { success: false, message: "You are not allowed to create sales returns." };
  }

  const parsed = salesReturnSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Return payload did not validate.",
    };
  }

  const financeAccountId = normalizeOptionalString(parsed.data.financeAccountId);
  const reason = normalizeOptionalString(parsed.data.reason);

  if (parsed.data.returnType === "FULL_RETURN" && !hasPermission(actor.role, "sales.return.full", actor.permissions)) {
    return { success: false, message: "You are not allowed to create full sales returns." };
  }

  if (parsed.data.returnType === "PARTIAL_RETURN" && !hasPermission(actor.role, "sales.return.partial", actor.permissions)) {
    return { success: false, message: "You are not allowed to create partial sales returns." };
  }

  if (parsed.data.returnType === "EXCHANGE" && !hasPermission(actor.role, "sales.exchange.create", actor.permissions)) {
    return { success: false, message: "You are not allowed to create sales exchanges." };
  }

  try {
    const returnNumber = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: parsed.data.saleId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  minimumStockAlert: true,
                  unitId: true,
                },
              },
            },
          },
        },
      });

      if (!sale) {
        throw new Error("Sale was not found.");
      }

      const canAccessLocation = actor.role === "ADMIN" || actor.locations.some((location) => location.id === sale.locationId);
      if (!canAccessLocation) {
        throw new Error("You do not have access to this sale location.");
      }

      if (sale.status === SaleStatus.DRAFT || sale.status === SaleStatus.VOIDED) {
        throw new Error("Draft or voided sales cannot be returned.");
      }

      if (sale.status === SaleStatus.RETURNED || sale.status === SaleStatus.EXCHANGED) {
        throw new Error("This sale has already been fully returned or exchanged.");
      }

      const previousReturns = await tx.salesReturnItem.groupBy({
        by: ["originalSaleItemId"],
        where: {
          originalSaleItemId: { in: sale.items.map((item) => item.id) },
          salesReturn: { status: "COMPLETED" },
        },
        _sum: { quantity: true },
      });

      const returnedBySaleItem = new Map(previousReturns.map((row) => [row.originalSaleItemId, row._sum.quantity ?? 0]));
      const saleItemById = new Map(sale.items.map((item) => [item.id, item]));
      const requestedReturnItems =
        parsed.data.returnType === "FULL_RETURN"
          ? sale.items
              .map((item) => ({
                originalSaleItemId: item.id,
                quantity: item.quantity - (returnedBySaleItem.get(item.id) ?? 0),
              }))
              .filter((item) => item.quantity > 0)
          : parsed.data.returnItems;

      if (requestedReturnItems.length === 0) {
        throw new Error("There are no remaining items to return on this sale.");
      }

      const normalizedReturnItems = requestedReturnItems.map((item) => {
        const saleItem = saleItemById.get(item.originalSaleItemId);
        if (!saleItem) {
          throw new Error("Returned item does not belong to this sale.");
        }

        const alreadyReturned = returnedBySaleItem.get(saleItem.id) ?? 0;
        const returnable = saleItem.quantity - alreadyReturned;
        if (item.quantity > returnable) {
          throw new Error(`Cannot return ${item.quantity} of ${saleItem.product.name}. Returnable quantity is ${returnable}.`);
        }

        return { saleItem, quantity: item.quantity };
      });

      const exchangeProductIds = [...new Set(parsed.data.exchangeItems.map((item) => item.productId))];
      const exchangeProducts = exchangeProductIds.length
        ? await tx.product.findMany({
            where: { id: { in: exchangeProductIds }, isActive: true },
            select: {
              id: true,
              name: true,
              minimumStockAlert: true,
              unitId: true,
            },
          })
        : [];
      const exchangeProductById = new Map(exchangeProducts.map((product) => [product.id, product]));
      const requestedExchangeQuantityByProduct = new Map<string, number>();
      for (const item of parsed.data.exchangeItems) {
        requestedExchangeQuantityByProduct.set(
          item.productId,
          (requestedExchangeQuantityByProduct.get(item.productId) ?? 0) + item.quantity,
        );
      }

      for (const [productId, requestedQuantity] of requestedExchangeQuantityByProduct) {
        const product = exchangeProductById.get(productId);
        if (!product) {
          throw new Error("One or more exchange items were not found or are inactive.");
        }

        const stock = await tx.stockMovement.aggregate({
          where: { locationId: sale.locationId, productId: product.id },
          _sum: { quantity: true },
        });
        const currentStock = stock._sum.quantity ?? 0;
        if (currentStock < requestedQuantity) {
          throw new Error(`Insufficient stock for exchange item "${product.name}". Available: ${currentStock}.`);
        }
      }

      const returnedAmount = normalizedReturnItems.reduce(
        (sum, item) => sum + getLineValue(item.quantity, item.saleItem.unitPrice, item.saleItem.discount),
        0,
      );
      const exchangeAmount = parsed.data.exchangeItems.reduce(
        (sum, item) => sum + getLineValue(item.quantity, item.unitPrice, item.discount),
        0,
      );
      const differenceAmount = Number((exchangeAmount - returnedAmount).toFixed(2));
      const amountCollected = Math.max(0, differenceAmount);
      const amountRefunded = Math.max(0, -differenceAmount);
      const refundMethod = parsed.data.refundMethod ?? (parsed.data.returnType === "EXCHANGE" ? "EXCHANGE" : undefined);

      if (differenceAmount === 0 && refundMethod !== "EXCHANGE") {
        throw new Error("An even exchange must be recorded without a cash or bank movement.");
      }

      if (differenceAmount !== 0 && !["CASH", "BANK"].includes(refundMethod ?? "")) {
        throw new Error("Choose cash or bank to settle the return or exchange amount.");
      }

      if (differenceAmount !== 0 && !financeAccountId) {
        throw new Error("Select the cash or bank account used to settle the amount.");
      }

      if (financeAccountId) {
        const financeAccount = await tx.financeAccount.findFirst({
          where: {
            id: financeAccountId,
            isActive: true,
            OR: [{ locationId: sale.locationId }, { locationId: null }],
          },
          select: { type: true },
        });
        if (!financeAccount) {
          throw new Error("The selected finance account is inactive or unavailable for this sale location.");
        }
        if (refundMethod === "CASH" && financeAccount.type !== "CASH") {
          throw new Error("Cash settlement must use an active cash account.");
        }
        if (refundMethod === "BANK" && financeAccount.type !== "BANK") {
          throw new Error("Bank settlement must use an active bank account.");
        }
      }

      const now = new Date();
      const nextReturnNumber = createDocumentNumber(parsed.data.returnType === "EXCHANGE" ? "EXC" : "RET", now);
      const salesReturn = await tx.salesReturn.create({
        data: {
          returnNumber: nextReturnNumber,
          saleId: sale.id,
          locationId: sale.locationId,
          customerId: sale.customerId,
          createdById: actor.id,
          returnType: parsed.data.returnType,
          refundMethod: refundMethod ?? null,
          returnedAmount: toDecimal(returnedAmount),
          exchangeAmount: toDecimal(exchangeAmount),
          differenceAmount: toDecimal(differenceAmount),
          amountRefunded: toDecimal(amountRefunded),
          amountCollected: toDecimal(amountCollected),
          returnedAt: now,
          ...(reason ? { reason } : {}),
        },
        select: { id: true, returnNumber: true },
      });

      for (const item of normalizedReturnItems) {
        const split = packageSplitForReturnedQuantity(item.saleItem, item.quantity);
        const lineTotal = getLineValue(item.quantity, item.saleItem.unitPrice, item.saleItem.discount);
        const returnItem = await tx.salesReturnItem.create({
          data: {
            salesReturnId: salesReturn.id,
            originalSaleItemId: item.saleItem.id,
            productId: item.saleItem.productId,
            quantity: item.quantity,
            unitPrice: item.saleItem.unitPrice,
            discount: item.saleItem.discount,
            lineTotal: toDecimal(lineTotal),
          },
          select: { id: true },
        });

        await recordStockMovement(tx, {
          locationId: sale.locationId,
          productId: item.saleItem.productId,
          movementType: StockMovementType.CUSTOMER_RETURN,
          quantity: item.quantity,
          unitValue: item.saleItem.unitPrice,
          movementDate: now,
          sourceType: "SALES_RETURN",
          sourceId: salesReturn.id,
          sourceLineId: returnItem.id,
          counterpartyType: sale.customerId ? "Customer" : "WalkIn",
          ...(sale.customerId ? { counterpartyId: sale.customerId } : {}),
        });
      }

      for (const item of parsed.data.exchangeItems) {
        const product = exchangeProductById.get(item.productId)!;
        const lineTotal = getLineValue(item.quantity, item.unitPrice, item.discount);
        const exchangeItem = await tx.salesExchangeItem.create({
          data: {
            salesReturnId: salesReturn.id,
            productId: product.id,
            quantity: item.quantity,
            unitPrice: toDecimal(item.unitPrice),
            discount: toDecimal(item.discount),
            lineTotal: toDecimal(lineTotal),
          },
          select: { id: true },
        });

        await recordStockMovement(tx, {
          locationId: sale.locationId,
          productId: product.id,
          movementType: StockMovementType.SALE_EXCHANGE_OUT,
          quantity: -item.quantity,
          unitValue: toDecimal(Math.max(0, item.unitPrice - item.discount)),
          movementDate: now,
          sourceType: "SALES_EXCHANGE",
          sourceId: salesReturn.id,
          sourceLineId: exchangeItem.id,
          counterpartyType: sale.customerId ? "Customer" : "WalkIn",
          ...(sale.customerId ? { counterpartyId: sale.customerId } : {}),
        });

        await syncLowStockAlert(tx, {
          locationId: sale.locationId,
          productId: product.id,
          threshold: product.minimumStockAlert,
          evaluatedAt: now,
        });
      }

      if (financeAccountId && amountCollected > 0) {
        await tx.ledgerEntry.create({
          data: {
            entryDate: now,
            locationId: sale.locationId,
            financeAccountId,
            direction: LedgerDirection.DEBIT,
            amount: toDecimal(amountCollected),
            entryType: LedgerEntryType.SALES_EXCHANGE,
            referenceType: "SALES_EXCHANGE",
            referenceId: salesReturn.id,
            description: `Exchange collection for ${sale.saleNumber} (${salesReturn.returnNumber})`,
            metadata: {
              saleNumber: sale.saleNumber,
              returnNumber: salesReturn.returnNumber,
              returnedAmount,
              exchangeAmount,
              differenceAmount,
              settlementMethod: refundMethod,
              settlementDirection: "CUSTOMER_PAYS",
            },
          },
        });
      }

      if (financeAccountId && amountRefunded > 0) {
        await tx.ledgerEntry.create({
          data: {
            entryDate: now,
            locationId: sale.locationId,
            financeAccountId,
            direction: LedgerDirection.CREDIT,
            amount: toDecimal(amountRefunded),
            entryType: parsed.data.returnType === "EXCHANGE" ? LedgerEntryType.SALES_EXCHANGE : LedgerEntryType.SALES_RETURN,
            referenceType: parsed.data.returnType === "EXCHANGE" ? "SALES_EXCHANGE" : "SALES_RETURN",
            referenceId: salesReturn.id,
            description: `Customer refund for ${sale.saleNumber} (${salesReturn.returnNumber})`,
            metadata: {
              saleNumber: sale.saleNumber,
              returnNumber: salesReturn.returnNumber,
              returnedAmount,
              exchangeAmount,
              differenceAmount,
              settlementMethod: refundMethod,
              settlementDirection: "CUSTOMER_REFUND",
            },
          },
        });
      }

      const returnedAfterThis = new Map(returnedBySaleItem);
      for (const item of normalizedReturnItems) {
        returnedAfterThis.set(item.saleItem.id, (returnedAfterThis.get(item.saleItem.id) ?? 0) + item.quantity);
      }
      const fullyReturned = sale.items.every((item) => (returnedAfterThis.get(item.id) ?? 0) >= item.quantity);
      const hasExchangeItems = parsed.data.exchangeItems.length > 0;
      const nextStatus = fullyReturned
        ? hasExchangeItems
          ? SaleStatus.EXCHANGED
          : SaleStatus.RETURNED
        : hasExchangeItems
          ? SaleStatus.PARTIALLY_EXCHANGED
          : SaleStatus.PARTIALLY_RETURNED;

      await tx.sale.update({
        where: { id: sale.id },
        data: { status: nextStatus },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action:
          parsed.data.returnType === "FULL_RETURN"
            ? "SALE_FULL_RETURN_CREATED"
            : parsed.data.returnType === "EXCHANGE"
              ? "SALE_EXCHANGE_CREATED"
              : "SALE_PARTIAL_RETURN_CREATED",
        entityType: "SalesReturn",
        entityId: salesReturn.id,
        locationId: sale.locationId,
        before: {
          saleStatus: sale.status,
          saleNumber: sale.saleNumber,
        },
        after: {
          saleStatus: nextStatus,
          returnNumber: salesReturn.returnNumber,
          returnType: parsed.data.returnType,
          returnedAmount,
          exchangeAmount,
          differenceAmount,
          amountRefunded,
          amountCollected,
          settlementMethod: refundMethod,
          financeAccountId,
          returnedItems: normalizedReturnItems.length,
          exchangeItems: parsed.data.exchangeItems.length,
        },
      });

      return salesReturn.returnNumber;
    }, { timeout: 90000 });

    revalidatePath("/sales/sales-list");
    revalidatePath(`/sales/sales-list/${parsed.data.saleId}`);
    revalidatePath("/sales/sold-items");
    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/stock-movements");
    revalidatePath("/finance/accounts");
    revalidatePath("/finance/ledger");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Sales return ${returnNumber} created successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to create the sales return right now."),
    };
  }
}