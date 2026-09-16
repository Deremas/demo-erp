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
import { hasPermission } from "@/lib/rbac";
import { createAuditLog } from "@/lib/services/inventory-ledger";
import {
  customerPaymentSchema,
  type CustomerPaymentFormInput,
} from "@/lib/validation/customer-payment";

export async function createCustomerPaymentAction(
  input: CustomerPaymentFormInput,
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("customer-payments:create");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to record customer payments.",
    };
  }

  const parsed = customerPaymentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Customer payment details are invalid.",
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

  if (!hasPermission(actor.role, "accounts:use", actor.permissions)) {
    return {
      success: false,
      message: "You are not allowed to use payment accounts for customer payments.",
    };
  }

  try {
    const paymentReference = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({
        where: {
          id: parsed.data.customerId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (!customer) {
        throw new Error("Selected customer was not found.");
      }

      const userLocations = await tx.$queryRaw<{ locationId: string }[]>`
        SELECT "locationId"
        FROM user_branches
        WHERE "userId" = ${actor.id}
        AND "isActive" = true
      `;
      const userLocationIds = userLocations.map((l) => l.locationId);

      const sales = await tx.sale.findMany({
        where: {
          customerId: customer.id,
          status: "COMPLETED",
          amountDue: {
            gt: 0,
          },
          ...(parsed.data.settlementTarget === "SINGLE" && parsed.data.saleId
            ? { id: parsed.data.saleId }
            : {}),
          locationId: {
            in: userLocationIds,
          },
        },
        orderBy: [{ soldAt: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          saleNumber: true,
          customerId: true,
          locationId: true,
          amountDue: true,
          amountPaid: true,
        },
      });

      if (sales.length === 0) {
        throw new Error(
          parsed.data.settlementTarget === "ALL"
            ? "No outstanding credit sales were found for this customer."
            : "Selected credit sale was not found.",
        );
      }

      const totalDue = Number(
        sales.reduce((sum, sale) => sum + Number(sale.amountDue), 0).toFixed(2),
      );
      const totalToPay = parsed.data.settlementMode === "FULL" ? totalDue : parsed.data.amount;

      if (totalToPay > totalDue) {
        throw new Error("Payment amount cannot exceed the outstanding balance.");
      }

      // Handle Mixed Payments vs Simple Payments
      const paymentSplits = parsed.data.paymentMethod === "MIXED" && parsed.data.payments
        ? parsed.data.payments.map(p => ({
            financeAccountId: p.financeAccountId,
            amount: p.amount,
            method: p.method
          }))
        : [{
            financeAccountId: parsed.data.financeAccountId!,
            amount: totalToPay,
            method: parsed.data.paymentMethod as "CASH" | "BANK"
          }];

      const paymentNumbers: string[] = [];
      let remainingSplitPool = [...paymentSplits];

      for (const sale of sales) {
        if (remainingSplitPool.length === 0 || remainingSplitPool.every(p => p.amount <= 0)) {
          break;
        }

        let saleRemainingDue = Number(sale.amountDue);
        
        for (const split of remainingSplitPool) {
          if (saleRemainingDue <= 0 || split.amount <= 0) continue;

          const allocatedFromSplit = Number(Math.min(saleRemainingDue, split.amount).toFixed(2));
          if (allocatedFromSplit <= 0) continue;

          const paymentNumber = createDocumentNumber("CPM", paymentDate);
          const payment = await tx.customerPayment.create({
            data: {
              paymentNumber,
              customerId: customer.id,
              saleId: sale.id,
              locationId: sale.locationId,
              financeAccountId: split.financeAccountId,
              recordedById: actor.id,
              amount: toDecimal(allocatedFromSplit),
              paymentDate,
              ...(note ? { note } : {}),
            },
            select: { id: true, paymentNumber: true },
          });

          await tx.ledgerEntry.create({
            data: {
              entryDate: paymentDate,
              locationId: sale.locationId,
              financeAccountId: split.financeAccountId,
              direction: LedgerDirection.DEBIT,
              amount: toDecimal(allocatedFromSplit),
              entryType: LedgerEntryType.CUSTOMER_PAYMENT,
              referenceType: "CustomerPayment",
              referenceId: payment.id,
              description: `Customer payment ${payment.paymentNumber} for ${sale.saleNumber} (${split.method})`,
            },
          });

          saleRemainingDue = Number((saleRemainingDue - allocatedFromSplit).toFixed(2));
          split.amount = Number((split.amount - allocatedFromSplit).toFixed(2));
          paymentNumbers.push(payment.paymentNumber);
        }

        const nextAmountPaid = Number((Number(sale.amountPaid) + (Number(sale.amountDue) - saleRemainingDue)).toFixed(2));
        const nextAmountDue = saleRemainingDue;
        const paymentStatus = nextAmountDue === 0 ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

        await tx.sale.update({
          where: { id: sale.id },
          data: {
            amountPaid: toDecimal(nextAmountPaid),
            amountDue: toDecimal(nextAmountDue),
            paymentStatus,
          },
        });
      }

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "CUSTOMER_PAYMENT_CREATE",
        entityType: "CustomerPayment",
        entityId: customer.id,
        ...(sales[0]?.locationId ? { locationId: sales[0].locationId } : {}),
        after: {
          paymentNumbers,
          customerId: customer.id,
          totalToPay,
        },
      });

      return paymentNumbers.length === 1
        ? paymentNumbers[0]
        : `${paymentNumbers.length} payments`;
    });

    revalidatePath("/sales/customers");
    revalidatePath("/sales/customer-credit");
    revalidatePath("/sales/customer-payments");
    revalidatePath("/sales/sales-list");
    revalidatePath("/finance/accounts");
    revalidatePath("/finance/cash");
    revalidatePath("/finance/ledger");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Customer payment ${paymentReference} posted successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(
        error,
        "Unable to record the customer payment right now.",
      ),
    };
  }
}