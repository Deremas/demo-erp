"use server";

import { revalidatePath } from "next/cache";

import { getActionActorByPermission, getActionErrorMessage } from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/services/inventory-ledger";

function getValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .flatMap((value) => (typeof value === "string" ? value.split(",") : []))
    .map((value) => value.trim())
    .filter(Boolean);
}

function getSelectedRows(formData: FormData) {
  return getValues(formData, "selectedRows")
    .map((value) => {
      const [locationId, productId] = value.split(":");
      return locationId && productId ? { locationId, productId } : null;
    })
    .filter((value): value is { locationId: string; productId: string } => Boolean(value));
}

function applyAdjustment(current: number, mode: string, amount: number) {
  if (mode === "PERCENTAGE_DECREASE") {
    return Math.max(0, current * (1 - amount / 100));
  }

  if (mode === "FIXED_INCREASE" || mode === "FIXED") {
    return Math.max(0, current + amount);
  }

  if (mode === "FIXED_DECREASE") {
    return Math.max(0, current - amount);
  }

  if (mode === "SET_EXACT") {
    return Math.max(0, amount);
  }

  return Math.max(0, current * (1 + amount / 100));
}

export async function applyPriceAdjustmentAction(formData: FormData) {
  const actor = await getActionActorByPermission("inventory:adjust-prices");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to adjust item prices.",
    };
  }

  const locationIds = getValues(formData, "locationIds");
  const productIds = getValues(formData, "productIds");
  const categoryIds = getValues(formData, "categoryIds");
  const brandIds = getValues(formData, "brandIds");
  const companyIds = getValues(formData, "companyIds");
  const mode = String(formData.get("mode") || "PERCENTAGE_INCREASE");
  const amount = Number(formData.get("amount") || 0);
  const selectedRows = getSelectedRows(formData);

  const selectedLocationIds = [...new Set(selectedRows.map((row) => row.locationId))];
  const selectedProductIds = [...new Set(selectedRows.map((row) => row.productId))];
  const targetLocationIds = selectedLocationIds.length ? selectedLocationIds : locationIds;

  if (targetLocationIds.length === 0) {
    return { success: false, message: "Select at least one location." };
  }

  if (selectedRows.length === 0) {
    return { success: false, message: "Select at least one preview row to adjust." };
  }

  if (!Number.isFinite(amount) || amount === 0) {
    return { success: false, message: "Enter a non-zero adjustment amount." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          isActive: true,
          ...(selectedProductIds.length
            ? { id: { in: selectedProductIds } }
            : productIds.length
              ? { id: { in: productIds } }
              : {}),
          ...(categoryIds.length ? { categoryId: { in: categoryIds } } : {}),
          ...(brandIds.length ? { brandId: { in: brandIds } } : {}),
          ...(companyIds.length ? { companyId: { in: companyIds } } : {}),
        },
        select: {
          id: true,
          name: true,
          sku: true,
          sellingPrice: true,
        },
      });

      if (products.length === 0) {
        throw new Error("No matching active items were found.");
      }

      const existingPrices = await tx.productLocationPrice.findMany({
        where: {
          locationId: { in: targetLocationIds },
          productId: { in: products.map((product) => product.id) },
        },
      });
      const existingByKey = new Map(
        existingPrices.map((price) => [`${price.locationId}:${price.productId}`, price]),
      );

      let updatedCount = 0;
      const historyRows: {
        productId: string;
        locationId: string;
        sellingPriceBefore: number;
        sellingPriceAfter: number;
      }[] = [];

      for (const locationId of targetLocationIds) {
        for (const product of products) {
          if (
            selectedRows.length &&
            !selectedRows.some((row) => row.locationId === locationId && row.productId === product.id)
          ) {
            continue;
          }

          const existing = existingByKey.get(`${locationId}:${product.id}`);
          const currentBase = Number(existing?.sellingPrice ?? product.sellingPrice);
          const nextBase = Number(applyAdjustment(currentBase, mode, amount).toFixed(2));

          await tx.productLocationPrice.upsert({
            where: {
              productId_locationId: {
                productId: product.id,
                locationId,
              },
            },
            update: {
              sellingPrice: nextBase,
            },
            create: {
              productId: product.id,
              locationId,
              sellingPrice: nextBase,
            },
          });

          historyRows.push({
            productId: product.id,
            locationId,
            sellingPriceBefore: currentBase,
            sellingPriceAfter: nextBase,
          });

          updatedCount++;
        }
      }

      if (historyRows.length === 0) {
        throw new Error("No selected matching active items were found.");
      }

      const batch = await tx.priceAdjustmentBatch.create({
        data: {
          mode,
          amount,
          locationCount: new Set(historyRows.map((row) => row.locationId)).size,
          itemCount: new Set(historyRows.map((row) => row.productId)).size,
          rowCount: historyRows.length,
          createdById: actor.id,
          rows: {
            create: historyRows,
          },
        },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "PRICE_ADJUSTMENT",
        entityType: "ProductLocationPrice",
        entityId: batch.id,
        after: {
          mode,
          amount,
          locationCount: targetLocationIds.length,
          productCount: products.length,
          updatedCount,
        },
      });

      return {
        productCount: new Set(historyRows.map((row) => row.productId)).size,
        locationCount: new Set(historyRows.map((row) => row.locationId)).size,
        updatedCount,
      };
    });

    revalidatePath("/inventory/price-adjustments");
    revalidatePath("/sales/pos");
    revalidatePath("/sales/wholesale");
    revalidatePath("/inventory/products");

    return {
      success: true,
      message: `Adjusted ${result.productCount} item price(s) across ${result.locationCount} location(s).`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to apply price adjustment right now."),
    };
  }
}