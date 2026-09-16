"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/actions/common";
import {
  getActionActorByPermission,
  getActionErrorMessage,
  normalizeOptionalString,
} from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/services/inventory-ledger";
import {
  productDeleteSchema,
  productUpdateSchema,
  productSchema,
  type ProductDeleteInput,
  type ProductInput,
  type ProductUpdateInput,
} from "@/lib/validation/product";

function buildItemSkuSeed(name: string) {
  const seed = name.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return seed.slice(0, 6) || "ITEM";
}

async function upsertCategoryByName(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  name: string | undefined,
) {
  const normalized = normalizeOptionalString(name);

  if (!normalized) {
    return null;
  }

  return tx.category.upsert({
    where: { name: normalized },
    update: { isActive: true },
    create: { name: normalized, isActive: true },
    select: { id: true, name: true },
  });
}

async function upsertBrandByName(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  name: string | undefined,
) {
  const normalized = normalizeOptionalString(name);

  if (!normalized) {
    return null;
  }

  return tx.brand.upsert({
    where: { name: normalized },
    update: { isActive: true },
    create: { name: normalized, isActive: true },
    select: { id: true, name: true },
  });
}

async function upsertUnitByName(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  name: string,
) {
  const normalized = name.trim().toLowerCase();

  return tx.unit.upsert({
    where: { name: normalized },
    update: { isActive: true },
    create: { name: normalized, isActive: true },
    select: { id: true, name: true },
  });
}

async function generateUniqueItemSku(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  name: string,
) {
  const base = buildItemSkuSeed(name);

  while (true) {
    const candidate = `ITM-${base}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const existing = await tx.product.findUnique({
      where: { sku: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }
}

async function ensureItemSku(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  inputSku: string | undefined,
  name: string,
  currentProductId?: string,
) {
  const normalized = normalizeOptionalString(inputSku)?.toUpperCase();

  if (!normalized) {
    return currentProductId ? undefined : generateUniqueItemSku(tx, name);
  }

  const existing = await tx.product.findFirst({
    where: {
      sku: {
        equals: normalized,
        mode: "insensitive",
      },
      ...(currentProductId ? { id: { not: currentProductId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    throw new Error("Another item already uses that Item Code / SKU.");
  }

  return normalized;
}

export async function createProductAction(
  input: ProductInput,
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("inventory:create");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to create items.",
    };
  }

  const parsed = productSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Item details are invalid.",
    };
  }

  const name = parsed.data.name.trim();
  const sku = normalizeOptionalString(parsed.data.sku);
  const description = normalizeOptionalString(parsed.data.description);

  try {
    const itemName = await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
        },
      });

      if (existing) {
        throw new Error("An item with that name already exists.");
      }

      const finalSku = await ensureItemSku(tx, sku, name);
      
      const category = await tx.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true, name: true } });
      if (!category) throw new Error("Selected category does not exist.");

      const brand = parsed.data.brandId ? await tx.brand.findUnique({ where: { id: parsed.data.brandId }, select: { id: true, name: true } }) : null;
      const company = parsed.data.companyId ? await tx.company.findUnique({ where: { id: parsed.data.companyId }, select: { id: true, name: true } }) : null;
      
      const unit = await tx.unit.findUnique({ where: { id: parsed.data.unitId }, select: { id: true, name: true } });
      if (!unit) throw new Error("Selected unit does not exist.");

      const product = await tx.product.create({
        data: {
          name,
          sku: finalSku!,
          ...(category ? { categoryId: category.id } : {}),
          ...(brand ? { brandId: brand.id } : {}),
          ...(company ? { companyId: company.id } : {}),
          unitId: unit.id,
          buyingPrice: parsed.data.buyingPrice ?? 0,
          sellingPrice: parsed.data.sellingPrice ?? 0,
          minimumStockAlert: parsed.data.minimumStockAlert,
          ...(description ? { description } : {}),
          isActive: true,
        },
        select: {
          id: true,
          sku: true,
          name: true,
          unitId: true,
          buyingPrice: true,
          sellingPrice: true,
        },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "PRODUCT_CREATE",
        entityType: "Product",
        entityId: product.id,
        after: {
          name: product.name,
          sku: product.sku,
          unitId: product.unitId,
          buyingPrice: product.buyingPrice,
          sellingPrice: product.sellingPrice,
          category: category?.name ?? null,
          brand: brand?.name ?? null,
        },
      });

      return product.name;
    });

    revalidatePath("/inventory/products");
    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/low-stock");
    revalidatePath("/inventory/out-of-stock");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `${itemName} created successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to create the item right now."),
    };
  }
}

export async function updateProductAction(
  input: ProductUpdateInput,
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("inventory:edit");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to update items.",
    };
  }

  const parsed = productUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Item details are invalid.",
    };
  }

  const name = parsed.data.name.trim();
  const sku = normalizeOptionalString(parsed.data.sku);
  const description = normalizeOptionalString(parsed.data.description);

  try {
    const itemName = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id: parsed.data.id,
        },
        select: {
          id: true,
          name: true,
          sku: true,
        },
      });

      if (!product) {
        throw new Error("Selected item was not found.");
      }

      const conflicting = await tx.product.findFirst({
        where: {
          id: {
            not: product.id,
          },
          name: {
            equals: name,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
        },
      });

      if (conflicting) {
        throw new Error("Another item with that name already exists.");
      }

      const category = await tx.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true, name: true } });
      if (!category) throw new Error("Selected category does not exist.");

      const brand = parsed.data.brandId ? await tx.brand.findUnique({ where: { id: parsed.data.brandId }, select: { id: true, name: true } }) : null;
      const company = parsed.data.companyId ? await tx.company.findUnique({ where: { id: parsed.data.companyId }, select: { id: true, name: true } }) : null;
      
      const unit = await tx.unit.findUnique({ where: { id: parsed.data.unitId }, select: { id: true, name: true } });
      if (!unit) throw new Error("Selected unit does not exist.");

      const finalSku = await ensureItemSku(tx, sku, name, product.id);

      const updated = await tx.product.update({
        where: {
          id: product.id,
        },
        data: {
          name,
          ...(finalSku ? { sku: finalSku } : {}),
          categoryId: category?.id ?? null,
          brandId: brand?.id ?? null,
          companyId: company?.id ?? null,
          unitId: unit.id,
          buyingPrice: parsed.data.buyingPrice ?? 0,
          sellingPrice: parsed.data.sellingPrice ?? 0,
          minimumStockAlert: parsed.data.minimumStockAlert,
          description: description ?? null,
        },
        select: {
          id: true,
          sku: true,
          name: true,
          unitId: true,
          buyingPrice: true,
          sellingPrice: true,
        },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "PRODUCT_UPDATE",
        entityType: "Product",
        entityId: updated.id,
        after: {
          name: updated.name,
          sku: updated.sku,
          unitId: updated.unitId,
          buyingPrice: updated.buyingPrice,
          sellingPrice: updated.sellingPrice,
          category: category?.name ?? null,
          brand: brand?.name ?? null,
        },
      });

      return updated.name;
    });

    revalidatePath("/inventory/products");
    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/low-stock");
    revalidatePath("/inventory/out-of-stock");
    revalidatePath("/sales/new");
    revalidatePath("/sales/sales-list");
    revalidatePath("/purchases/new");
    revalidatePath("/purchases/list");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `${itemName} updated successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to update the item right now."),
    };
  }
}

export type BulkProductInput = {
  name: string;
  unit?: string;
  minimumStockAlert?: number;
  categoryName?: string;
  brandName?: string;
  defaultBuyingPrice?: number;
  defaultSellingPrice?: number;
  description?: string;
};

export async function createBulkProductsAction(
  items: BulkProductInput[],
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("inventory:create");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to create items.",
    };
  }

  const seenNames = new Set<string>();
  const validItems = items.filter(item => {
    const name = item.name?.trim();
    if (!name || name.length < 2 || seenNames.has(name.toLowerCase())) {
      return false;
    }
    seenNames.add(name.toLowerCase());
    return true;
  });

  if (validItems.length === 0) {
    return {
      success: false,
      message: "Please provide at least one valid item name (minimum 2 characters).",
    };
  }

  try {
    const count = await prisma.$transaction(async (tx) => {
      let createdCount = 0;

      for (const item of validItems) {
        const name = item.name.trim();
        const existing = await tx.product.findFirst({
          where: {
            name: {
              equals: name,
              mode: "insensitive",
            },
          },
          select: { id: true },
        });

        if (existing) continue;

        const sku = await generateUniqueItemSku(tx, name);
        const minimumStockAlert = item.minimumStockAlert ?? 0;
        const description = normalizeOptionalString(item.description);
        const [category, brand] = await Promise.all([
          upsertCategoryByName(tx, item.categoryName),
          upsertBrandByName(tx, item.brandName),
        ]);
        const unit = await tx.unit.upsert({
          where: { name: item.unit?.trim() || "bottle" },
          update: { isActive: true },
          create: { name: item.unit?.trim() || "bottle", isActive: true },
          select: { id: true },
        });

        const product = await tx.product.create({
          data: {
            name,
            sku,
            ...(category ? { categoryId: category.id } : {}),
            ...(brand ? { brandId: brand.id } : {}),
            minimumStockAlert,
            unitId: unit.id,
            buyingPrice: item.defaultBuyingPrice ?? 0,
            sellingPrice: item.defaultSellingPrice ?? 0,
            isActive: true,
            ...(description ? { description } : {}),
          },
          select: {
            id: true,
            name: true,
            minimumStockAlert: true,
            buyingPrice: true,
            sellingPrice: true,
          },
        });

        await createAuditLog(tx, {
          actorUserId: actor.id,
          action: "PRODUCT_CREATE",
          entityType: "Product",
          entityId: product.id,
          after: {
            name: product.name,
            minimumStockAlert: product.minimumStockAlert,
            category: category?.name ?? null,
            brand: brand?.name ?? null,
            buyingPrice: product.buyingPrice,
            sellingPrice: product.sellingPrice,
          },
        });

        createdCount++;
      }

      return createdCount;
    });

    if (count === 0) {
      return {
        success: false,
        message: "No new items were created. They might already exist.",
      };
    }

    revalidatePath("/inventory/products");
    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/low-stock");
    revalidatePath("/inventory/out-of-stock");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Successfully created ${count} new items.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to perform bulk creation right now."),
    };
  }
}

export async function deleteProductAction(
  input: ProductDeleteInput,
): Promise<ActionResult> {
  const actor = await getActionActorByPermission("inventory:delete");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to delete items.",
    };
  }

  const parsed = productDeleteSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Item details are invalid.",
    };
  }

  try {
    const itemName = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id: parsed.data.id,
        },
        select: {
          id: true,
          name: true,
          sku: true,
          _count: {
            select: {
              purchaseItems: true,
              saleItems: true,
              transferItems: true,
              stockMovements: true,
              alertRecords: true,
            },
          },
        },
      });

      if (!product) {
        throw new Error("Selected item was not found.");
      }

      const usageCount = Object.values(product._count).reduce(
        (total, count) => total + count,
        0,
      );

      if (usageCount > 0) {
        throw new Error(
          "You cannot delete an item that already has stock records or transaction history.",
        );
      }

      await tx.product.delete({
        where: {
          id: product.id,
        },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "PRODUCT_DELETE",
        entityType: "Product",
        entityId: product.id,
        before: {
          name: product.name,
          sku: product.sku,
        },
      });

      return product.name;
    });

    revalidatePath("/inventory/products");
    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/low-stock");
    revalidatePath("/inventory/out-of-stock");
    revalidatePath("/sales/new");
    revalidatePath("/sales/sales-list");
    revalidatePath("/purchases/new");
    revalidatePath("/purchases/list");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `${itemName} deleted successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to delete the item right now."),
    };
  }
}