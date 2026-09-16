import { prisma } from "@/lib/prisma";
import type { SimpleRow, RowActionConfig } from "@/lib/table";
import type { IconName } from "@/lib/icons";
import { sumRows, toNumber } from "@/lib/data-runtime-utils";
import { getStockSummaryRows } from "@/lib/stock-runtime-data";
import { formatCurrency, formatDateTime, toTitleCase, parseFilterList } from "@/lib/utils";

type TablePageFilters = {
  locationId?: string;
  productId?: string;
  categoryId?: string;
  status?: string;
  search?: string;
  lowStockOnly?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
};

function normalizeFilters(filters?: TablePageFilters | string): TablePageFilters {
  return typeof filters === "string" ? { locationId: filters } : filters ?? {};
}

function stockBreakdown(quantity: number, unit: string) {
  return `${quantity} ${unit}${quantity !== 1 ? "s" : ""}`;
}

function idListWhere(values: string[] | null): any {
  if (!values) return undefined;
  return values.length === 1 ? values[0] : { in: values };
}

export async function getProductRows(filters: TablePageFilters | string = {}) {
  const { locationId, categoryId, status, search } = normalizeFilters(filters);
  const locationIds = parseFilterList(locationId);
  const categoryIds = parseFilterList(categoryId);
  const locWhere: any = locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {};
  const productWhere: any = {
    ...(categoryIds ? { categoryId: idListWhere(categoryIds) } : {}),
    ...(status ? { isActive: status === "ACTIVE" } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { category: { name: { contains: search, mode: "insensitive" } } },
            { sku: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  try {
    const [products, stockByProductRows] = await Promise.all([
      prisma.product.findMany({
        where: productWhere,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          sku: true,
          category: { select: { name: true } },
          unit: { select: { name: true } },
          buyingPrice: true,
          sellingPrice: true,
          minimumStockAlert: true,
          isActive: true,
        },
      }),
      prisma.stockMovement.groupBy({
        by: ["productId"],
        where: { ...locWhere },
        _sum: { quantity: true },
      }),
    ]);
    const stockByProduct = new Map(stockByProductRows.map((row) => [row.productId, row._sum?.quantity ?? 0]));

    return products.map((product) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category?.name ?? "-",
      unit: product.unit.name,
      preferredPackage: "-",
      buyingPrice: toNumber(product.buyingPrice),
      sellingPrice: toNumber(product.sellingPrice),
      minimumStockAlert: product.minimumStockAlert,
      currentStock: stockByProduct.get(product.id) ?? 0,
      status: product.isActive ? "ACTIVE" : "INACTIVE",
      __actions: [{ key: "edit", label: "Edit", href: `/inventory/products?productId=${product.id}&mode=edit&open=1`, icon: "edit" }],
    })) satisfies SimpleRow[];
  } catch (error) {
    console.error("Failed to load full product rows. Falling back to basic product list.", error);

    try {
      const products = await prisma.product.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
        },
      });

      return products.map((product) => ({
        id: product.id,
        sku: "-",
        name: product.name,
        category: "-",
        currentStock: 0,
        minimumStockAlert: 0,
        status: "ACTIVE",
        __actions: [{ key: "edit", label: "Edit", href: `/inventory/products?productId=${product.id}&mode=edit&open=1`, icon: "edit" }],
      })) satisfies SimpleRow[];
    } catch (fallbackError) {
      console.error("Failed to load fallback product rows.", fallbackError);
      return [];
    }
  }
}

export async function getStockOverviewRows(filters: TablePageFilters | string = {}) {
  const { locationId, productId, categoryId, search, lowStockOnly } = normalizeFilters(filters);
  const summary = await getStockSummaryRows(locationId);
  const q = search?.toLowerCase();
  const productIds = parseFilterList(productId);
  const categoryIds = parseFilterList(categoryId);

  return summary
    .filter((row) => (categoryIds ? categoryIds.includes(row.categoryId ?? "") : true))
    .filter((row) => (productIds ? productIds.includes(row.productId) : true))
    .filter((row) => (lowStockOnly === "1" ? row.quantity <= row.minimumStockAlert : true))
    .filter((row) =>
      q
        ? row.product.toLowerCase().includes(q) ||
          row.sku.toLowerCase().includes(q) ||
          row.category.toLowerCase().includes(q)
        : true,
    )
    .map((row) => {
      const status = row.quantity <= 0 ? "OUT_OF_STOCK" : row.quantity <= row.minimumStockAlert ? "LOW_STOCK" : "HEALTHY";

      return {
        id: row.id,
        locationId: row.locationId,
        productId: row.productId,
        location: row.location,
        product: row.product,
        name: row.product,
        category: row.category,
        stockBreakdown: stockBreakdown(row.quantity, row.unit),
        baseQuantity: row.quantity,
        currentStock: row.quantity,
        minimumStockAlert: row.minimumStockAlert,
        preferredPackage: "-",
        buyingPrice: row.buyingPrice,
        sellingPrice: row.sellingPrice,
        status,
        __actions: [
          {
            key: "view",
            label: "View",
            href: `/inventory/stock/details?locationId=${row.locationId}&productId=${row.productId}`,
            icon: "view" as IconName,
            showLabel: true,
          },
          ...(status !== "OUT_OF_STOCK" && lowStockOnly !== "1"
            ? [
                {
                  key: "sell",
                  label: "Sell",
                  href: `/sales/pos?productId=${row.productId}&locationId=${row.locationId}`,
                  icon: "sales" as IconName,
                  showLabel: true,
                },
              ]
            : []),
          {
            key: "purchase",
            label: "Purchase",
            href: `/purchases/new?productId=${row.productId}&locationId=${row.locationId}`,
            icon: "purchases" as IconName,
            showLabel: true,
          },
        ] as RowActionConfig[],
      };
    }) satisfies SimpleRow[];
}

export async function getStockOverviewMetrics(locationId?: string | null) {
  const rows = await getStockOverviewRows(locationId ?? undefined);
  return [
    { title: "Stock value", value: formatCurrency(sumRows(rows.map((row) => Number(row.buyingPrice) * Number(row.baseQuantity)))) },
    { title: "Sales value", value: formatCurrency(sumRows(rows.map((row) => Number(row.sellingPrice) * Number(row.baseQuantity)))) },
    { title: "Low stock", value: String(rows.filter((row) => row.status === "LOW_STOCK").length) },
    { title: "Active stock", value: String(rows.filter((row) => row.baseQuantity > 0).length) },
  ];
}

export async function getLowStockRows(filters?: TablePageFilters | string) {
  const normalized = normalizeFilters(filters);
  return getStockOverviewRows({ ...normalized, lowStockOnly: "1" });
}

export async function getOutOfStockRows(filters?: TablePageFilters | string) {
  const normalized = normalizeFilters(filters);
  const rows = await getStockOverviewRows({ ...normalized, lowStockOnly: "1" });
  return rows.filter((row) => row.status === "OUT_OF_STOCK");
}

export async function getAlertRecordRows(filters?: TablePageFilters | string) {
  const { locationId } = normalizeFilters(filters);
  const locationIds = parseFilterList(locationId);
  const where: any = {
    ...(locationIds
      ? locationIds.length === 1
        ? { locationId: locationIds[0] }
        : { locationId: { in: locationIds } }
      : {}),
  };

  const rows = await prisma.alertRecord.findMany({
    where,
    orderBy: { evaluatedAt: "desc" },
    include: {
      location: { select: { name: true } },
      product: { select: { name: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    location: row.location.name,
    product: row.product.name,
    threshold: row.threshold,
    currentQty: row.currentQty,
    evaluatedAt: formatDateTime(row.evaluatedAt),
  })) satisfies SimpleRow[];
}

export async function getStockMovementRows(filters: TablePageFilters | string = {}) {
  const { locationId, productId, categoryId, search, type, dateFrom, dateTo } = normalizeFilters(filters);
  const locationIds = parseFilterList(locationId);
  const productIds = parseFilterList(productId);
  const categoryIds = parseFilterList(categoryId);
  const movementTypes = parseFilterList(type);
  const where: any = {
    ...(locationIds
      ? locationIds.length === 1
        ? { locationId: locationIds[0] }
        : { locationId: { in: locationIds } }
      : {}),
    ...(productIds ? { productId: idListWhere(productIds) } : {}),
    ...(categoryIds || search
      ? {
          product: {
            ...(categoryIds ? { categoryId: idListWhere(categoryIds) } : {}),
            ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
          },
        }
      : {}),
    ...(movementTypes ? { movementType: idListWhere(movementTypes) } : {}),
    ...(dateFrom || dateTo
      ? { movementDate: { ...(dateFrom ? { gte: new Date(dateFrom) } : {}), ...(dateTo ? { lte: new Date(dateTo) } : {}) } }
      : {}),
  };

  const rows = await prisma.stockMovement.findMany({
    where,
    orderBy: { movementDate: "desc" },
    include: {
      location: { select: { name: true } },
      product: { select: { name: true, unit: { select: { name: true } } } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    location: row.location.name,
    product: row.product.name,
    type: toTitleCase(row.movementType),
      quantity: row.quantity,
      reference: `${row.sourceType} ${row.sourceId}`,
      reason: row.counterpartyId ?? "-",
      movementDate: formatDateTime(row.movementDate),
  })) satisfies SimpleRow[];
}

export async function getTransferRows(filters: TablePageFilters | string = {}) {
  const { locationId, productId, search, dateFrom, dateTo } = normalizeFilters(filters);
  const locationIds = parseFilterList(locationId);
  const productIds = parseFilterList(productId);

  const rows = await prisma.transfer.findMany({
    where: {
      ...(locationIds
        ? {
            OR: [
              { sourceLocationId: { in: locationIds } },
              { destinationLocationId: { in: locationIds } },
            ],
          }
        : {}),
      ...(productIds ? { items: { some: { productId: idListWhere(productIds) } } } : {}),
      ...(dateFrom || dateTo
        ? { createdAt: { ...(dateFrom ? { gte: new Date(dateFrom) } : {}), ...(dateTo ? { lte: new Date(dateTo) } : {}) } }
        : {}),
      ...(search
        ? {
            OR: [
              { transferNumber: { contains: search, mode: "insensitive" } },
              { note: { contains: search, mode: "insensitive" } },
              { sourceLocation: { name: { contains: search, mode: "insensitive" } } },
              { destinationLocation: { name: { contains: search, mode: "insensitive" } } },
              { items: { some: { product: { name: { contains: search, mode: "insensitive" } } } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      sourceLocation: { select: { name: true } },
      destinationLocation: { select: { name: true } },
      items: { select: { quantity: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    transferNumber: row.transferNumber,
    sourceLocation: row.sourceLocation.name,
    destinationLocation: row.destinationLocation.name,
    itemCount: row.items.length,
    totalQuantity: sumRows(row.items.map((item) => item.quantity)),
    status: row.status,
    transferDate: (row.sentAt ?? row.createdAt).toISOString(),
    __actions: [{ key: "view", label: "View", href: `/inventory/transfers/${row.id}`, icon: "view" }],
  })) satisfies SimpleRow[];
}

export async function getDigitalBinCardRows(filters: TablePageFilters = {}) {
  const { locationId, productId, categoryId, dateFrom, dateTo, type, search } = normalizeFilters(filters);
  const locationIds = parseFilterList(locationId);
  const productIds = parseFilterList(productId);
  const categoryIds = parseFilterList(categoryId);
  const movementTypes = parseFilterList(type);

  const baseWhere: any = {
    ...(locationIds
      ? locationIds.length === 1
        ? { locationId: locationIds[0] }
        : { locationId: { in: locationIds } }
      : {}),
    ...(productIds
      ? productIds.length === 1
        ? { productId: productIds[0] }
        : { productId: { in: productIds } }
      : {}),
    ...(movementTypes
      ? movementTypes.length === 1
        ? { movementType: movementTypes[0] as never }
        : { movementType: { in: movementTypes as never[] } }
      : {}),
    ...(categoryIds
      ? {
          product: {
            ...(categoryIds.length === 1
              ? { categoryId: categoryIds[0] }
              : { categoryId: { in: categoryIds } }),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { product: { name: { contains: search, mode: "insensitive" } } },
            { product: { sku: { contains: search, mode: "insensitive" } } },
            { product: { category: { name: { contains: search, mode: "insensitive" } } } },
            { sourceType: { contains: search, mode: "insensitive" } },
            { sourceId: { contains: search, mode: "insensitive" } },
            { sourceLineId: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  } as const;

  const openingBalanceByKey = new Map<string, number>();
  if (dateFrom) {
    const openingBalances = await prisma.stockMovement.groupBy({
      by: ["locationId", "productId"],
      where: {
        ...baseWhere,
        movementDate: { lt: new Date(dateFrom) },
      },
      _sum: { quantity: true },
    });
    openingBalances.forEach((row) => {
      openingBalanceByKey.set(`${row.locationId}:${row.productId}`, row._sum?.quantity ?? 0);
    });
  }

  const rows = await prisma.stockMovement.findMany({
    where: {
      ...baseWhere,
      ...(dateFrom || dateTo
        ? {
            movementDate: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
    },
    orderBy: [{ productId: "asc" }, { locationId: "asc" }, { movementDate: "asc" }, { createdAt: "asc" }],
    include: {
      location: { select: { name: true } },
      product: {
        select: {
          name: true,
          sku: true,
          unit: { select: { name: true } },
          category: { select: { name: true } },
        },
      },
    },
  });

  const runningBalanceByKey = new Map(openingBalanceByKey);

  return rows.map((row) => {
    const key = `${row.locationId}:${row.productId}`;
    const fallbackBalance = (runningBalanceByKey.get(key) ?? 0) + row.quantity;
    const balance = row.balanceAfter ?? fallbackBalance;
    runningBalanceByKey.set(key, balance);

    return {
      id: row.id,
      movementDate: formatDateTime(row.movementDate),
      location: row.location.name,
      product: row.product.name,
      sku: row.product.sku,
      category: row.product.category?.name ?? "-",
      type: toTitleCase(row.movementType),
      reference: `${row.sourceType} ${row.sourceId}`,
      inQty: row.quantity > 0 ? row.quantity : 0,
      outQty: row.quantity < 0 ? Math.abs(row.quantity) : 0,
      balance,
      reason: row.counterpartyId ?? row.counterpartyType ?? row.sourceType,
    } satisfies SimpleRow;
  });
}

export async function getExpiryAlertRows(filters: TablePageFilters | string = {}) {
  return [];
}