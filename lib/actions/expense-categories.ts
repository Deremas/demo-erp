"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/lib/actions/common";
import { getActionActorByPermission, getActionErrorMessage } from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/services/inventory-ledger";
import { expenseCategorySchema, type ExpenseCategoryFormInput } from "@/lib/validation/expense-category";

export async function createExpenseCategoryAction(
  input: ExpenseCategoryFormInput,
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("settings:manage");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to create expense categories.",
    };
  }

  const parsed = expenseCategorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Details are invalid.",
    };
  }

  const name = parsed.data.name.trim();

  try {
    const categoryName = await prisma.$transaction(async (tx) => {
      const existing = await tx.expenseCategory.findUnique({
        where: { name },
        select: { id: true },
      });

      if (existing) {
        throw new Error("A category with this name already exists.");
      }

      const category = await tx.expenseCategory.create({
        data: {
          name,
          isActive: true,
        },
        select: { id: true, name: true },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "EXPENSE_CATEGORY_CREATE",
        entityType: "ExpenseCategory",
        entityId: category.id,
        after: { name: category.name },
      });

      return category.name;
    });

    revalidatePath("/finance/expenses/categories");
    revalidatePath("/finance/expenses");

    return {
      success: true,
      message: `Category "${categoryName}" created successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to create category."),
    };
  }
}

export async function updateExpenseCategoryAction(
  input: ExpenseCategoryFormInput,
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("settings:manage");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to update expense categories.",
    };
  }

  const parsed = expenseCategorySchema.safeParse(input);

  if (!parsed.success || !parsed.data.id) {
    return {
      success: false,
      message: "Category details are invalid.",
    };
  }

  const name = parsed.data.name.trim();
  const id = parsed.data.id;

  try {
    await prisma.$transaction(async (tx) => {
      const category = await tx.expenseCategory.findUnique({
        where: { id },
      });

      if (!category) throw new Error("Category not found.");

      const existing = await tx.expenseCategory.findFirst({
        where: { name, id: { not: id } },
      });

      if (existing) throw new Error("Another category with this name already exists.");

      await tx.expenseCategory.update({
        where: { id },
        data: { name, isActive: parsed.data.isActive },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "EXPENSE_CATEGORY_UPDATE",
        entityType: "ExpenseCategory",
        entityId: id,
        before: { name: category.name, isActive: category.isActive },
        after: { name, isActive: parsed.data.isActive },
      });
    });

    revalidatePath("/finance/expenses/categories");
    revalidatePath("/finance/expenses");

    return {
      success: true,
      message: `Category updated successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to update category."),
    };
  }
}

export async function deleteExpenseCategoryAction(input: {
  id: string;
}): Promise<ActionResult> {
  const actor = await getActionActorByPermission("settings:manage");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to delete expense categories.",
    };
  }

  try {
    const name = await prisma.$transaction(async (tx) => {
      const category = await tx.expenseCategory.findUnique({
        where: { id: input.id },
        include: { _count: { select: { expenses: true } } },
      });

      if (!category) throw new Error("Category not found.");

      if (category._count.expenses > 0) {
        throw new Error("This category is already in use and cannot be deleted. Deactivate it instead.");
      }

      await tx.expenseCategory.delete({ where: { id: input.id } });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "EXPENSE_CATEGORY_DELETE",
        entityType: "ExpenseCategory",
        entityId: input.id,
        before: { name: category.name },
      });

      return category.name;
    });

    revalidatePath("/finance/expenses/categories");
    return {
      success: true,
      message: `Category "${name}" deleted successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to delete category."),
    };
  }
}