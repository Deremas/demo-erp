import { subDays, differenceInDays, startOfDay, endOfDay } from "date-fns";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getTablePageConfig } from "@/lib/page-data";
import { getReportDefinition, reportDefinitions, type ReportDefinition, type ReportFilterKind } from "@/lib/report-definitions";
import type { SimpleColumn, SimpleRow, TablePageConfig } from "@/lib/table";
import { toNumber } from "@/lib/data-runtime-utils";
import { formatCurrency, parseFilterList } from "@/lib/utils";
import { getStockSummaryRows } from "@/lib/stock-runtime-data";
import { getProductRows } from "@/lib/page-data-inventory";

export { getReportDefinition, reportDefinitions };
export type { ReportCategory, ReportDefinition, ReportFilterKind } from "@/lib/report-definitions";

function idListWhere(values: string[] | null | undefined): any {
  if (!values) return undefined;
  return values.length === 1 ? values[0] : { in: values };
}

export type ReportFilters = {
  locationId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  productId?: string;
  categoryId?: string;
  brandId?: string;
  companyId?: string;
  customerId?: string;
  supplierId?: string;
  userId?: string;
  movementType?: string;
  accountType?: string;
  financeAccountId?: string;
  sortBy?: string;
  lowStockOnly?: string;
  range1Month?: string;
  range1From?: string;
  range1To?: string;
  range2Month?: string;
  range2From?: string;
  range2To?: string;
  range3Month?: string;
  range3From?: string;
  range3To?: string;
};

function monthToRange(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  if (!year || !monthNumber) return null;
  const start = new Date(year, monthNumber - 1, 1);
  const end = new Date(year, monthNumber, 0);
  return { from: start, to: end };
}

function resolveComparisonRange(filters: ReportFilters, index: 1 | 2 | 3) {
  const month = filters[`range${index}Month` as keyof ReportFilters];
  const from = filters[`range${index}From` as keyof ReportFilters];
  const to = filters[`range${index}To` as keyof ReportFilters];
  const monthRange = month ? monthToRange(month) : null;

  if (monthRange) {
    return {
      label: new Date(monthRange.from).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      from: startOfDay(monthRange.from),
      to: endOfDay(monthRange.to),
    };
  }

  if (!from || !to) return null;

  return {
    label: `Range ${index}`,
    from: startOfDay(new Date(from)),
    to: endOfDay(new Date(to)),
  };
}

function toTableFilters(filters: ReportFilters) {
  return {
    ...(filters.locationId ? { locationId: filters.locationId } : {}),
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.paymentMethod ? { paymentMethod: filters.paymentMethod } : {}),
    ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.productId ? { productId: filters.productId } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.brandId ? { brandId: filters.brandId } : {}),
    ...(filters.companyId ? { companyId: filters.companyId } : {}),
    ...(filters.customerId ? { customerId: filters.customerId } : {}),
    ...(filters.supplierId ? { supplierId: filters.supplierId } : {}),
    ...(filters.lowStockOnly ? { lowStockOnly: filters.lowStockOnly } : {}),
    ...(filters.movementType ? { type: filters.movementType } : {}),
    ...(filters.accountType ? { type: filters.accountType } : {}),
  };
}

function summarizeRows(rows: SimpleRow[], columns: SimpleColumn[]) {
  const metrics = columns
    .filter((column) => column.type === "currency" || column.type === "number")
    .slice(0, 3)
    .map((column) => ({
      label: column.header,
      value: rows.reduce((sum, row) => sum + (typeof row[column.key] === "number" ? Number(row[column.key]) : 0), 0),
      type: column.type as "currency" | "number",
    }));

  return [{ label: "Rows", value: rows.length, type: "number" as const }, ...metrics];
}

async function getProductRankingConfig(definition: ReportDefinition, filters: ReportFilters): Promise<TablePageConfig> {
  const locationIds = parseFilterList(filters.locationId);
  const productIds = parseFilterList(filters.productId);
  const categoryIds = parseFilterList(filters.categoryId);
  const brandIds = parseFilterList(filters.brandId);
  const companyIds = parseFilterList(filters.companyId);
  const locWhere: any = locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {};

  const where: any = {
    sale: {
      status: "COMPLETED",
      ...locWhere,
      ...(filters.dateFrom || filters.dateTo
        ? { soldAt: { ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}), ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}) } }
        : {}),
    },
    product: {
      ...(productIds ? { id: idListWhere(productIds) } : {}),
      ...(categoryIds ? { categoryId: idListWhere(categoryIds) } : {}),
      ...(brandIds ? { brandId: idListWhere(brandIds) } : {}),
      ...(companyIds ? { companyId: idListWhere(companyIds) } : {}),
      ...(filters.search ? { name: { contains: filters.search, mode: "insensitive" } } : {}),
    },
  };

  const items = await prisma.saleItem.findMany({
    where,
    include: {
      product: {
        select: {
          name: true,
          buyingPrice: true,
          unit: { select: { name: true } },
          category: { select: { name: true } },
          brand: { select: { name: true } },
          company: { select: { name: true } },
        },
      },
    },
  });

  const grouped = new Map<string, any>();
  for (const item of items) {
      const current = grouped.get(item.productId) ?? {
        id: item.productId,
        product: item.product.name,
        category: item.product.category?.name ?? "-",
        brand: item.product.brand?.name ?? "-",
        company: item.product.company?.name ?? "-",
        soldQuantity: 0,
        revenue: 0,
        estimatedCost: 0,
        unit: item.product.unit.name,
      };
    current.soldQuantity += item.quantity;
    current.revenue += toNumber(item.lineTotal);
    current.estimatedCost += item.quantity * toNumber(item.product.buyingPrice);
    grouped.set(item.productId, current);
  }

  const sortBy = filters.sortBy ?? "revenue";
  const rows = [...grouped.values()]
    .map((row) => {
      const profit = row.revenue - row.estimatedCost;
      return {
        ...row,
        profit: Number(profit.toFixed(2)),
        profitMargin: row.revenue > 0 ? Number(((profit / row.revenue) * 100).toFixed(2)) : 0,
      };
    })
    .sort((a, b) => Number(b[sortBy] ?? b.revenue) - Number(a[sortBy] ?? a.revenue))
    .map((row, index) => ({ ...row, rank: index + 1 })) satisfies SimpleRow[];

  return {
    eyebrow: definition.category,
    title: definition.title,
    description: definition.description,
    exportFileName: "product-ranking",
    columns: [
      { key: "rank", header: "Rank", type: "number" },
      { key: "product", header: "Product" },
      { key: "category", header: "Category" },
      { key: "brand", header: "Brand" },
      { key: "company", header: "Brand Owner" },
      { key: "soldQuantity", header: "Sold Qty", type: "number", showTotal: true },
      { key: "revenue", header: "Revenue", type: "currency", showTotal: true },
      { key: "estimatedCost", header: "Estimated Cost", type: "currency", showTotal: true },
      { key: "profit", header: "Profit", type: "currency", showTotal: true },
      { key: "profitMargin", header: "Margin %", type: "number" },
    ],
    rows,
  };
}

async function getPaymentBreakdownConfig(definition: ReportDefinition, filters: ReportFilters): Promise<TablePageConfig> {
  const locationIds = parseFilterList(filters.locationId);
  const paymentMethods = parseFilterList(filters.paymentMethod);
  const paymentStatuses = parseFilterList(filters.paymentStatus);
  const locWhere: any = locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {};

  const sales = await prisma.sale.findMany({
    where: {
      status: "COMPLETED",
      ...locWhere,
      ...(paymentMethods ? { paymentMethod: idListWhere(paymentMethods) as any } : {}),
      ...(paymentStatuses ? { paymentStatus: idListWhere(paymentStatuses) as any } : {}),
      ...(filters.dateFrom || filters.dateTo
        ? { soldAt: { ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}), ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}) } }
        : {}),
    },
  });
  const grouped = new Map<string, SimpleRow>();
  for (const sale of sales) {
    const current = grouped.get(sale.paymentMethod) ?? { id: sale.paymentMethod, paymentMethod: sale.paymentMethod, salesCount: 0, totalSales: 0, totalPaid: 0, totalDue: 0 };
    current.salesCount = Number(current.salesCount) + 1;
    current.totalSales = Number(current.totalSales) + toNumber(sale.total);
    current.totalPaid = Number(current.totalPaid) + toNumber(sale.amountPaid);
    current.totalDue = Number(current.totalDue) + toNumber(sale.amountDue);
    grouped.set(sale.paymentMethod, current);
  }
  return {
    eyebrow: definition.category,
    title: definition.title,
    description: definition.description,
    exportFileName: "payment-method-breakdown",
    columns: [
      { key: "paymentMethod", header: "Payment Method", type: "status" },
      { key: "salesCount", header: "Sales Count", type: "number", showTotal: true },
      { key: "totalSales", header: "Total Sales", type: "currency", showTotal: true },
      { key: "totalPaid", header: "Total Paid", type: "currency", showTotal: true },
      { key: "totalDue", header: "Total Due", type: "currency", showTotal: true },
    ],
    rows: [...grouped.values()],
  };
}

async function getPeriodicComparisonConfig(definition: ReportDefinition, filters: ReportFilters): Promise<TablePageConfig> {
  const defaultRange = {
    label: "Last 30 Days",
    from: startOfDay(subDays(new Date(), 29)),
    to: endOfDay(new Date()),
  };
  const ranges = ([
    resolveComparisonRange(filters, 1) ?? defaultRange,
    resolveComparisonRange(filters, 2),
    resolveComparisonRange(filters, 3),
  ].filter(Boolean) as typeof defaultRange[]);

  if (ranges.length === 1) {
    const previousTo = subDays(ranges[0]!.from, 1);
    const durationDays = differenceInDays(ranges[0]!.to, ranges[0]!.from) + 1;
    ranges.push({
      label: "Previous Period",
      from: startOfDay(subDays(previousTo, durationDays - 1)),
      to: endOfDay(previousTo),
    });
  }

  const locationIds = parseFilterList(filters.locationId);
  const productIds = parseFilterList(filters.productId);
  const categoryIds = parseFilterList(filters.categoryId);
  const brandIds = parseFilterList(filters.brandId);
  const companyIds = parseFilterList(filters.companyId);
  const locWhere: any = locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {};

  const salesByRange = await Promise.all(
    ranges.map((range) =>
      prisma.sale.findMany({
        where: {
          status: "COMPLETED",
          soldAt: { gte: range.from, lte: range.to },
          ...locWhere,
          ...(productIds || categoryIds || brandIds || companyIds
            ? {
                items: {
                  some: {
                    product: {
                      ...(productIds ? { id: idListWhere(productIds) } : {}),
                      ...(categoryIds ? { categoryId: idListWhere(categoryIds) } : {}),
                      ...(brandIds ? { brandId: idListWhere(brandIds) } : {}),
                      ...(companyIds ? { companyId: idListWhere(companyIds) } : {}),
                    },
                  },
                },
              }
            : {}),
        },
        include: {
          items: {
            include: {
              product: { select: { buyingPrice: true, categoryId: true, brandId: true, companyId: true } },
            },
          },
        },
      }) as any,
    ),
  );

  const metrics = salesByRange.map((sales) => {
    let quantity = 0;
    let discount = 0;
    let cost = 0;
    for (const sale of sales) {
      for (const item of sale.items) {
        if (productIds && !productIds.includes(item.productId)) continue;
        if (categoryIds && !categoryIds.includes(item.product.categoryId)) continue;
        if (brandIds && !brandIds.includes(item.product.brandId)) continue;
        if (companyIds && !companyIds.includes(item.product.companyId)) continue;
        quantity += item.quantity;
        discount += toNumber(item.discount);
        cost += item.quantity * toNumber(item.product.buyingPrice);
      }
    }
    const revenue = sales.reduce((sum: number, sale: any) => sum + toNumber(sale.total), 0);
    const paid = sales.reduce((sum: number, sale: any) => sum + toNumber(sale.amountPaid), 0);
    return { revenue, paid, salesCount: sales.length, quantity, discount, profit: revenue - cost, avgOrder: sales.length ? revenue / sales.length : 0 };
  });

  const rows: SimpleRow[] = [
    { id: "revenue", metric: "Total Revenue" },
    { id: "sales_count", metric: "Sales Count" },
    { id: "quantity", metric: "Quantity Sold" },
    { id: "discount", metric: "Discount Given" },
    { id: "profit", metric: "Estimated Gross Profit" },
    { id: "total_paid", metric: "Total Collected" },
    { id: "avg_order", metric: "Avg Order Value" },
  ].map((row) => ({
    ...row,
    range1: row.id === "revenue" ? metrics[0]?.revenue ?? 0 : row.id === "sales_count" ? metrics[0]?.salesCount ?? 0 : row.id === "quantity" ? metrics[0]?.quantity ?? 0 : row.id === "discount" ? metrics[0]?.discount ?? 0 : row.id === "profit" ? metrics[0]?.profit ?? 0 : row.id === "total_paid" ? metrics[0]?.paid ?? 0 : metrics[0]?.avgOrder ?? 0,
    range2: row.id === "revenue" ? metrics[1]?.revenue ?? 0 : row.id === "sales_count" ? metrics[1]?.salesCount ?? 0 : row.id === "quantity" ? metrics[1]?.quantity ?? 0 : row.id === "discount" ? metrics[1]?.discount ?? 0 : row.id === "profit" ? metrics[1]?.profit ?? 0 : row.id === "total_paid" ? metrics[1]?.paid ?? 0 : metrics[1]?.avgOrder ?? 0,
    ...(ranges[2] ? { range3: row.id === "revenue" ? metrics[2]?.revenue ?? 0 : row.id === "sales_count" ? metrics[2]?.salesCount ?? 0 : row.id === "quantity" ? metrics[2]?.quantity ?? 0 : row.id === "discount" ? metrics[2]?.discount ?? 0 : row.id === "profit" ? metrics[2]?.profit ?? 0 : row.id === "total_paid" ? metrics[2]?.paid ?? 0 : metrics[2]?.avgOrder ?? 0 } : {}),
  }));

  return {
    eyebrow: definition.category,
    title: definition.title,
    description: `Comparing ${ranges.map((range) => `${range.label} (${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()})`).join(" vs ")}`,
    exportFileName: "periodic-comparison",
    columns: [
      { key: "metric", header: "Performance Metric" },
      { key: "range1", header: ranges[0]?.label ?? "Range 1", type: "number" },
      { key: "range2", header: ranges[1]?.label ?? "Range 2", type: "number" },
      ...(ranges[2] ? [{ key: "range3", header: ranges[2].label, type: "number" as const }] : []),
    ],
    rows,
  };
}

async function getInventoryByQuantityConfig(definition: ReportDefinition, filters: ReportFilters): Promise<TablePageConfig> {
  const stockRows = await getStockSummaryRows(filters.locationId);
  
  const productIds = parseFilterList(filters.productId);
  const categoryIds = parseFilterList(filters.categoryId);
  const brandIds = parseFilterList(filters.brandId);
  const companyIds = parseFilterList(filters.companyId);

  let filtered = stockRows;
  if (productIds) filtered = filtered.filter(r => productIds.includes(r.productId as string));
  if (categoryIds) filtered = filtered.filter(r => categoryIds.includes(r.categoryId as string));
  if (brandIds) filtered = filtered.filter(r => brandIds.includes(r.brandId as string));
  if (companyIds) filtered = filtered.filter(r => companyIds.includes(r.companyId as string));
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(r => r.product.toLowerCase().includes(search));
  }

  return {
    eyebrow: definition.category,
    title: definition.title,
    description: definition.description,
    exportFileName: "inventory-by-quantity",
    columns: [
      { key: "product", header: "Item" },
      { key: "category", header: "Category" },
      { key: "brand", header: "Brand" },
      { key: "company", header: "Brand Owner" },
      { key: "location", header: "Location" },
      { key: "quantity", header: "Base Quantity", type: "number", showTotal: true },
    ],
    rows: filtered.map(r => ({ ...r, id: `${r.productId}-${r.locationId}`, lastMovementDate: r.lastMovementDate.toISOString() })),
  };
}

async function getItemsListConfig(definition: ReportDefinition, filters: ReportFilters): Promise<TablePageConfig> {
  const rows = await getProductRows(filters.locationId ? { ...filters, locationId: filters.locationId } : filters);

  return {
    eyebrow: definition.category,
    title: definition.title,
    description: definition.description,
    exportFileName: "items-list",
    columns: [
      { key: "sku", header: "Item Code" },
      { key: "name", header: "Item Name" },
      { key: "category", header: "Category" },
      { key: "brand", header: "Brand" },
      { key: "company", header: "Company" },
      { key: "unit", header: "Unit" },
      { key: "preferredPackage", header: "Package Unit" },
      { key: "buyingPrice", header: "Buying Price", type: "currency" },
      { key: "sellingPrice", header: "Selling Price", type: "currency" },
      { key: "minimumStockAlert", header: "Minimum Stock", type: "number" },
      { key: "status", header: "Status", type: "status" },
    ],
    rows,
  };
}

async function getStockRunInConfig(definition: ReportDefinition, filters: ReportFilters): Promise<TablePageConfig> {
  const stockRows = await getStockSummaryRows(filters.locationId);
  
  const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : subDays(new Date(), 90);
  const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date();
  
  const days = Math.max(1, differenceInDays(dateTo, dateFrom));
  const months = days / 30;

  const sales = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: {
      sale: {
        status: "COMPLETED",
        soldAt: { gte: dateFrom, lte: dateTo },
        ...(filters.locationId ? { locationId: idListWhere(parseFilterList(filters.locationId)) } : {}),
      },
    },
    _sum: { quantity: true },
  });

  const salesMap = new Map(sales.map(s => [s.productId, toNumber(s._sum.quantity)]));
  
  const productIds = parseFilterList(filters.productId);
  const categoryIds = parseFilterList(filters.categoryId);
  const brandIds = parseFilterList(filters.brandId);
  const companyIds = parseFilterList(filters.companyId);

  let filtered = stockRows;
  if (productIds) filtered = filtered.filter(r => productIds.includes(r.productId as string));
  if (categoryIds) filtered = filtered.filter(r => categoryIds.includes(r.categoryId as string));
  if (brandIds) filtered = filtered.filter(r => brandIds.includes(r.brandId as string));
  if (companyIds) filtered = filtered.filter(r => companyIds.includes(r.companyId as string));
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(r => r.product.toLowerCase().includes(search));
  }

  const rows = filtered.map(r => {
    const totalSold = salesMap.get(r.productId) ?? 0;
    const avgMonthly = totalSold / months;
    const runIn = avgMonthly > 0 ? (r.quantity / avgMonthly).toFixed(1) : "-";
    
    return {
      ...r,
      id: `${r.productId}-${r.locationId}`,
      lastMovementDate: r.lastMovementDate.toISOString(),
      avgMonthly: avgMonthly.toFixed(1),
      runIn,
      status: avgMonthly > 0 ? (r.quantity / avgMonthly < 1 ? "Critical" : "Healthy") : "-",
    };
  });

  return {
    eyebrow: definition.category,
    title: definition.title,
    description: `${definition.description} (Calculated over ${months.toFixed(1)} months)`,
    exportFileName: "stock-run-in",
    columns: [
      { key: "product", header: "Item" },
      { key: "category", header: "Category" },
      { key: "brand", header: "Brand" },
      { key: "company", header: "Brand Owner" },
      { key: "location", header: "Location" },
      { key: "quantity", header: "Current Stock", type: "number" },
      { key: "avgMonthly", header: "Avg Monthly Sales", type: "number" },
      { key: "runIn", header: "Run-In Months" },
      { key: "status", header: "Status" },
    ],
    rows,
  };
}

async function getBrandOwnerPerformanceConfig(definition: ReportDefinition, filters: ReportFilters): Promise<{ config: TablePageConfig; summaries: any[] }> {
  const locationIds = parseFilterList(filters.locationId);
  const productIds = parseFilterList(filters.productId);
  const categoryIds = parseFilterList(filters.categoryId);
  const brandIds = parseFilterList(filters.brandId);
  const companyIds = parseFilterList(filters.companyId);
  const locWhere: any = locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {};

  const products = (await prisma.product.findMany({
    where: {
      isActive: true,
      ...(productIds ? { id: idListWhere(productIds) } : {}),
      ...(companyIds ? { companyId: idListWhere(companyIds) } : {}),
      ...(categoryIds ? { categoryId: idListWhere(categoryIds) } : {}),
      ...(brandIds ? { brandId: idListWhere(brandIds) } : {}),
      ...(filters.search ? { name: { contains: filters.search, mode: "insensitive" } } : {}),
    },
    include: {
      company: true,
      category: true,
      brand: true,
      saleItems: {
        where: {
          sale: {
            status: "COMPLETED",
            ...locWhere,
            ...(filters.dateFrom || filters.dateTo
              ? { soldAt: { ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}), ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}) } }
              : {}),
          },
        },
        include: { sale: { select: { locationId: true } } },
      },
    },
  })) as any[];

  const stockRows = await getStockSummaryRows(filters.locationId);
  const stockByProduct = new Map<string, { quantity: number; stockValue: number }>();
  for (const row of stockRows) {
    const current = stockByProduct.get(row.productId) ?? { quantity: 0, stockValue: 0 };
    current.quantity += row.quantity;
    current.stockValue += row.stockValue;
    stockByProduct.set(row.productId, current);
  }
  const grouped = new Map<string, SimpleRow>();

  for (const product of products) {
    const companyName = product.company?.name ?? "Unassigned";
    const companyId = product.companyId ?? "unassigned";
    const current = grouped.get(companyId) ?? {
      id: companyId,
      company: companyName,
      itemCount: 0,
      quantitySold: 0,
      salesTotal: 0,
      discountTotal: 0,
      stockQty: 0,
      stockValue: 0,
      items: "",
    };
    const stock = stockByProduct.get(product.id);
    current.itemCount = Number(current.itemCount) + 1;
    current.quantitySold = Number(current.quantitySold) + product.saleItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
    current.salesTotal = Number(current.salesTotal) + product.saleItems.reduce((sum: number, item: any) => sum + toNumber(item.lineTotal), 0);
    current.discountTotal = Number(current.discountTotal) + product.saleItems.reduce((sum: number, item: any) => sum + toNumber(item.discount), 0);
    current.stockQty = Number(current.stockQty) + (stock?.quantity ?? 0);
    current.stockValue = Number(current.stockValue) + (stock?.stockValue ?? 0);
    current.items = [String(current.items), product.name].filter(Boolean).join(", ");
    grouped.set(companyId, current);
  }

  const rows = [...grouped.values()].sort((a, b) => Number(b.salesTotal) - Number(a.salesTotal));

  return {
    summaries: [
      { label: "Brand Owners", value: rows.length, type: "number" },
      { label: "Sales", value: rows.reduce((sum, row) => sum + Number(row.salesTotal), 0), type: "currency" },
      { label: "Discounts", value: rows.reduce((sum, row) => sum + Number(row.discountTotal), 0), type: "currency" },
      { label: "Stock Value", value: rows.reduce((sum, row) => sum + Number(row.stockValue), 0), type: "currency" },
    ],
    config: {
      eyebrow: definition.category,
      title: definition.title,
      description: definition.description,
      exportFileName: "brand-owner-performance",
      columns: [
        { key: "company", header: "Brand Owner" },
        { key: "itemCount", header: "Items", type: "number", showTotal: true },
        { key: "quantitySold", header: "Qty Sold", type: "number", showTotal: true },
        { key: "salesTotal", header: "Sales", type: "currency", showTotal: true },
        { key: "discountTotal", header: "Discounts", type: "currency", showTotal: true },
        { key: "stockQty", header: "Stock Qty", type: "number", showTotal: true },
        { key: "stockValue", header: "Stock Value", type: "currency", showTotal: true },
        { key: "items", header: "Items", type: "multiline" },
      ],
      rows,
    },
  };
}


async function getCashFlowConfig(definition: ReportDefinition, filters: ReportFilters): Promise<TablePageConfig> {
  const locationIds = parseFilterList(filters.locationId);
  const locWhere: any = locationIds
    ? locationIds.length === 1
      ? { locationId: locationIds[0] }
      : { locationId: { in: locationIds } }
    : {};

  const entries = await prisma.ledgerEntry.findMany({
    where: {
      ...locWhere,
      ...(filters.financeAccountId ? { financeAccountId: filters.financeAccountId } : {}),
      ...(filters.dateFrom || filters.dateTo
        ? {
            entryDate: {
              ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
              ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
            },
          }
        : {}),
      ...(filters.search
        ? { description: { contains: filters.search, mode: "insensitive" } }
        : {}),
    },
    select: {
      entryType: true,
      direction: true,
      amount: true,
    },
  });

  const grouped = new Map<string, { id: string; category: string; inflow: number; outflow: number }>();
  for (const entry of entries) {
    const current = grouped.get(entry.entryType) ?? {
      id: entry.entryType,
      category: String(entry.entryType).replaceAll("_", " "),
      inflow: 0,
      outflow: 0,
    };
    const amount = toNumber(entry.amount);
    if (entry.direction === "DEBIT") {
      current.inflow += amount;
    } else {
      current.outflow += amount;
    }
    grouped.set(entry.entryType, current);
  }

  const rows = [...grouped.values()]
    .map((row) => ({
      ...row,
      inflow: Number(row.inflow.toFixed(2)),
      outflow: Number(row.outflow.toFixed(2)),
      net: Number((row.inflow - row.outflow).toFixed(2)),
    }))
    .sort((left, right) => Math.abs(right.net) - Math.abs(left.net)) satisfies SimpleRow[];

  return {
    eyebrow: definition.category,
    title: definition.title,
    description: definition.description,
    exportFileName: "cash-flow",
    columns: [
      { key: "category", header: "Movement" },
      { key: "inflow", header: "Inflow", type: "currency", showTotal: true },
      { key: "outflow", header: "Outflow", type: "currency", showTotal: true },
      { key: "net", header: "Net", type: "currency", showTotal: true },
    ],
    rows,
  };
}

export async function getReportConfig(reportId: string, filters: ReportFilters) {
  const definition = getReportDefinition(reportId);
  if (!definition) return null;

  if (definition.id === "product-ranking") return { definition, config: await getProductRankingConfig(definition, filters), summaries: [] };
  if (definition.id === "payment-method-breakdown") return { definition, config: await getPaymentBreakdownConfig(definition, filters), summaries: [] };
  if (definition.id === "periodic-comparison") return { definition, config: await getPeriodicComparisonConfig(definition, filters), summaries: [] };
  if (definition.id === "company-performance") {
    const { config, summaries } = await getBrandOwnerPerformanceConfig(definition, filters);
    return { definition, config, summaries };
  }
  if (definition.id === "inventory-by-quantity") return { definition, config: await getInventoryByQuantityConfig(definition, filters), summaries: [] };
  if (definition.id === "items-list") return { definition, config: await getItemsListConfig(definition, filters), summaries: [] };
  if (definition.id === "stock-run-in") return { definition, config: await getStockRunInConfig(definition, filters), summaries: [] };
  if (definition.id === "cash-flow") return { definition, config: await getCashFlowConfig(definition, filters), summaries: [] };

  const config = definition.tableKey
    ? await getTablePageConfig(definition.tableKey, toTableFilters(filters))
    : { eyebrow: definition.category, title: definition.title, description: definition.description, columns: [], rows: [] };

  config.title = definition.title;
  config.description = definition.description;
  config.eyebrow = definition.category;
  config.exportFileName = definition.id;

  return { definition, config, summaries: summarizeRows(config.rows, config.columns) };
}

export async function getReportFilterOptions() {
  const user = await getCurrentUser();
  const [categories, brands, companies, products, customers, suppliers, users, accounts] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.company.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.customer.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.financeAccount.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return {
    locations: user?.locations ?? [],
    categories,
    brands,
    companies,
    products,
    customers,
    suppliers,
    users,
    accounts,
  };
}