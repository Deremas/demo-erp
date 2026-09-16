"use server";

import { revalidatePath } from "next/cache";

import { LedgerDirection, LedgerEntryType } from "@/generated/prisma/enums";

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
import { expenseSchema, type ExpenseFormInput } from "@/lib/validation/expense";

export async function createExpenseAction(
  input: ExpenseFormInput,
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("expenses:create");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to record expenses.",
    };
  }

  const parsed = expenseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Expense details are invalid.",
    };
  }

  const expenseDate = parseInputDate(parsed.data.expenseDate);

  if (!expenseDate) {
    return {
      success: false,
      message: "Expense date is invalid.",
    };
  }

  const note = normalizeOptionalString(parsed.data.note);
  const locationId = parsed.data.locationId || parsed.data.branchId;

  if (!locationId) {
    return { success: false, message: "Select a location." };
  }

  if (!hasPermission(actor.role, "accounts:use", actor.permissions)) {
    return {
      success: false,
      message: "You are not allowed to use payment accounts for expenses.",
    };
  }

  try {
    const expenseReference = await prisma.$transaction(async (tx) => {
      const locationRows = await tx.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM branches
        WHERE id = ${locationId}
        LIMIT 1
      `;

      if (locationRows.length === 0) {
        throw new Error("You do not have access to the selected location.");
      }

      const location = { id: locationRows[0]!.id };

      // Handle Mixed Payments vs Simple Payments
      const paymentSplits = parsed.data.paymentMethod === "MIXED" && parsed.data.payments
        ? parsed.data.payments.map(p => ({
            financeAccountId: p.financeAccountId,
            amount: p.amount,
            method: p.method
          }))
        : [{
            financeAccountId: parsed.data.financeAccountId!,
            amount: parsed.data.amount,
            method: parsed.data.paymentMethod as "CASH" | "BANK"
          }];

      const category = await tx.expenseCategory.upsert({
        where: { name: parsed.data.categoryName },
        update: { isActive: true },
        create: { name: parsed.data.categoryName },
        select: { id: true, name: true },
      });

      const expenseNumbers: string[] = [];

      for (const split of paymentSplits) {
        if (split.amount <= 0) continue;

        const expenseNumber = createDocumentNumber("EXP", expenseDate);
        const expense = await tx.expense.create({
          data: {
            expenseNumber,
            locationId: location.id,
            financeAccountId: split.financeAccountId,
            expenseCategoryId: category.id,
            createdById: actor.id,
            name: parsed.data.name,
            amount: toDecimal(split.amount),
            expenseDate,
            ...(note ? { note } : {}),
          },
          select: { id: true, expenseNumber: true },
        });

        await tx.ledgerEntry.create({
          data: {
            entryDate: expenseDate,
            locationId: location.id,
            financeAccountId: split.financeAccountId,
            direction: LedgerDirection.CREDIT,
            amount: toDecimal(split.amount),
            entryType: LedgerEntryType.EXPENSE,
            referenceType: "Expense",
            referenceId: expense.id,
            description: `Expense ${expense.expenseNumber} - ${parsed.data.name} (${split.method})`,
          },
        });

        expenseNumbers.push(expense.expenseNumber);
      }

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "EXPENSE_CREATE",
        entityType: "Expense",
        entityId: category.id,
        locationId: location.id,
        after: {
          expenseNumbers,
          categoryName: parsed.data.categoryName,
          amount: parsed.data.amount,
          name: parsed.data.name,
        },
      });

      return expenseNumbers.join(", ");
    });

    revalidatePath("/finance/expenses");
    revalidatePath("/finance/accounts");
    revalidatePath("/finance/cash");
    revalidatePath("/finance/ledger");
    revalidatePath("/reports/expense-analysis");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Expense ${expenseReference} posted successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(
        error,
        "Unable to record the expense right now.",
      ),
    };
  }
}