import { unstable_noStore as noStore } from "next/cache";

import { prisma } from "@/lib/prisma";

import { toNumber } from "@/lib/data-runtime-utils";
import { parseFilterList } from "@/lib/utils";

export async function getStockSummaryRows(locationId?: string) {
  noStore();

  const locationIds = parseFilterList(locationId);
  const movementWhere: any = {
    ...(locationIds
      ? locationIds.length === 1
        ? { locationId: locationIds[0] }
        : { locationId: { in: locationIds } }
      : {}),
  };
  const locationWhere: any = {
    isActive: true,
    ...(locationIds
      ? locationIds.length === 1
        ? { id: locationIds[0] }
        : { id: { in: locationIds } }
      : {}),
  };

  try {
    const movementTotals = await prisma.stockMovement.groupBy({
      by: ["locationId", "productId"],
      where: movementWhere,
      _sum: {
        quantity: true,
      },
      _max: {
        movementDate: true,
      },
    });

    const activeLocations = await prisma.location.findMany({
      where: locationWhere,
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    const activeProducts = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        sku: true,
        name: true,
        minimumStockAlert: true,
        category: { select: { name: true } },
        brand: { select: { name: true } },
        company: { select: { name: true } },
        categoryId: true,
        brandId: true,
        companyId: true,
        unit: { select: { name: true } },
        buyingPrice: true,
        sellingPrice: true,
      },
    });

    const locationPrices = await prisma.productLocationPrice.findMany({
      where: {
        locationId: { in: activeLocations.map((location) => location.id) },
        productId: { in: activeProducts.map((product) => product.id) },
      },
      select: {
        locationId: true,
        productId: true,
        sellingPrice: true,
      },
    });
    const locationPriceByKey = new Map(
      locationPrices.map((price) => [`${price.locationId}:${price.productId}`, price]),
    );

    const summary = new Map<
      string,
      {
        id: string;
        locationId: string;
        location: string;
        productId: string;
        product: string;
        sku: string;
        category: string;
        categoryId: string | null;
        brand: string;
        brandId: string | null;
        company: string;
        companyId: string | null;
        unit: string;
        unitId: string | null;
        buyingPrice: number;
        sellingPrice: number;
        quantity: number;
        stockValue: number;
        retailValue: number;
        minimumStockAlert: number;
        lastMovementDate: Date;
      }
    >();

    for (const location of activeLocations) {
      for (const product of activeProducts) {
        const key = `${location.id}:${product.id}`;
        const locationPrice = locationPriceByKey.get(key);
        const sellingPrice = toNumber(locationPrice?.sellingPrice ?? product.sellingPrice);
        summary.set(key, {
          id: key,
          locationId: location.id,
          location: location.name,
          productId: product.id,
          product: product.name,
          sku: product.sku,
          category: product.category?.name ?? "-",
          categoryId: product.categoryId,
          brand: product.brand?.name ?? "-",
          brandId: product.brandId,
          company: product.company?.name ?? "-",
          companyId: product.companyId,
          unit: product.unit.name,
          unitId: null,
          buyingPrice: toNumber(product.buyingPrice),
          sellingPrice,
          quantity: 0,
          stockValue: 0,
          retailValue: 0,
          minimumStockAlert: product.minimumStockAlert,
          lastMovementDate: new Date(0),
        });
      }
    }

    for (const movement of movementTotals) {
      const key = `${movement.locationId}:${movement.productId}`;
      const existing = summary.get(key);

      if (!existing) continue;

      existing.quantity = Number(movement._sum?.quantity ?? 0);
      existing.stockValue = existing.quantity * existing.buyingPrice;
      existing.retailValue = existing.quantity * existing.sellingPrice;
      existing.lastMovementDate = movement._max?.movementDate ?? new Date(0);
    }

    return [...summary.values()].sort((left, right) => {
      if (left.location === right.location) {
        return left.product.localeCompare(right.product);
      }

      return left.location.localeCompare(right.location);
    });
  } catch (error) {
    console.error("Unable to load stock summary.", error);
    return [];
  }
}