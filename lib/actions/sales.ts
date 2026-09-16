"use server";

import { revalidatePath } from "next/cache";

import {
  LedgerDirection,
  LedgerEntryType,
  PaymentStatus,
  SalePaymentMethod,
  SaleStatus,
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
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import {
  createAuditLog,
  recordStockMovement,
  syncLowStockAlert,
} from "@/lib/services/inventory-ledger";
import { saleSchema, type SaleFormInput, type SaleInput } from "@/lib/validation/sale";

type ParsedSalePayment = NonNullable<SaleInput["payments"]>[number];

function getSalePaidAmountFromInput(data: SaleInput, total: number) {
  if (data.paymentMethod === "CREDIT") return 0;
  if (data.paymentMethod === "CHEQUE") return 0;
  if (data.paymentMethod === "MIXED") {
    return (data.payments ?? []).reduce((sum: number, payment: ParsedSalePayment) => {
      return payment.method === "CASH" || payment.method === "BANK"
        ? sum + Number(payment.amount || 0)
        : sum;
    }, 0);
  }

  return data.amountPaid;
}

function saleUsesCheque(data: SaleInput) {
  return data.paymentMethod === "CHEQUE" || (data.paymentMethod === "MIXED" && (data.payments ?? []).some((payment) => payment.method === "CHEQUE"));
}

export async function getRecentSalesAction(locationId?: string) {
  const actor = await getActionActorByPermission("sales:view");
  if (!actor) return [];

  const sales = await prisma.sale.findMany({
    where: {
      status: "COMPLETED",
      ...(locationId ? { locationId } : {}),
    },
    orderBy: { soldAt: "desc" },
    take: 10,
    select: {
      id: true,
      saleNumber: true,
      total: true,
      soldAt: true,
      customer: { select: { name: true } },
    },
  });

  return sales.map(sale => ({
    ...sale,
    total: Number(sale.total),
  }));
}

export async function createSaleAction(
  input: SaleFormInput,
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("sales:create");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to create sales.",
    };
  }

  const parsed = saleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Sale payload did not validate.",
    };
  }

  const soldAt = parseInputDate(parsed.data.soldAt);

  if (!soldAt) {
    return {
      success: false,
      message: "Sale date is invalid.",
    };
  }

  const customerId = normalizeOptionalString(parsed.data.customerId);
  const financeAccountId = normalizeOptionalString(parsed.data.financeAccountId);
  const note = normalizeOptionalString(parsed.data.note);
  const requiresFinanceAccount = !["CREDIT", "CHEQUE"].includes(parsed.data.paymentMethod);

  if (requiresFinanceAccount && !hasPermission(actor.role, "accounts:use", actor.permissions)) {
    return {
      success: false,
      message: "You are not allowed to use finance accounts for paid sales.",
    };
  }

  try {
    const saleReference = await prisma.$transaction(async (tx) => {
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

      let financeAccounts: any[] = [];
      const requiredAccountIds: string[] = [];

      if (parsed.data.paymentMethod === "CASH" || parsed.data.paymentMethod === "BANK") {
        if (financeAccountId) requiredAccountIds.push(financeAccountId);
      } else if (parsed.data.paymentMethod === "MIXED" && parsed.data.payments) {
        requiredAccountIds.push(...parsed.data.payments.filter(p => ["CASH", "BANK"].includes(p.method)).map((p: any) => p.financeAccountId).filter(Boolean));
      }

      if (requiredAccountIds.length > 0) {
        financeAccounts = await tx.financeAccount.findMany({
          where: {
            id: { in: requiredAccountIds },
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            locationId: true,
            type: true,
          },
        });

        if (financeAccounts.length !== new Set(requiredAccountIds).size) {
          throw new Error("One or more selected finance accounts were not found or are inactive.");
        }

        for (const account of financeAccounts) {
          if (account.locationId && account.locationId !== location.id) {
            throw new Error("Finance accounts must belong to the same location as the sale.");
          }
        }
      }

      if (parsed.data.paymentMethod === "CASH") {
        if (!financeAccounts.find((a: any) => a.type === "CASH")) throw new Error("Cash sales must be posted into a cash account.");
      } else if (parsed.data.paymentMethod === "BANK") {
        if (!financeAccounts.find((a: any) => a.type === "BANK")) throw new Error("Bank sales must be posted into a bank account.");
      } else if (parsed.data.paymentMethod === "MIXED") {
        for (const payment of parsed.data.payments || []) {
           if (["CASH", "BANK"].includes(payment.method)) {
             const account = financeAccounts.find((a: any) => a.id === payment.financeAccountId);
             if (!account) throw new Error(`Missing finance account for ${payment.method} mixed payment.`);
             if (payment.method === "CASH" && account.type !== "CASH") throw new Error("Cash payments must use a cash account.");
             if (payment.method === "BANK" && account.type !== "BANK") throw new Error("Bank payments must use a bank account.");
           }
        }
      }

      if (customerId) {
        const customer = await tx.customer.findUnique({
          where: { id: customerId },
          select: { id: true },
        });

        if (!customer) {
          throw new Error("Selected customer was not found.");
        }
      }

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

      if (products.length !== productIds.length) {
        throw new Error("One or more selected products no longer exist.");
      }

      const productMap = new Map(products.map((product) => [product.id, product]));

      const grossSubtotal = parsed.data.items.reduce((sum, item) => {
        const product = productMap.get(item.productId);
        if (!product) return sum;
        const baseQuantity = item.quantity;
        const unitPrice = item.unitPrice;
        return sum + baseQuantity * unitPrice;
      }, 0);
      const lineDiscountTotal = parsed.data.items.reduce((sum, item) => {
        const product = productMap.get(item.productId);
        if (!product) return sum;
        const baseQuantity = item.quantity;
        return sum + baseQuantity * item.discount;
      }, 0);
      
      const subtotalBeforeGlobalDiscount = grossSubtotal - lineDiscountTotal;
      let globalDiscountTotal = 0;
      
      if (parsed.data.discountType === "PERCENTAGE" && parsed.data.discountRate) {
        globalDiscountTotal = subtotalBeforeGlobalDiscount * (parsed.data.discountRate / 100);
      } else if (parsed.data.discountType === "FIXED" && parsed.data.discountRate) {
        globalDiscountTotal = parsed.data.discountRate;
      }
      
      const discountTotal = lineDiscountTotal + globalDiscountTotal;
      let total = grossSubtotal - discountTotal;
      
      // Rounding Correction: If the difference between calculated total and amountPaid is negligible (< 0.5),
      // we snap the total to the amountPaid to prevent ghost credit balances (like 0.1 ETB) caused by float math.
      if (parsed.data.paymentMethod !== "CREDIT" && parsed.data.paymentMethod !== "MIXED") {
        if (Math.abs(total - parsed.data.amountPaid) < 0.5) {
          total = parsed.data.amountPaid;
        }
      } else if (parsed.data.paymentMethod === "MIXED" && parsed.data.payments && parsed.data.settlementMode === "FULL") {
        const totalPaidMixed = parsed.data.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
        if (Math.abs(total - totalPaidMixed) < 0.5) {
          total = totalPaidMixed;
        }
      }
      
      const isCredit = parsed.data.paymentMethod === "CREDIT";
      const isMixed = parsed.data.paymentMethod === "MIXED";
      const isCheque = parsed.data.paymentMethod === "CHEQUE";
      
      const amountPaid = getSalePaidAmountFromInput(parsed.data, total);
      
      if (amountPaid > total + 0.01) {
        throw new Error(`Amount paid (${amountPaid.toLocaleString()}) cannot exceed the total sale amount (${total.toLocaleString()}).`);
      }

      const amountDue = Math.max(0, total - amountPaid);
      const paymentStatus = amountDue === 0 ? PaymentStatus.PAID : (amountPaid === 0 ? PaymentStatus.UNPAID : PaymentStatus.PARTIAL);

      if (amountDue > 0 && !customerId) {
        throw new Error("A customer must be selected if the sale is not fully paid.");
      }

      if (saleUsesCheque(parsed.data) && !customerId) {
        throw new Error("A customer must be selected for cheque sales.");
      }

      const saleNumber = createDocumentNumber("SAL", soldAt);

      const sale = await tx.sale.create({
        data: {
          saleNumber,
          locationId: location.id,
          ...(customerId ? { customerId } : {}),
          createdById: actor.id,
          status: SaleStatus.COMPLETED,
          paymentMethod: parsed.data.paymentMethod as keyof typeof SalePaymentMethod,
          paymentStatus,
           subtotal: toDecimal(grossSubtotal),
          discountTotal: toDecimal(discountTotal),
          discountType: parsed.data.discountType || null,
          discountRate: parsed.data.discountRate ? toDecimal(parsed.data.discountRate) : null,
          total: toDecimal(total),
          amountPaid: toDecimal(amountPaid),
          amountDue: toDecimal(amountDue),
          soldAt,
          ...(note ? { note } : {}),
        },
        select: {
          id: true,
          saleNumber: true,
        },
      });

      for (const item of parsed.data.items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error("Sale line references an unknown product.");
        }

        const baseQuantity = item.quantity;

        // Verify sufficient stock before deducting
        const stockAgg = await tx.stockMovement.aggregate({
          where: { locationId: location.id, productId: product.id },
          _sum: { quantity: true },
        });
        const currentStock = Number(stockAgg._sum.quantity ?? 0);
        if (currentStock < baseQuantity) {
          throw new Error(`Insufficient stock for "${product.name}". Available: ${currentStock} pcs.`);
        }

        const unitPrice = item.unitPrice;
        const baseDiscount = item.discount;

        const saleItem = await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: product.id,
            quantity: baseQuantity,
            unitPrice: toDecimal(unitPrice),
            discount: toDecimal(baseDiscount),
            discountType: item.discountType || null,
            discountRate: item.discountRate ? toDecimal(item.discountRate) : null,
            lineTotal: toDecimal(baseQuantity * (unitPrice - baseDiscount)),
          },
          select: {
            id: true,
          },
        });

        await recordStockMovement(tx, {
          locationId: location.id,
          productId: product.id,
          movementType: StockMovementType.SALE,
          quantity: -baseQuantity,
          unitValue: toDecimal(unitPrice - baseDiscount),
          movementDate: soldAt,
          sourceType: "Sale",
          sourceId: sale.id,
          sourceLineId: saleItem.id,
          counterpartyType: customerId ? "Customer" : "WalkIn",
          ...(customerId ? { counterpartyId: customerId } : {}),
        });

        await syncLowStockAlert(tx, {
          locationId: location.id,
          productId: product.id,
          threshold: product.minimumStockAlert,
          evaluatedAt: soldAt,
        });
      }

      if (isMixed && parsed.data.payments) {
        for (const payment of parsed.data.payments) {
          if (payment.amount > 0) {
            if (payment.method === "CASH" || payment.method === "BANK") {
              await tx.ledgerEntry.create({
                data: {
                  entryDate: soldAt,
                  locationId: location.id,
                  financeAccountId: payment.financeAccountId!,
                  direction: LedgerDirection.DEBIT,
                  amount: toDecimal(payment.amount),
                  entryType: LedgerEntryType.SALE,
                  referenceType: "Sale",
                  referenceId: sale.id,
                  description: `Sale receipt for ${sale.saleNumber} (${payment.method})`,
                },
              });
            } else if (payment.method === "CHEQUE") {
              await tx.cheque.create({
                data: {
                  chequeNumber: payment.chequeNumber || "N/A",
                  bankName: payment.bankName || "Unknown",
                  amount: toDecimal(payment.amount),
                  chequeDate: payment.chequeDate ? new Date(payment.chequeDate) : soldAt,
                  depositableDate: payment.depositableDate ? new Date(payment.depositableDate) : (payment.chequeDate ? new Date(payment.chequeDate) : soldAt),
                  expiryDate: payment.expiryDate ? new Date(payment.expiryDate) : null,
                  status: "PENDING",
                  customerId: customerId!,
                  saleId: sale.id,
                  locationId: location.id,
                }
              });
            }
          }
        }
      } else if (isCheque) {
        await tx.cheque.create({
          data: {
            chequeNumber: parsed.data.chequeNumber || "N/A",
            bankName: parsed.data.bankName || "Unknown",
            amount: toDecimal(total),
            chequeDate: parsed.data.chequeDate ? new Date(parsed.data.chequeDate) : soldAt,
            depositableDate: parsed.data.depositableDate ? new Date(parsed.data.depositableDate) : (parsed.data.chequeDate ? new Date(parsed.data.chequeDate) : soldAt),
            expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
            status: "PENDING",
            customerId: customerId!,
            saleId: sale.id,
            locationId: location.id,
          }
        });
      } else if (!isCredit) {
        await tx.ledgerEntry.create({
          data: {
            entryDate: soldAt,
            locationId: location.id,
            financeAccountId: financeAccounts[0]?.id ?? null,
            direction: LedgerDirection.DEBIT,
            amount: toDecimal(amountPaid),
            entryType: LedgerEntryType.SALE,
            referenceType: "Sale",
            referenceId: sale.id,
            description: `Sale receipt for ${sale.saleNumber} (${parsed.data.paymentMethod})`,
          },
        });
      }

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "SALE_CREATE",
        entityType: "Sale",
        entityId: sale.id,
        locationId: location.id,
        after: {
          saleNumber: sale.saleNumber,
          locationId: location.id,
          customerId: customerId ?? null,
          subtotal: grossSubtotal,
          discountTotal,
          total,
          paymentMethod: parsed.data.paymentMethod,
          financeAccountId: financeAccounts[0]?.id ?? null,
          financeAccountName: financeAccounts[0]?.name ?? null,
          itemCount: parsed.data.items.length,
        },
      });

      return sale.saleNumber;
    }, { timeout: 90000 });

    revalidatePath("/sales/new");
    revalidatePath("/sales/sales-list");
    revalidatePath("/sales/sold-items");
    revalidatePath("/inventory/stock");
    revalidatePath("/finance/accounts");
    revalidatePath("/finance/cash");
    revalidatePath("/finance/ledger");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Sale ${saleReference} posted successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(
        error,
        "Unable to post the sale right now.",
      ),
    };
  }
}

export async function updateSaleAction(
  input: SaleFormInput,
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("sales:edit");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to update sales.",
    };
  }

  if (!input.id) {
    return {
      success: false,
      message: "Sale ID is required for updates.",
    };
  }

  const parsed = saleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Sale payload did not validate.",
    };
  }

  const soldAt = parseInputDate(parsed.data.soldAt);

  if (!soldAt) {
    return {
      success: false,
      message: "Sale date is invalid.",
    };
  }

  const financeAccountId = normalizeOptionalString(parsed.data.financeAccountId);
  const customerId = normalizeOptionalString(parsed.data.customerId);
  const note = normalizeOptionalString(parsed.data.note);

  try {
    const existing = await prisma.sale.findUnique({
      where: { id: input.id },
      include: { items: true },
    });

    if (!existing) {
      return {
        success: false,
        message: "Original sale record not found.",
      };
    }

    const saleReference = await prisma.$transaction(async (tx) => {
      const location = await tx.location.findUnique({
        where: { id: parsed.data.locationId, isActive: true },
      });

      if (!location) throw new Error("Location not found.");

      const requiredAccountIds = parsed.data.paymentMethod === "MIXED"
        ? (parsed.data.payments || []).filter(p => ["CASH", "BANK"].includes(p.method)).map(p => p.financeAccountId).filter(Boolean) as string[]
        : financeAccountId ? [financeAccountId] : [];

      let financeAccounts: any[] = [];
      if (requiredAccountIds.length > 0) {
        financeAccounts = await tx.financeAccount.findMany({
          where: { id: { in: requiredAccountIds }, isActive: true },
        });

        if (financeAccounts.length !== new Set(requiredAccountIds).size) {
          throw new Error("One or more selected finance accounts were not found.");
        }
      }

      if (customerId) {
        const customer = await tx.customer.findUnique({
          where: { id: customerId },
        });
        if (!customer) throw new Error("Customer not found.");
      }

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

      const productMap = new Map(products.map((p) => [p.id, p]));

      const grossSubtotal = parsed.data.items.reduce((sum, item) => {
        const product = productMap.get(item.productId);
        if (!product) return sum;
        const baseQuantity = item.quantity;
        const unitPrice = item.unitPrice;
        return sum + baseQuantity * unitPrice;
      }, 0);
      const lineDiscountTotal = parsed.data.items.reduce((sum, item) => {
        const product = productMap.get(item.productId);
        if (!product) return sum;
        const baseQuantity = item.quantity;
        return sum + baseQuantity * item.discount;
      }, 0);
      
      const subtotalBeforeGlobalDiscount = grossSubtotal - lineDiscountTotal;
      let globalDiscountTotal = 0;
      
      if (parsed.data.discountType === "PERCENTAGE" && parsed.data.discountRate) {
        globalDiscountTotal = subtotalBeforeGlobalDiscount * (parsed.data.discountRate / 100);
      } else if (parsed.data.discountType === "FIXED" && parsed.data.discountRate) {
        globalDiscountTotal = parsed.data.discountRate;
      }
      
      const discountTotal = lineDiscountTotal + globalDiscountTotal;
      const total = grossSubtotal - discountTotal;
      
      const isCredit = parsed.data.paymentMethod === "CREDIT";
      const isMixed = parsed.data.paymentMethod === "MIXED";
      const isCheque = parsed.data.paymentMethod === "CHEQUE";
      
      const amountPaid = getSalePaidAmountFromInput(parsed.data, total);
      
      if (amountPaid > total + 0.01) {
        throw new Error(`Amount paid (${amountPaid.toLocaleString()}) cannot exceed the total sale amount (${total.toLocaleString()}).`);
      }

      const amountDue = Math.max(0, total - amountPaid);
      const paymentStatus = amountDue === 0 ? PaymentStatus.PAID : (amountPaid === 0 ? PaymentStatus.UNPAID : PaymentStatus.PARTIAL);

      if (amountDue > 0 && !customerId) {
        throw new Error("A customer must be selected if the sale is not fully paid.");
      }

      if (saleUsesCheque(parsed.data) && !customerId) {
        throw new Error("A customer must be selected for cheque sales.");
      }

      // 1. Revert Old State
      await tx.stockMovement.deleteMany({
        where: { sourceType: "Sale", sourceId: existing.id },
      });

      await tx.saleItem.deleteMany({
        where: { saleId: existing.id },
      });

      await tx.ledgerEntry.deleteMany({
        where: { referenceType: "Sale", referenceId: existing.id },
      });

      await tx.cheque.deleteMany({
        where: { saleId: existing.id },
      });

      // 2. Update Header
      const updatedSale = await tx.sale.update({
        where: { id: existing.id },
        data: {
          locationId: parsed.data.locationId,
          customerId: customerId || null,
          paymentMethod: parsed.data.paymentMethod as any,
          paymentStatus,
           subtotal: toDecimal(grossSubtotal),
          discountTotal: toDecimal(discountTotal),
          discountType: parsed.data.discountType || null,
          discountRate: parsed.data.discountRate ? toDecimal(parsed.data.discountRate) : null,
          total: toDecimal(total),
          amountPaid: toDecimal(amountPaid),
          amountDue: toDecimal(amountDue),
          soldAt,
          note: note || null,
        },
        select: {
          id: true,
          saleNumber: true,
        },
      });

      // 3. Re-create Items and Movements
      for (const item of parsed.data.items) {
        const product = productMap.get(item.productId);
        if (!product) throw new Error("Product not found.");

        const baseQuantity = item.quantity;
        // Verify stock
        const stockAgg = await tx.stockMovement.aggregate({
          where: { locationId: parsed.data.locationId, productId: product.id },
          _sum: { quantity: true },
        });
        const currentStock = Number(stockAgg._sum.quantity || 0);
        if (currentStock < baseQuantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${currentStock} pcs.`);
        }

        const unitPrice = item.unitPrice;
        const baseDiscount = item.discount;

        const saleItem = await tx.saleItem.create({
          data: {
            saleId: updatedSale.id,
            productId: product.id,
            quantity: baseQuantity,
            unitPrice: toDecimal(unitPrice),
            discount: toDecimal(baseDiscount),
            discountType: item.discountType || null,
            discountRate: item.discountRate ? toDecimal(item.discountRate) : null,
            lineTotal: toDecimal(baseQuantity * (unitPrice - baseDiscount)),
          },
        });

        await recordStockMovement(tx, {
          locationId: parsed.data.locationId,
          productId: product.id,
          movementType: StockMovementType.SALE,
          quantity: -baseQuantity,
          unitValue: toDecimal(unitPrice - baseDiscount),
          movementDate: soldAt,
          sourceType: "Sale",
          sourceId: updatedSale.id,
          sourceLineId: saleItem.id,
          counterpartyType: customerId ? "Customer" : "Walk-in",
          ...(customerId ? { counterpartyId: customerId } : {}),
        });

        await syncLowStockAlert(tx, {
          locationId: parsed.data.locationId,
          productId: product.id,
          threshold: product.minimumStockAlert,
          evaluatedAt: soldAt,
        });
      }

      // 4. Ledger Entries / Cheques
      if (isMixed && parsed.data.payments) {
        for (const payment of parsed.data.payments) {
          if (payment.amount > 0) {
            if (payment.method === "CASH" || payment.method === "BANK") {
              await tx.ledgerEntry.create({
                data: {
                  entryDate: soldAt,
                  locationId: parsed.data.locationId,
                  financeAccountId: payment.financeAccountId!,
                  direction: LedgerDirection.DEBIT,
                  amount: toDecimal(payment.amount),
                  entryType: LedgerEntryType.SALE,
                  referenceType: "Sale",
                  referenceId: updatedSale.id,
                  description: `Updated sale receipt for ${updatedSale.saleNumber} (${payment.method})`,
                },
              });
            } else if (payment.method === "CHEQUE") {
              await tx.cheque.create({
                data: {
                  chequeNumber: payment.chequeNumber || "N/A",
                  bankName: payment.bankName || "Unknown",
                  amount: toDecimal(payment.amount),
                  chequeDate: payment.chequeDate ? new Date(payment.chequeDate) : soldAt,
                  depositableDate: payment.depositableDate ? new Date(payment.depositableDate) : (payment.chequeDate ? new Date(payment.chequeDate) : soldAt),
                  expiryDate: payment.expiryDate ? new Date(payment.expiryDate) : null,
                  status: "PENDING",
                  customerId: customerId!,
                  saleId: updatedSale.id,
                  locationId: parsed.data.locationId,
                }
              });
            }
          }
        }
      } else if (isCheque) {
        await tx.cheque.create({
          data: {
            chequeNumber: parsed.data.chequeNumber || "N/A",
            bankName: parsed.data.bankName || "Unknown",
            amount: toDecimal(total),
            chequeDate: parsed.data.chequeDate ? new Date(parsed.data.chequeDate) : soldAt,
            depositableDate: parsed.data.depositableDate ? new Date(parsed.data.depositableDate) : (parsed.data.chequeDate ? new Date(parsed.data.chequeDate) : soldAt),
            expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
            status: "PENDING",
            customerId: customerId!,
            saleId: updatedSale.id,
            locationId: parsed.data.locationId,
          }
        });
      } else if (!isCredit) {
        await tx.ledgerEntry.create({
          data: {
            entryDate: soldAt,
            locationId: parsed.data.locationId,
            financeAccountId: financeAccounts[0]?.id ?? null,
            direction: LedgerDirection.DEBIT,
            amount: toDecimal(amountPaid),
            entryType: LedgerEntryType.SALE,
            referenceType: "Sale",
            referenceId: updatedSale.id,
            description: `Updated sale receipt for ${updatedSale.saleNumber} (${parsed.data.paymentMethod})`,
          },
        });
      }

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "SALE_UPDATE",
        entityType: "Sale",
        entityId: updatedSale.id,
        locationId: parsed.data.locationId,
        after: {
          saleNumber: updatedSale.saleNumber,
          total,
          amountPaid,
          itemCount: parsed.data.items.length,
        },
      });

      return updatedSale.saleNumber;
    }, { timeout: 90000 });

    revalidatePath("/sales/new");
    revalidatePath("/sales/sales-list");
    revalidatePath("/sales/sold-items");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Sale ${saleReference} updated successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to update the sale."),
    };
  }
}