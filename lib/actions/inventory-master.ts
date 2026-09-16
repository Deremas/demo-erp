"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/actions/common";
import { getActionActorByPermission, getActionErrorMessage } from "@/lib/actions/common";
import { categorySchema, unitSchema, type CategoryInput, type UnitInput } from "@/lib/validation/inventory-master";
import { createAuditLog } from "@/lib/services/inventory-ledger";

// --- CATEGORIES ---

export async function createCategoryAction(input: CategoryInput): Promise<ActionResult> {
  const actor = await getActionActorByPermission("inventory:create");
  if (!actor) return { success: false, message: "Unauthorized." };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.category.findUnique({ where: { name: parsed.data.name } });
      if (existing) throw new Error("Category already exists.");

      const category = await tx.category.create({
        data: {
          name: parsed.data.name,
          isActive: parsed.data.isActive,
        },
      });
      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "PRODUCT_CREATE", // Reusing for master data
        entityType: "Category",
        entityId: category.id,
        after: category,
      });
      return category;
    });

    revalidatePath("/inventory/categories");
    revalidatePath("/inventory/products");
    return { success: true, message: `Category "${result.name}" created.` };
  } catch (error) {
    return { success: false, message: getActionErrorMessage(error, "Unable to create category.") };
  }
}

export async function updateCategoryAction(input: CategoryInput): Promise<ActionResult> {
  const actor = await getActionActorByPermission("inventory:edit");
  if (!actor) return { success: false, message: "Unauthorized." };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success || !parsed.data.id) return { success: false, message: "Invalid input." };
  const categoryId = parsed.data.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const category = await tx.category.update({
        where: { id: categoryId },
        data: { name: parsed.data.name, isActive: parsed.data.isActive },
      });
      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "PRODUCT_UPDATE",
        entityType: "Category",
        entityId: category.id,
        after: category,
      });
      return category;
    });

    revalidatePath("/inventory/categories");
    revalidatePath("/inventory/products");
    return { success: true, message: `Category "${result.name}" updated.` };
  } catch (error) {
    return { success: false, message: getActionErrorMessage(error, "Unable to update category.") };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const actor = await getActionActorByPermission("inventory:delete");
  if (!actor) return { success: false, message: "Unauthorized." };

  try {
    await prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
      if (!category) throw new Error("Category not found.");
      if (category._count.products > 0) throw new Error("Cannot delete category because it is used by one or more products.");

      await tx.category.delete({ where: { id } });
      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "PRODUCT_DELETE",
        entityType: "Category",
        entityId: category.id,
        before: category,
      });
    });

    revalidatePath("/inventory/categories");
    return { success: true, message: "Category deleted." };
  } catch (error) {
    return { success: false, message: getActionErrorMessage(error, "Unable to delete category.") };
  }
}

// --- UNITS ---

export async function createUnitAction(input: UnitInput): Promise<ActionResult> {
  const actor = await getActionActorByPermission("inventory:create");
  if (!actor) return { success: false, message: "Unauthorized." };

  const parsed = unitSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.unit.findUnique({ where: { name: parsed.data.name.toLowerCase() } });
      if (existing) throw new Error("Unit already exists.");

      const unit = await tx.unit.create({
        data: {
          name: parsed.data.name.toLowerCase(),
          isActive: parsed.data.isActive,
        },
      });
      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "PRODUCT_CREATE",
        entityType: "Unit",
        entityId: unit.id,
        after: unit,
      });
      return unit;
    });

    revalidatePath("/inventory/units");
    revalidatePath("/inventory/products");
    return { success: true, message: `Unit "${result.name}" created.` };
  } catch (error) {
    return { success: false, message: getActionErrorMessage(error, "Unable to create unit.") };
  }
}

export async function updateUnitAction(input: UnitInput): Promise<ActionResult> {
  const actor = await getActionActorByPermission("inventory:edit");
  if (!actor) return { success: false, message: "Unauthorized." };

  const parsed = unitSchema.safeParse(input);
  if (!parsed.success || !parsed.data.id) return { success: false, message: "Invalid input." };
  const unitId = parsed.data.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const unit = await tx.unit.update({
        where: { id: unitId },
        data: { name: parsed.data.name.toLowerCase(), isActive: parsed.data.isActive },
      });
      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "PRODUCT_UPDATE",
        entityType: "Unit",
        entityId: unit.id,
        after: unit,
      });
      return unit;
    });

    revalidatePath("/inventory/units");
    revalidatePath("/inventory/products");
    return { success: true, message: `Unit "${result.name}" updated.` };
  } catch (error) {
    return { success: false, message: getActionErrorMessage(error, "Unable to update unit.") };
  }
}

export async function deleteUnitAction(id: string): Promise<ActionResult> {
  const actor = await getActionActorByPermission("inventory:delete");
  if (!actor) return { success: false, message: "Unauthorized." };

  try {
    await prisma.$transaction(async (tx) => {
      const unit = await tx.unit.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });
      if (!unit) throw new Error("Unit not found.");
      if (unit._count.products > 0) {
        throw new Error("Cannot delete unit because it is used by products.");
      }

      await tx.unit.delete({ where: { id } });
      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "PRODUCT_DELETE",
        entityType: "Unit",
        entityId: unit.id,
        before: unit,
      });
    });

    revalidatePath("/inventory/units");
    return { success: true, message: "Unit deleted." };
  } catch (error) {
    return { success: false, message: getActionErrorMessage(error, "Unable to delete unit.") };
  }
}