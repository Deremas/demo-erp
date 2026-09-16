"use server";

import { revalidatePath } from "next/cache";

import { LedgerDirection, LedgerEntryType, PaymentStatus } from "@/generated/prisma/enums";

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
import { createAuditLog } from "@/lib/services/inventory-ledger";
import {
  supplierPaymentSchema,
  type SupplierPaymentFormInput,
} from "@/lib/validation/supplier-payment";

export async function createSupplierPaymentAction(
  input: SupplierPaymentFormInput,
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("supplier-payments:create");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to record supplier payments.",
    };
  }

  const parsed = supplierPaymentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Supplier payment details are invalid.",
    };
  }

  const paymentDate = parseInputDate(parsed.data.paymentDate);

  if (!paymentDate) {
    return {
      success: false,
      message: "Payment date is invalid.",
    };
  }

  const note = normalizeOptionalString(parsed.data.note);

  try {
    const paymentReference = await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findFirst({
        where: {
          id: parsed.data.purchaseId,
          supplierId: parsed.data.supplierId,
          status: "POSTED",
        },
        select: {
          id: true,
          purchaseNumber: true,
          supplierId: true,
          locationId: true,
          amountDue: true,
          amountPaid: true,
          usdAmountPaid: true,
          exchangeRate: true,
          trackInUsd: true,
        },
      });

      if (!purchase) {
        throw new Error("Selected outstanding purchase was not found.");
      }

      const supplier = await tx.supplier.findFirst({
        where: {
          id: parsed.data.supplierId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (!supplier) {
        throw new Error("Selected supplier was not found.");
      }

      const currentDue = Number(purchase.amountDue);
      const currentUsdDue = purchase.trackInUsd
        ? Math.max(0, currentDue / Number(purchase.exchangeRate || 1))
        : 0;

      if (currentDue <= 0) {
        throw new Error("This purchase has no outstanding balance left to pay.");
      }

      // Handle Mixed Payments vs Simple Payments
      const isUsd = parsed.data.isUsd ?? false;
      const rate = Number(parsed.data.exchangeRate || 1);
      const originalRate = Number(purchase.exchangeRate || 1);

      const totalToPayRaw = parsed.data.settlementMode === "FULL"
        ? (isUsd ? (purchase.trackInUsd ? currentUsdDue : currentDue / rate) : currentDue)
        : parsed.data.amount;
      
      const totalToPayEtb = isUsd ? totalToPayRaw * rate : totalToPayRaw;
      
      // Forex Calculation
      let forexDifference = 0;
      let etbImpactOnBalance = totalToPayEtb;

      if (purchase.trackInUsd && isUsd) {
        // If we are paying in USD for a USD-tracked purchase
        // The impact on the ETB balance is based on the ORIGINAL rate
        etbImpactOnBalance = totalToPayRaw * originalRate;
        forexDifference = totalToPayEtb - etbImpactOnBalance;
      }

      if (etbImpactOnBalance > currentDue + 0.01) {
        throw new Error(
          `Payment exceeds the outstanding supplier balance. Outstanding balance is ${currentDue.toLocaleString()} ETB.`,
        );
      }

      const paymentSplits = parsed.data.paymentMethod === "MIXED" && parsed.data.payments
        ? parsed.data.payments.map(p => ({
            financeAccountId: p.financeAccountId,
            amount: p.amount,
            method: p.method
          }))
        : [{
            financeAccountId: parsed.data.financeAccountId!,
            amount: totalToPayRaw,
            method: parsed.data.paymentMethod as "CASH" | "BANK"
          }];

      const paymentNumbers: string[] = [];
      const paymentIds: string[] = [];

      for (const split of paymentSplits) {
        if (split.amount <= 0) continue;
        const splitEtbAmount = isUsd ? split.amount * rate : split.amount;

        const paymentNumber = createDocumentNumber("SPM", paymentDate);
        const payment = await tx.supplierPayment.create({
          data: {
            paymentNumber,
            supplierId: supplier.id,
            purchaseId: purchase.id,
            locationId: purchase.locationId,
            financeAccountId: split.financeAccountId,
            recordedById: actor.id,
            amount: toDecimal(splitEtbAmount),
            isUsd: parsed.data.isUsd ?? false,
            exchangeRate: parsed.data.exchangeRate ? toDecimal(parsed.data.exchangeRate) : null,
            paymentDate,
            note: [
              note,
              isUsd ? `USD ${split.amount.toLocaleString()} @ ${rate.toLocaleString()} = ETB ${splitEtbAmount.toLocaleString()}` : null,
            ].filter(Boolean).join(" | ") || null,
          },
          select: { id: true, paymentNumber: true },
        });

        if (isUsd) {
          await tx.exchangeRateHistory.create({
            data: {
              currency: "USD",
              rate: toDecimal(rate),
              sourceType: "SupplierPayment",
              sourceId: payment.id,
              recordedById: actor.id,
              note: `Supplier payment ${payment.paymentNumber}: ${split.amount} USD = ${splitEtbAmount} ETB`,
              recordedAt: paymentDate,
            },
          });
        }

        // Actual cash out
        await tx.ledgerEntry.create({
          data: {
            entryDate: paymentDate,
            locationId: purchase.locationId,
            financeAccountId: split.financeAccountId,
            direction: LedgerDirection.CREDIT,
            amount: toDecimal(splitEtbAmount),
            entryType: LedgerEntryType.SUPPLIER_PAYMENT,
            referenceType: "SupplierPayment",
            referenceId: payment.id,
            description: `Supplier payment ${payment.paymentNumber} for ${purchase.purchaseNumber} (${split.method}) ${isUsd ? `(${split.amount} USD @ ${rate}; ETB ${splitEtbAmount.toLocaleString()} deducted)` : ""}`,
            ...(isUsd
              ? {
                  metadata: {
                    currency: "USD",
                    usdAmount: split.amount,
                    exchangeRate: rate,
                    etbDeducted: splitEtbAmount,
                    purchaseOriginalRate: originalRate,
                  },
                }
              : {}),
          },
        });

        paymentNumbers.push(payment.paymentNumber);
        paymentIds.push(payment.id);
      }

      // Record Forex Gain/Loss if any
      if (Math.abs(forexDifference) > 0.01) {
        await tx.ledgerEntry.create({
          data: {
            entryDate: paymentDate,
            locationId: purchase.locationId,
            financeAccountId: paymentSplits[0]?.financeAccountId || parsed.data.financeAccountId!,
            direction: forexDifference > 0 ? LedgerDirection.DEBIT : LedgerDirection.CREDIT,
            amount: toDecimal(Math.abs(forexDifference)),
            entryType: LedgerEntryType.ADJUSTMENT,
            referenceType: "Purchase",
            referenceId: purchase.id,
            description: `Forex ${forexDifference > 0 ? "Loss" : "Gain"} on payment for ${purchase.purchaseNumber}. (Settled @ ${rate}, Original @ ${originalRate})`,
          },
        });
      }

      const nextAmountPaid = Number((Number(purchase.amountPaid) + etbImpactOnBalance).toFixed(2));
      const nextAmountDue = Math.max(0, Number((currentDue - etbImpactOnBalance).toFixed(2)));
      const paymentStatus = nextAmountDue === 0 ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

      await tx.purchase.update({
        where: { id: purchase.id },
        data: {
          amountPaid: toDecimal(nextAmountPaid),
          amountDue: toDecimal(nextAmountDue),
          usdAmountPaid: toDecimal(Number(purchase.usdAmountPaid) + (isUsd ? totalToPayRaw : 0)),
          paymentStatus,
        },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "SUPPLIER_PAYMENT_CREATE",
        entityType: "SupplierPayment",
        entityId: purchase.id, // Linked to purchase
        locationId: purchase.locationId,
        after: {
          paymentNumbers,
          supplierId: supplier.id,
          purchaseId: purchase.id,
          paymentIds,
          totalToPayEtb,
          rateUsed: isUsd ? rate : null,
          forexDifference,
        },
      });

      return paymentNumbers.join(", ");
    });

    revalidatePath("/purchases/suppliers");
    revalidatePath("/purchases/list");
    revalidatePath("/purchases/supplier-payments");
    revalidatePath("/finance/accounts");
    revalidatePath("/finance/cash");
    revalidatePath("/finance/ledger");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Supplier payment ${paymentReference} posted successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(
        error,
        "Unable to record the supplier payment right now.",
      ),
    };
  }
}