"use server";

import { revalidatePath } from "next/cache";

import {
  LedgerDirection,
  LedgerEntryType,
  PaymentStatus,
  PurchaseStatus,
  StockMovementType,
} from "@/generated/prisma/enums";

import type { ActionResult } from "@/lib/actions/common";
import {
  createDocumentNumber,
  getActionActorByPermission,
  getActionErrorMessage,
  normalizeOptionalString,
  parseInputDate,
  toDecimal,
} from "@/lib/actions/common";
import { toNumber } from "@/lib/data-runtime-utils";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import {
  createAuditLog,
  recordStockMovement,
  syncLowStockAlert,
} from "@/lib/services/inventory-ledger";
import {
  purchaseSchema,
  type PurchaseFormInput,
} from "@/lib/validation/purchase";

type ProductForPurchase = {
  id: string;
  name: string;
  minimumStockAlert: number;
  unitId: string;
  sellingPrice: any; // Using any for Decimal compatibility
};

type PriceUpdate = {
  productId: string;
  buyingPrice: number;
  sellingPrice: number;
};

type AlertCheck = {
  locationId: string;
  productId: string;
  threshold: number;
};

function calculateBaseQuantity(input: {
  quantity: number;
  product: ProductForPurchase;
}) {
  return input.quantity;
}

function calculatePriceUpdate(input: {
  product: ProductForPurchase;
  unitCost: number;
  sellingPrice: number;
}): PriceUpdate {
  return {
    productId: input.product.id,
    buyingPrice: Number(input.unitCost.toFixed(4)),
    sellingPrice: Number(input.sellingPrice.toFixed(4)),
  };
}

export async function createPurchaseAction(
  input: PurchaseFormInput,
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("purchases:create");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to create purchases.",
    };
  }

  const parsed = purchaseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Purchase payload did not validate.",
    };
  }

  const purchasedAt = parseInputDate(parsed.data.purchasedAt);

  if (!purchasedAt) {
    return {
      success: false,
      message: "Purchase date is invalid.",
    };
  }

  const paymentAccountId = normalizeOptionalString(parsed.data.paymentAccountId);
  const supplierId = normalizeOptionalString(parsed.data.supplierId);
  const note = normalizeOptionalString(parsed.data.note);

  if (
    parsed.data.settlementMode !== "UNPAID" &&
    !hasPermission(actor.role, "accounts:use", actor.permissions)
  ) {
    return {
      success: false,
      message: "You are not allowed to use payment accounts for purchases.",
    };
  }

  try {
    const purchaseReference = await prisma.$transaction(async (tx) => {
      const locationRows = await tx.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM branches
        WHERE id = ${parsed.data.locationId}
        LIMIT 1
      `;

      if (locationRows.length === 0) {
        throw new Error("You do not have access to the selected location.");
      }

      const location = { id: locationRows[0]!.id };

      const supplier = supplierId
        ? await tx.supplier.findUnique({
            where: { id: supplierId },
            select: { id: true, name: true },
          })
        : null;

      if (supplierId && !supplier) {
        throw new Error("Selected supplier was not found.");
      }

      if (!supplier && parsed.data.settlementMode !== "FULL") {
        throw new Error(
          "Choose a supplier for unpaid or partial purchases so the balance can be settled later.",
        );
      }

      const paymentAccount = paymentAccountId
        ? await tx.financeAccount.findUnique({
            where: { id: paymentAccountId },
            select: { id: true, name: true, locationId: true },
          })
        : null;


      if (paymentAccountId && !paymentAccount) {
        throw new Error("Selected payment account was not found.");
      }

      if (
        parsed.data.settlementMode !== "UNPAID" &&
        paymentAccount &&
        paymentAccount.locationId &&
        paymentAccount.locationId !== location.id
      ) {
        throw new Error(
          "Payment account must belong to the same location as the purchase.",
        );
      }

      const productIds = [
        ...new Set(parsed.data.items.map((item) => item.productId)),
      ];
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          minimumStockAlert: true,
          unitId: true,
          sellingPrice: true,
        },
      });

      if (products.length !== productIds.length) {
        throw new Error("One or more selected products no longer exist.");
      }

      const productMap = new Map(
        products.map((product) => [product.id, product as ProductForPurchase]),
      );
      const isUsd = parsed.data.isUsd ?? false;
      const rate = parsed.data.exchangeRate || 1;

      const rawSubtotal = parsed.data.items.reduce(
        (sum, item) => sum + item.quantity * item.unitCost,
        0,
      );

      const subtotalEtb = isUsd ? rawSubtotal * rate : rawSubtotal;
      const usdTotal = isUsd ? rawSubtotal : 0;

      const paymentsArray = parsed.data.settlementMode === "UNPAID" ? [] : (parsed.data.payments ?? []);
      const rawAmountPaid = paymentsArray.reduce((sum, p) => sum + p.amount, 0);

      const amountPaidEtb = isUsd ? rawAmountPaid * rate : rawAmountPaid;
      const amountDueEtb = Math.max(0, Number((subtotalEtb - amountPaidEtb).toFixed(2)));

      const paymentStatus =
        amountPaidEtb <= 0
          ? PaymentStatus.UNPAID
          : amountDueEtb === 0
            ? PaymentStatus.PAID
            : PaymentStatus.PARTIAL;
      const purchaseNumber = createDocumentNumber("PUR", purchasedAt);
      const priceUpdates: PriceUpdate[] = [];
      const alertChecks: AlertCheck[] = [];

      const purchase = await tx.purchase.create({
        data: {
          purchaseNumber,
          locationId: location.id,
          ...(supplier ? { supplierId: supplier.id } : {}),
          createdById: actor.id,
          status: PurchaseStatus.POSTED,
          paymentStatus,
          subtotal: toDecimal(subtotalEtb),
          discount: toDecimal(0),
          tax: toDecimal(0),
          total: toDecimal(subtotalEtb),
          amountPaid: toDecimal(amountPaidEtb),
          amountDue: toDecimal(amountDueEtb),
          trackInUsd: isUsd,
          exchangeRate: toDecimal(rate),
          usdTotal: toDecimal(usdTotal),
          usdAmountPaid: toDecimal(isUsd ? rawAmountPaid : 0),
          purchasedAt,
          ...(note ? { note } : {}),
        },
        select: {
          id: true,
          purchaseNumber: true,
        },
      });

      if (isUsd) {
        await tx.exchangeRateHistory.create({
          data: {
            currency: "USD",
            rate: toDecimal(rate),
            sourceType: "Purchase",
            sourceId: purchase.id,
            recordedById: actor.id,
            note: `Purchase ${purchase.purchaseNumber}: ${usdTotal} USD = ${subtotalEtb} ETB`,
            recordedAt: purchasedAt,
          },
        });
      }

      for (const item of parsed.data.items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error("Purchase line references an unknown product.");
        }

        const baseQuantity = calculateBaseQuantity({
          quantity: item.quantity,
          product,
        });
        const unitCostEtb = isUsd ? item.unitCost * rate : item.unitCost;

        const purchaseItem = await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            productId: product.id,
            quantity: item.quantity,
            unitCost: toDecimal(unitCostEtb),
            sellingPrice: toDecimal(item.sellingPrice),
            lineTotal: toDecimal(item.quantity * unitCostEtb),
          },
          select: {
            id: true,
          },
        });

        await recordStockMovement(tx, {
          locationId: location.id,
          productId: product.id,
          movementType: StockMovementType.PURCHASE,
          quantity: baseQuantity,
          unitCost: toDecimal(Number(unitCostEtb.toFixed(4))),
          unitValue: toDecimal(Number(item.sellingPrice.toFixed(4))),
          movementDate: purchasedAt,
          sourceType: "Purchase",
          sourceId: purchase.id,
          sourceLineId: purchaseItem.id,
          counterpartyType: supplier ? "Supplier" : "DirectPurchase",
          ...(supplier ? { counterpartyId: supplier.id } : {}),
        });

        priceUpdates.push(
          calculatePriceUpdate({
            product,
            unitCost: unitCostEtb,
            sellingPrice: item.sellingPrice,
          }),
        );
        alertChecks.push({
          locationId: location.id,
          productId: product.id,
          threshold: product.minimumStockAlert,
        });
      }

      // Handle Payments — use the payments array directly
      const paymentsToProcess = paymentsArray;

      for (const p of paymentsToProcess) {
        if (p.amount <= 0) continue;
        const paymentAmountEtb = isUsd ? p.amount * rate : p.amount;

        const pAccount = await tx.financeAccount.findUnique({
          where: { id: p.financeAccountId },
          select: { id: true, name: true, locationId: true },
        });

        if (!pAccount) {
          throw new Error(`Payment account ${p.financeAccountId} not found.`);
        }

        if (
          pAccount.locationId &&
          pAccount.locationId !== location.id
        ) {
          throw new Error(
            `Account ${pAccount.name} must belong to the same location as the purchase.`,
          );
        }

        const supplierPayment = await tx.supplierPayment.create({
          data: {
            paymentNumber: createDocumentNumber("SPM", purchasedAt),
            supplierId: supplier!.id,
            purchaseId: purchase.id,
            locationId: location.id,
            financeAccountId: pAccount.id,
            recordedById: actor.id,
            amount: toDecimal(paymentAmountEtb),
            isUsd,
            exchangeRate: toDecimal(rate),
            paymentDate: purchasedAt,
            note: `Initial ${p.method.toLowerCase()} payment for ${purchase.purchaseNumber}. ${isUsd ? `(${p.amount} USD @ ${rate}; ETB ${paymentAmountEtb.toLocaleString()} deducted)` : ""}`,
          },
          select: {
            id: true,
            paymentNumber: true,
          },
        });

        if (isUsd) {
          await tx.exchangeRateHistory.create({
            data: {
              currency: "USD",
              rate: toDecimal(rate),
              sourceType: "SupplierPayment",
              sourceId: supplierPayment.id,
              recordedById: actor.id,
              note: `Initial supplier payment for ${purchase.purchaseNumber}: ${p.amount} USD = ${paymentAmountEtb} ETB`,
              recordedAt: purchasedAt,
            },
          });
        }

        await tx.ledgerEntry.create({
          data: {
            entryDate: purchasedAt,
            locationId: location.id,
            financeAccountId: pAccount.id,
            direction: LedgerDirection.CREDIT,
            amount: toDecimal(paymentAmountEtb),
            entryType: LedgerEntryType.SUPPLIER_PAYMENT,
            referenceType: "SupplierPayment",
            referenceId: supplierPayment.id,
            description: `Supplier payment ${supplierPayment.paymentNumber} for ${purchase.purchaseNumber}${isUsd ? ` (${p.amount} USD @ ${rate}; ETB ${paymentAmountEtb.toLocaleString()} deducted)` : ""}`,
            ...(isUsd
              ? {
                  metadata: {
                    currency: "USD",
                    usdAmount: p.amount,
                    exchangeRate: rate,
                    etbDeducted: paymentAmountEtb,
                  },
                }
              : {}),
          },
        });
      }

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "PURCHASE_CREATE",
        entityType: "Purchase",
        entityId: purchase.id,
        locationId: location.id,
        after: {
          purchaseNumber: purchase.purchaseNumber,
          locationId: location.id,
          supplierId: supplier?.id ?? null,
          total: subtotalEtb,
          paymentStatus,
          amountPaid: amountPaidEtb,
          amountDue: amountDueEtb,
          itemCount: parsed.data.items.length,
        },
      });

      return {
        purchaseNumber: purchase.purchaseNumber,
        priceUpdates,
        alertChecks,
      };
    }, { timeout: 90000 });

    for (const update of purchaseReference.priceUpdates) {
      await prisma.product.update({
        where: { id: update.productId },
        data: {
          buyingPrice: toDecimal(update.buyingPrice),
          sellingPrice: toDecimal(update.sellingPrice),
        },
      });
    }

    for (const alert of purchaseReference.alertChecks) {
      await prisma.$transaction((tx) =>
        syncLowStockAlert(tx, {
          locationId: alert.locationId,
          productId: alert.productId,
          threshold: alert.threshold,
          evaluatedAt: purchasedAt,
        }),
      );
    }

    revalidatePath("/purchases/list");
    revalidatePath("/purchases/new");
    revalidatePath("/purchases/suppliers");
    revalidatePath("/purchases/supplier-payments");
    revalidatePath("/finance/accounts");
    revalidatePath("/finance/cash");
    revalidatePath("/finance/ledger");
    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/low-stock");
    revalidatePath("/inventory/out-of-stock");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Purchase ${purchaseReference.purchaseNumber} posted successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(
        error,
        "Unable to post the purchase right now.",
      ),
    };
  }
}

export async function updatePurchaseAction(
  input: PurchaseFormInput,
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("purchases:create");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to update purchases.",
    };
  }

  if (!input.id) {
    return {
      success: false,
      message: "Purchase ID is required for updates.",
    };
  }

  const parsed = purchaseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Purchase payload did not validate.",
    };
  }

  const purchasedAt = parseInputDate(parsed.data.purchasedAt);

  if (!purchasedAt) {
    return {
      success: false,
      message: "Purchase date is invalid.",
    };
  }

  const paymentAccountId = normalizeOptionalString(parsed.data.paymentAccountId);
  const supplierId = normalizeOptionalString(parsed.data.supplierId);
  const note = normalizeOptionalString(parsed.data.note);

  try {
    const existing = await prisma.purchase.findUnique({
      where: { id: input.id },
      include: { items: true },
    });

    if (!existing) {
      return {
        success: false,
        message: "Original purchase record not found.",
      };
    }

    const purchaseReference = await prisma.$transaction(async (tx) => {
      const location = await tx.location.findUnique({
        where: { id: parsed.data.locationId, isActive: true },
      });

      if (!location) throw new Error("Target location not found.");

      const supplier = supplierId
        ? await tx.supplier.findUnique({
            where: { id: supplierId, isActive: true },
          })
        : null;

      const paymentAccount = paymentAccountId
        ? await tx.financeAccount.findUnique({
            where: { id: paymentAccountId, isActive: true },
          })
        : null;

      const productIds = [...new Set(parsed.data.items.map((item) => item.productId))];
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          minimumStockAlert: true,
          unitId: true,
          sellingPrice: true,
        },
      });

      const productMap = new Map(products.map((p) => [p.id, p as ProductForPurchase]));

      const isUsd = parsed.data.isUsd ?? false;
      const rate = parsed.data.exchangeRate || 1;

      const rawSubtotal = parsed.data.items.reduce(
        (sum, item) => sum + item.quantity * item.unitCost,
        0,
      );

      const subtotalEtb = isUsd ? rawSubtotal * rate : rawSubtotal;
      const usdTotal = isUsd ? rawSubtotal : 0;

      const rawAmountPaid =
        parsed.data.settlementMode === "UNPAID"
          ? 0
          : parsed.data.settlementMode === "FULL"
            ? rawSubtotal
            : parsed.data.amountPaid;

      const amountPaidEtb = isUsd ? rawAmountPaid * rate : rawAmountPaid;
      const amountDueEtb = Math.max(0, Number((subtotalEtb - amountPaidEtb).toFixed(2)));

      const paymentStatus =
        amountPaidEtb <= 0
          ? PaymentStatus.UNPAID
          : amountDueEtb === 0
            ? PaymentStatus.PAID
            : PaymentStatus.PARTIAL;

      // 1. Revert Old State
      await tx.stockMovement.deleteMany({
        where: { sourceType: "Purchase", sourceId: existing.id },
      });

      await tx.purchaseItem.deleteMany({
        where: { purchaseId: existing.id },
      });

      // 2. Update Header
      const updatedPurchase = await tx.purchase.update({
        where: { id: existing.id },
        data: {
          locationId: location.id,
          supplierId: supplier?.id || null,
          financeAccountId: paymentAccount?.id || null,
          status: PurchaseStatus.POSTED,
          paymentStatus,
          subtotal: toDecimal(subtotalEtb),
          total: toDecimal(subtotalEtb),
          amountPaid: toDecimal(amountPaidEtb),
          amountDue: toDecimal(amountDueEtb),
          trackInUsd: isUsd,
          exchangeRate: toDecimal(rate),
          usdTotal: toDecimal(usdTotal),
          usdAmountPaid: toDecimal(isUsd ? rawAmountPaid : 0),
          purchasedAt,
          note: note || null,
        },
        select: {
          id: true,
          purchaseNumber: true,
        },
      });

      if (isUsd) {
        await tx.exchangeRateHistory.create({
          data: {
            currency: "USD",
            rate: toDecimal(rate),
            sourceType: "Purchase",
            sourceId: updatedPurchase.id,
            recordedById: actor.id,
            note: `Updated purchase ${updatedPurchase.purchaseNumber}: ${usdTotal} USD = ${subtotalEtb} ETB`,
            recordedAt: purchasedAt,
          },
        });
      }

      const priceUpdates: PriceUpdate[] = [];
      const alertChecks: AlertCheck[] = [];

      // 3. Re-create Items
      for (const item of parsed.data.items) {
        const product = productMap.get(item.productId);
        if (!product) throw new Error("Unknown product in lines.");

        const baseQuantity = calculateBaseQuantity({ quantity: item.quantity, product });
        const unitCostEtb = isUsd ? item.unitCost * rate : item.unitCost;

        const purchaseItem = await tx.purchaseItem.create({
          data: {
            purchaseId: updatedPurchase.id,
            productId: product.id,
            quantity: item.quantity,
            unitCost: toDecimal(unitCostEtb),
            sellingPrice: toDecimal(item.sellingPrice),
            lineTotal: toDecimal(item.quantity * unitCostEtb),
          },
        });

        await recordStockMovement(tx, {
          locationId: location.id,
          productId: product.id,
          movementType: StockMovementType.PURCHASE,
          quantity: baseQuantity,
          unitCost: toDecimal(Number(unitCostEtb.toFixed(4))),
          unitValue: toDecimal(Number(item.sellingPrice.toFixed(4))),
          movementDate: purchasedAt,
          sourceType: "Purchase",
          sourceId: updatedPurchase.id,
          sourceLineId: purchaseItem.id,
          counterpartyType: "Supplier",
          counterpartyId: supplierId || null,
        });

        priceUpdates.push(
          calculatePriceUpdate({
            product,
            unitCost: unitCostEtb,
            sellingPrice: item.sellingPrice,
          }),
        );

        alertChecks.push({
          locationId: location.id,
          productId: product.id,
          threshold: product.minimumStockAlert,
        });
      }

      return {
        purchaseNumber: updatedPurchase.purchaseNumber,
        priceUpdates,
        alertChecks,
      };
    }, { timeout: 90000 });

    for (const update of purchaseReference.priceUpdates) {
      await prisma.product.update({
        where: { id: update.productId },
        data: {
          buyingPrice: toDecimal(update.buyingPrice),
          sellingPrice: toDecimal(update.sellingPrice),
        },
      });
    }

    for (const alert of purchaseReference.alertChecks) {
      await prisma.$transaction((tx) =>
        syncLowStockAlert(tx, {
          locationId: alert.locationId,
          productId: alert.productId,
          threshold: alert.threshold,
          evaluatedAt: purchasedAt,
        }),
      );
    }

    revalidatePath("/purchases/list");
    revalidatePath("/purchases/new");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Purchase ${purchaseReference.purchaseNumber} updated successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to update the purchase."),
    };
  }
}