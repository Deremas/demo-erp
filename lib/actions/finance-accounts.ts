"use server";

import { revalidatePath } from "next/cache";

import { LedgerDirection, LedgerEntryType } from "@/generated/prisma/enums";

import type { ActionResult } from "@/lib/actions/common";
import {
  createDocumentNumber,
  getActionActorByPermission,
  getActionErrorMessage,
  normalizeOptionalString,
  toDecimal,
} from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/services/inventory-ledger";
import {
  financeAccountSchema,
  type FinanceAccountFormInput,
} from "@/lib/validation/finance-account";
import { toNumber } from "@/lib/data-runtime-utils";

export async function createFinanceAccountAction(
  input: FinanceAccountFormInput,
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("accounts:create");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to manage finance accounts.",
    };
  }

  const parsed = financeAccountSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Finance account details are invalid.",
    };
  }

  const accountName =
    parsed.data.type === "CASH" ? "Cash" : parsed.data.name?.trim() ?? "";
  const bankName =
    parsed.data.type === "BANK" ? normalizeOptionalString(parsed.data.bankName) : null;
  const accountNumber =
    parsed.data.type === "BANK"
      ? normalizeOptionalString(parsed.data.accountNumber)
      : null;

  try {
    const accountReference = await prisma.$transaction(async (tx) => {
      if (parsed.data.type === "CASH") {
        const existingCashAccount = await tx.financeAccount.findFirst({
          where: {
            locationId: null,
            type: "CASH",
            isActive: true,
          },
          select: {
            id: true,
          },
        });

        if (existingCashAccount) {
          throw new Error(
            "A central cash account already exists. Use that one for all locations.",
          );
        }
      } else {
        const duplicateBankAccount = await tx.financeAccount.findFirst({
          where: {
            locationId: null,
            type: "BANK",
            isActive: true,
            bankName: bankName ?? null,
            accountNumber: accountNumber ?? null,
          },
          select: {
            id: true,
          },
        });

        if (duplicateBankAccount) {
          throw new Error("This central bank account already exists.");
        }
      }

      const code = createDocumentNumber(parsed.data.type === "BANK" ? "BNK" : "CSH");

      const account = await tx.financeAccount.create({
        data: {
          code,
          name: accountName,
          type: parsed.data.type,
          ...(bankName ? { bankName } : {}),
          ...(accountNumber ? { accountNumber } : {}),
        },
        select: {
          id: true,
          code: true,
          name: true,
          type: true,
        },
      });

      if (parsed.data.initialBalance > 0) {
        await tx.ledgerEntry.create({
          data: {
            entryDate: new Date(),
            financeAccountId: account.id,
            direction: LedgerDirection.DEBIT,
            amount: toDecimal(parsed.data.initialBalance),
            entryType: LedgerEntryType.OPENING_BALANCE,
            referenceType: "FinanceAccount",
            referenceId: account.id,
            description: `Opening balance for ${account.name}`,
          },
        });
      }

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "FINANCE_ACCOUNT_CREATE",
        entityType: "FinanceAccount",
        entityId: account.id,
        after: {
          code: account.code,
          name: account.name,
          type: account.type,
          bankName: bankName ?? null,
          accountNumber: accountNumber ?? null,
          initialBalance: parsed.data.initialBalance,
        },
      });

      return account.code;
    });

    revalidatePath("/finance/accounts");
    revalidatePath("/finance/cash");
    revalidatePath("/finance/ledger");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Finance account ${accountReference} created successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(
        error,
        "Unable to create the finance account right now.",
      ),
    };
  }
}

export async function updateFinanceAccountAction(
  id: string,
  input: FinanceAccountFormInput,
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("accounts:edit");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to manage finance accounts.",
    };
  }

  const parsed = financeAccountSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Finance account details are invalid.",
    };
  }

  const accountName =
    parsed.data.type === "CASH" ? "Cash" : parsed.data.name?.trim() ?? "";
  const bankName =
    parsed.data.type === "BANK" ? normalizeOptionalString(parsed.data.bankName) : null;
  const accountNumber =
    parsed.data.type === "BANK"
      ? normalizeOptionalString(parsed.data.accountNumber)
      : null;

  try {
    const accountReference = await prisma.$transaction(async (tx) => {
      const existingAccount = await tx.financeAccount.findFirst({
        where: { id, isActive: true },
        select: {
          id: true,
          code: true,
          type: true,
          name: true,
          bankName: true,
          accountNumber: true,
          locationId: true,
          ledgerEntries: {
            where: {
              entryType: LedgerEntryType.OPENING_BALANCE,
              referenceType: "FinanceAccount",
            },
            select: {
              id: true,
              amount: true,
              direction: true,
            },
          },
        },
      });

      if (!existingAccount) {
        throw new Error("Finance account not found.");
      }

      if (existingAccount.locationId) {
        throw new Error("Only central accounts can be edited from this page.");
      }

      if (existingAccount.type !== parsed.data.type) {
        throw new Error("Account type cannot be changed after creation.");
      }

      if (parsed.data.type === "BANK") {
        const duplicateBankAccount = await tx.financeAccount.findFirst({
          where: {
            id: { not: id },
            locationId: null,
            type: "BANK",
            isActive: true,
            bankName: bankName ?? null,
            accountNumber: accountNumber ?? null,
          },
          select: { id: true },
        });

        if (duplicateBankAccount) {
          throw new Error("This central bank account already exists.");
        }
      }

      const account = await tx.financeAccount.update({
        where: { id },
        data: {
          name: accountName,
          ...(parsed.data.type === "BANK"
            ? { bankName: bankName ?? null, accountNumber: accountNumber ?? null }
            : { bankName: null, accountNumber: null }),
        },
        select: {
          id: true,
          code: true,
          name: true,
          type: true,
          bankName: true,
          accountNumber: true,
        },
      });

      const previousOpeningBalance = existingAccount.ledgerEntries.reduce((sum, entry) => {
        const amount = toNumber(entry.amount);
        return entry.direction === LedgerDirection.DEBIT ? sum + amount : sum - amount;
      }, 0);
      const nextOpeningBalance = parsed.data.initialBalance;
      const openingBalanceChanged =
        Math.round(previousOpeningBalance * 100) !== Math.round(nextOpeningBalance * 100);

      if (openingBalanceChanged) {
        const [primaryOpeningEntry, ...extraOpeningEntries] = existingAccount.ledgerEntries;

        if (nextOpeningBalance > 0) {
          if (primaryOpeningEntry) {
            await tx.ledgerEntry.update({
              where: { id: primaryOpeningEntry.id },
              data: {
                entryDate: new Date(),
                direction: LedgerDirection.DEBIT,
                amount: toDecimal(nextOpeningBalance),
                description: `Opening balance for ${account.name}`,
              },
            });

            if (extraOpeningEntries.length > 0) {
              await tx.ledgerEntry.deleteMany({
                where: { id: { in: extraOpeningEntries.map((entry) => entry.id) } },
              });
            }
          } else {
            await tx.ledgerEntry.create({
              data: {
                entryDate: new Date(),
                financeAccountId: account.id,
                direction: LedgerDirection.DEBIT,
                amount: toDecimal(nextOpeningBalance),
                entryType: LedgerEntryType.OPENING_BALANCE,
                referenceType: "FinanceAccount",
                referenceId: account.id,
                description: `Opening balance for ${account.name}`,
              },
            });
          }
        } else if (existingAccount.ledgerEntries.length > 0) {
          await tx.ledgerEntry.deleteMany({
            where: { id: { in: existingAccount.ledgerEntries.map((entry) => entry.id) } },
          });
        }
      }

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "FINANCE_ACCOUNT_UPDATE",
        entityType: "FinanceAccount",
        entityId: account.id,
        before: {
          name: existingAccount.name,
          bankName: existingAccount.bankName,
          accountNumber: existingAccount.accountNumber,
          openingBalance: previousOpeningBalance,
        },
        after: {
          name: account.name,
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          openingBalance: nextOpeningBalance,
        },
      });

      return account.code;
    });

    revalidatePath("/finance/accounts");
    revalidatePath(`/finance/accounts/${id}`);
    revalidatePath("/finance/cash");
    revalidatePath("/finance/ledger");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Finance account ${accountReference} updated successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(
        error,
        "Unable to update the finance account right now.",
      ),
    };
  }
}

export async function deleteFinanceAccountAction(
  id: string,
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("accounts:delete");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to manage finance accounts.",
    };
  }

  try {
    const account = await prisma.$transaction(async (tx) => {
      const existingAccount = await tx.financeAccount.findFirst({
        where: {
          id,
          isActive: true,
        },
        select: {
          id: true,
          code: true,
          name: true,
          type: true,
          bankName: true,
          accountNumber: true,
          locationId: true,
        },
      });

      if (!existingAccount) {
        throw new Error("Finance account not found.");
      }

      // If it's a location-specific account, verify access
      if (existingAccount.locationId) {
        const assignments = await tx.$queryRaw<{ id: string }[]>`
          SELECT "userId" as id
          FROM user_branches
          WHERE "userId" = ${actor.id}
          AND "locationId" = ${existingAccount.locationId}
          AND "isActive" = true
          LIMIT 1
        `;

        if (assignments.length === 0) {
          throw new Error("You do not have access to this account's location.");
        }
      }

      // Fetch ledger entries separately to check for transactions
      const ledgerEntries = await tx.ledgerEntry.findMany({
        where: { financeAccountId: existingAccount.id },
        select: {
          id: true,
          amount: true,
          entryType: true,
        },
      });

      const hasMeaningfulLedger = ledgerEntries.some(
        (entry) =>
          entry.entryType !== LedgerEntryType.OPENING_BALANCE ||
          Number(entry.amount) !== 0,
      );

      if (hasMeaningfulLedger) {
        throw new Error(
          "Cannot delete account with posted transactions. Keep it for financial history.",
        );
      }

      await tx.ledgerEntry.deleteMany({
        where: {
          financeAccountId: existingAccount.id,
          entryType: LedgerEntryType.OPENING_BALANCE,
          amount: 0,
        },
      });

      await tx.financeAccount.delete({
        where: { id },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "FINANCE_ACCOUNT_DELETE",
        entityType: "FinanceAccount",
        entityId: existingAccount.id,
        ...(existingAccount.locationId ? { locationId: existingAccount.locationId } : {}),
        before: {
          code: existingAccount.code,
          name: existingAccount.name,
          type: existingAccount.type,
          bankName: existingAccount.bankName,
          accountNumber: existingAccount.accountNumber,
        },
      });

      return existingAccount;
    });

    revalidatePath("/finance/accounts");
    revalidatePath("/finance/cash");
    revalidatePath("/finance/ledger");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Finance account ${account.code} deleted successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(
        error,
        "Unable to delete the finance account right now.",
      ),
    };
  }
}