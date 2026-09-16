"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActionActorByPermission, getActionErrorMessage } from "./common";
import { LedgerDirection, LedgerEntryType, PaymentStatus } from "@/generated/prisma/enums";
import { toDecimal } from "./helpers";
import { createAuditLog } from "@/lib/services/inventory-ledger";

export async function clearChequeAction(chequeId: string, financeAccountId: string, clearedDate: Date) {
  const actor = await getActionActorByPermission("cheques:manage");
  if (!actor) return { success: false, message: "Unauthorized." };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const cheque = await tx.cheque.findUnique({
        where: { id: chequeId },
        include: { location: true, sale: true }
      });

      if (!cheque) throw new Error("Cheque not found.");
      if (cheque.status !== "PENDING") throw new Error(`Cheque is already ${cheque.status.toLowerCase()}.`);

      // Enforce depositable date check
      const clearDay = new Date(clearedDate).setHours(0, 0, 0, 0);
      const depDay = new Date(cheque.depositableDate).setHours(0, 0, 0, 0);
      if (clearDay < depDay) {
        throw new Error(`Cannot clear cheque before its depositable date (${cheque.depositableDate.toDateString()}).`);
      }

      const account = await tx.financeAccount.findUnique({
        where: { id: financeAccountId }
      });

      if (!account) throw new Error("Selected bank account not found.");
      if (!account.isActive) throw new Error("Selected bank account is inactive.");
      if (account.type !== "BANK") throw new Error("Cheques can only be cleared into a bank account.");
      if (account.locationId && account.locationId !== cheque.locationId) {
        throw new Error("Bank account must belong to the same location as the cheque.");
      }

      // Enforce bank matching (if account has a bank name specified)
      if (account.bankName && cheque.bankName) {
        const accountBank = account.bankName.toLowerCase().replace(/[^a-z]/g, "");
        const chequeBank = cheque.bankName.toLowerCase().replace(/[^a-z]/g, "");
        
        // Check for partial matches to be flexible but safe (e.g. "CBE" matches "Commercial Bank of Ethiopia")
        if (!accountBank.includes(chequeBank) && !chequeBank.includes(accountBank)) {
          throw new Error(`Bank mismatch: Cannot deposit a ${cheque.bankName} cheque into a ${account.bankName} account.`);
        }
      }

      const statusUpdate = await tx.cheque.updateMany({
        where: { id: chequeId, status: "PENDING" },
        data: {
          status: "CLEARED",
          clearedDate: clearedDate,
          financeAccountId: financeAccountId,
        }
      });

      if (statusUpdate.count !== 1) {
        throw new Error("Cheque has already been cleared or is no longer pending.");
      }

      const updatedCheque = await tx.cheque.findUniqueOrThrow({
        where: { id: chequeId },
      });

      // 2. Create Ledger Entry
      await tx.ledgerEntry.create({
        data: {
          entryDate: clearedDate,
          locationId: cheque.locationId,
          financeAccountId: financeAccountId,
          direction: LedgerDirection.DEBIT,
          amount: cheque.amount,
          entryType: LedgerEntryType.SALE, 
          referenceType: "Cheque",
          referenceId: cheque.id,
          description: `Cheque clearing: ${cheque.chequeNumber} (${cheque.bankName})`,
        }
      });

      if (cheque.sale) {
        const nextAmountPaid = Math.min(
          Number(cheque.sale.total),
          Number(cheque.sale.amountPaid) + Number(cheque.amount),
        );
        const nextAmountDue = Math.max(0, Number(cheque.sale.total) - nextAmountPaid);

        await tx.sale.update({
          where: { id: cheque.sale.id },
          data: {
            amountPaid: toDecimal(nextAmountPaid),
            amountDue: toDecimal(nextAmountDue),
            paymentStatus: nextAmountDue === 0
              ? PaymentStatus.PAID
              : nextAmountPaid === 0
                ? PaymentStatus.UNPAID
                : PaymentStatus.PARTIAL,
          },
        });
      }

      // 3. Audit Log
      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "CHEQUE_CLEAR",
        entityType: "Cheque",
        entityId: cheque.id,
        locationId: cheque.locationId,
        before: { status: "PENDING" },
        after: { status: "CLEARED", financeAccountId }
      });

      return updatedCheque;
    });

    revalidatePath("/finance/cheques");
    revalidatePath("/finance/ledger");
    revalidatePath("/finance/accounts");
    revalidatePath("/sales/sales-list");
    revalidatePath("/sales/customer-credit");
    revalidatePath("/dashboard");
    
    return { success: true, message: `Cheque ${result.chequeNumber} cleared successfully.` };
  } catch (error) {
    return { success: false, message: getActionErrorMessage(error, "Failed to clear cheque.") };
  }
}

export async function bounceChequeAction(chequeId: string, notes?: string) {
  const actor = await getActionActorByPermission("cheques:manage");
  if (!actor) return { success: false, message: "Unauthorized." };

  try {
    await prisma.$transaction(async (tx) => {
      const cheque = await tx.cheque.findUnique({ where: { id: chequeId } });
      if (!cheque) throw new Error("Cheque not found.");

      await tx.cheque.update({
        where: { id: chequeId },
        data: {
          status: "BOUNCED",
          notes: notes || null,
        }
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "CHEQUE_BOUNCE",
        entityType: "Cheque",
        entityId: chequeId,
        locationId: cheque.locationId,
        before: { status: cheque.status },
        after: { status: "BOUNCED", notes }
      });
    });

    revalidatePath("/finance/cheques");
    return { success: true, message: "Cheque marked as bounced." };
  } catch (error) {
    return { success: false, message: getActionErrorMessage(error, "Failed to update cheque status.") };
  }
}

export async function cancelChequeAction(chequeId: string) {
  const actor = await getActionActorByPermission("cheques:manage");
  if (!actor) return { success: false, message: "Unauthorized." };

  try {
    await prisma.$transaction(async (tx) => {
      const cheque = await tx.cheque.findUnique({ where: { id: chequeId } });
      if (!cheque) throw new Error("Cheque not found.");

      await tx.cheque.update({
        where: { id: chequeId },
        data: {
          status: "CANCELLED",
        }
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "CHEQUE_CANCEL",
        entityType: "Cheque",
        entityId: chequeId,
        locationId: cheque.locationId,
        before: { status: cheque.status },
        after: { status: "CANCELLED" }
      });
    });

    revalidatePath("/finance/cheques");
    return { success: true, message: "Cheque cancelled." };
  } catch (error) {
    return { success: false, message: getActionErrorMessage(error, "Failed to cancel cheque.") };
  }
}