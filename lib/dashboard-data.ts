import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { prisma } from "@/lib/prisma"; // Refreshing client... (v2)
import { getStockSummaryRows } from "@/lib/stock-runtime-data";
import { toNumber } from "@/lib/data-runtime-utils";
import { formatCurrency, formatUsd, parseFilterList } from "@/lib/utils";
import type { AppRole, DashboardSnapshot, MetricCard, RecentTransaction, SimpleRow, TrendPoint, TopDashboardProduct } from "@/lib/types";

function getEthiopianMonthStart(date: Date): Date {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // Mapping of Gregorian month to Ethiopian month start day
  const starts = [
    { m: 0, d: 9 },  // Jan 9 (Tir)
    { m: 1, d: 8 },  // Feb 8 (Yekatit)
    { m: 2, d: 10 }, // Mar 10 (Megabit)
    { m: 3, d: 9 },  // Apr 9 (Miyazya)
    { m: 4, d: 9 },  // May 9 (Ginbot)
    { m: 5, d: 8 },  // Jun 8 (Sene)
    { m: 6, d: 8 },  // Jul 8 (Hamle)
    { m: 7, d: 7 },  // Aug 7 (Nehasse)
    { m: 8, d: 11 }, // Sep 11 (Meskerem)
    { m: 9, d: 11 }, // Oct 11 (Tikimt)
    { m: 10, d: 10 },// Nov 10 (Hidar)
    { m: 11, d: 10 },// Dec 10 (Tahsas)
  ];

  const currentStart = starts[month]!;
  if (day >= currentStart.d) {
    return new Date(year, month, currentStart.d);
  } else {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevStart = starts[prevMonth]!;
    return new Date(prevYear, prevMonth, prevStart.d);
  }
}

export async function getDashboardSnapshot(
  role: AppRole,
  locationId?: string,
): Promise<DashboardSnapshot> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));
  const yesterdayEnd = endOfDay(subDays(now, 1));
  const lastSevenStart = startOfDay(subDays(now, 6));

  const locationIds = parseFilterList(locationId);
  const locWhere: any = locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {};

  const results = await Promise.all([
    // Today's Sales
    prisma.sale.findMany({
      where: { status: "COMPLETED", ...locWhere, soldAt: { gte: todayStart, lte: todayEnd } },
      select: { total: true },
    }),
    // Yesterday's Sales (for Trend)
    prisma.sale.findMany({
      where: { status: "COMPLETED", ...locWhere, soldAt: { gte: yesterdayStart, lte: yesterdayEnd } },
      select: { total: true },
    }),
    // Profit Logic
    prisma.saleItem.findMany({
      where: {
        sale: { status: "COMPLETED", ...locWhere, soldAt: { gte: todayStart, lte: todayEnd } },
      },
      select: { quantity: true, lineTotal: true, product: { select: { buyingPrice: true } } },
    }),
    getStockSummaryRows(locationId),
    getLowStockRows(locationId),
    // Financials
    prisma.sale.aggregate({
      where: { status: "COMPLETED", paymentStatus: { in: ["UNPAID", "PARTIAL"] }, ...locWhere },
      _sum: { amountDue: true, total: true, amountPaid: true },
    }),
    prisma.purchase.aggregate({
      where: { status: "POSTED", paymentStatus: { in: ["UNPAID", "PARTIAL"] }, ...locWhere },
      _sum: { amountDue: true, total: true, amountPaid: true },
    }),
    // Recents
    prisma.sale.findMany({
      where: { status: "COMPLETED", ...locWhere },
      orderBy: { soldAt: "desc" },
      take: 5,
      select: { id: true, saleNumber: true, total: true, soldAt: true, location: { select: { name: true } } },
    }),
    prisma.purchase.findMany({
      where: { status: "POSTED", ...locWhere },
      orderBy: { purchasedAt: "desc" },
      take: 5,
      select: { id: true, purchaseNumber: true, total: true, purchasedAt: true, location: { select: { name: true } } },
    }),
    prisma.expense.findMany({
      where: { status: "POSTED", ...locWhere },
      orderBy: { expenseDate: "desc" },
      take: 5,
      select: { id: true, expenseNumber: true, amount: true, expenseDate: true, location: { select: { name: true } } },
    }),
    // Trends
    prisma.sale.findMany({
      where: { status: "COMPLETED", ...locWhere, soldAt: { gte: lastSevenStart, lte: todayEnd } },
      select: { soldAt: true, total: true },
    }),
    prisma.alertRecord.count({ where: { ...locWhere } }),
    prisma.transfer.count({ where: { status: { in: ["DRAFT", "SENT"] } } }),
    // Global Stats
    Promise.all([
      prisma.customer.count({ where: { isActive: true } }),
      prisma.supplier.count({ where: { isActive: true } }),
      prisma.location.count({ where: { isActive: true } }),
      prisma.location.count({ where: { type: "SHOP", isActive: true } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isActive: true } }),
    ]),
    prisma.sale.groupBy({
      by: ["paymentMethod"],
      where: { status: "COMPLETED", ...locWhere },
      _sum: { total: true },
    }),
    prisma.location.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
    // Credit Distribution
    prisma.customer.count({
        where: { sales: { some: { status: "COMPLETED", paymentStatus: { in: ["UNPAID", "PARTIAL"] }, ...locWhere } } }
    }),
    // Monthly Sales for the past 12 months
    prisma.sale.groupBy({
      by: ["soldAt"],
      where: { status: "COMPLETED", ...locWhere, soldAt: { gte: startOfMonth(subMonths(new Date(), 11)) } },
      _sum: { total: true },
    }),
    // Top Selling Products
    prisma.saleItem.groupBy({
      by: ["productId"],
      where: { sale: { status: "COMPLETED", ...locWhere } },
      _sum: { quantity: true, lineTotal: true },
      _count: { id: true },
      orderBy: { _sum: { lineTotal: "desc" } },
      take: 5,
    }),
    // Product retail prices for inventory valuation
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, sellingPrice: true },
    }),
    // USD Metrics
    prisma.purchase.findMany({
      where: { trackInUsd: true, paymentStatus: { in: ["UNPAID", "PARTIAL"] }, ...locWhere },
      select: { usdTotal: true, usdAmountPaid: true }
    }),
    prisma.saleItem.aggregate({
      where: {
        sale: { status: "COMPLETED", ...locWhere, soldAt: { gte: startOfMonth(now), lte: endOfMonth(now) } },
        discount: { gt: 0 }
      },
      _sum: { discount: true }
    }),
    prisma.saleItem.count({
      where: {
        sale: { status: "COMPLETED", ...locWhere, soldAt: { gte: startOfMonth(now), lte: endOfMonth(now) } },
        discount: { gt: 0 }
      }
    }),
  ]);

  const [
    todaySales,
    yesterdaySales,
    todaySaleItems,
    stockSummary,
    lowStock,
    receivableAggregate,
    supplierAggregate,
    recentSales,
    recentPurchases,
    recentExpenses,
    sevenDaySales,
    activeAlertsCount,
    pendingTransfersCount,
    countsRaw,
    paymentMethodGroups,
    allLocations,
    creditCustomersCount,
    monthlySalesGroups,
    topProductSales,
    productPrices,
    usdPayablesList,
    promoDiscountRaw,
    promoDiscountCount,
  ] = results as any;

  const counts = countsRaw;

  const [[customerCount, supplierCount, locationCount, shopCount, productCount, categoryCount]] = [counts] as any;

  // TREND CALCULATIONS
  const totalTodaySales = todaySales.reduce((acc: number, s: any) => acc + toNumber(s.total), 0);
  const totalYesterdaySales = yesterdaySales.reduce((acc: number, s: any) => acc + toNumber(s.total), 0);
  const salesDiff = totalTodaySales - totalYesterdaySales;
  const salesTrendPerc = totalYesterdaySales > 0 ? (salesDiff / totalYesterdaySales) * 100 : 0;

  const totalReceivables = toNumber(receivableAggregate._sum.amountDue);
  const totalRecTotal = toNumber(receivableAggregate._sum.total);
  const totalRecPaid = toNumber(receivableAggregate._sum.amountPaid);
  const recProgress = totalRecTotal > 0 ? Math.round((totalRecPaid / totalRecTotal) * 100) : 0;

  const totalPayables = toNumber(supplierAggregate._sum.amountDue);
  const totalPayTotal = toNumber(supplierAggregate._sum.total);
  const totalPayPaid = toNumber(supplierAggregate._sum.amountPaid);
  const payProgress = totalPayTotal > 0 ? Math.round((totalPayPaid / totalPayTotal) * 100) : 0;

  const usdPayablesRaw = {
    _sum: {
      usdTotal: (usdPayablesList as any[]).reduce((acc, p) => acc + toNumber(p.usdTotal), 0),
      usdAmountPaid: (usdPayablesList as any[]).reduce((acc, p) => acc + toNumber(p.usdAmountPaid), 0),
    }
  };
  
  let todayCOGS = 0;
  todaySaleItems.forEach((item: any) => {
    todayCOGS += toNumber(item.quantity) * toNumber(item.product.buyingPrice);
  });
  const todayProfit = totalTodaySales - todayCOGS;
  const totalStockValue = stockSummary.reduce((acc: number, s: any) => acc + s.stockValue, 0);
  const totalRetailValue = stockSummary.reduce((acc: number, s: any) => acc + s.retailValue, 0);
  const totalStockItems = stockSummary.filter((s: any) => s.quantity > 0).length;

  const metrics: MetricCard[] = [
    { 
        title: "Today's Sales", value: formatCurrency(totalTodaySales), 
        subStats: [{ label: "Txns", value: String(todaySales.length) }, { label: "Avg Sale", value: todaySales.length > 0 ? formatCurrency(totalTodaySales / todaySales.length) : "ETB 0" }],
        href: `/sales/sales-list?dateFrom=${todayStart.toISOString().split('T')[0]}&dateTo=${todayEnd.toISOString().split('T')[0]}`, footerLabel: "View Sales" 
    },
    { 
        title: "Today's Profit", value: formatCurrency(todayProfit), icon: "TrendingUp", tone: todayProfit > 0 ? "success" : "default",
        meta: "Estimated gross margin",
        subStats: [{ label: "Margin", value: totalTodaySales > 0 ? `${((todayProfit / totalTodaySales) * 100).toFixed(1)}%` : "0%" }],
        href: "/sales/sales-list", footerLabel: "View Analysis" 
    },
    { 
        title: "Total Products", value: String(productCount), icon: "Package", 
        subStats: [{ label: "Categories", value: String(categoryCount) }, { label: "Valuation", value: `${(totalStockValue / 1000000).toFixed(1)}M` }],
        href: "/inventory/products", footerLabel: "View Products" 
    },
    { 
        title: "Inventory Value", value: formatCurrency(Math.max(totalStockValue, 0)), icon: "Layers", tone: "warning", 
        subStats: [{ label: "Retail Value", value: formatCurrency(Math.max(totalRetailValue, 0)) }, { label: "Items in Stock", value: String(totalStockItems) }],
        href: "/inventory/stock", footerLabel: "View Stock" 
    },
  ];

  const summary: MetricCard[] = [
    { title: "Customers", value: String(customerCount), icon: "Users", subStats: [{ label: "Credit", value: String(creditCustomersCount) }], href: "/sales/customers", footerLabel: "View CRM" },
    { title: "Suppliers", value: String(supplierCount), icon: "Truck", href: "/purchases/suppliers", footerLabel: "View Suppliers" },
    { 
        title: "Customer Credit", value: formatCurrency(totalReceivables), tone: "warning", icon: "ArrowUpRight", 
        progress: { value: recProgress, label: "Collection Progress" },
        href: "/sales/customer-credit", footerLabel: "View Credits" 
    },
    { 
        title: "Supplier Debt", value: formatCurrency(totalPayables), tone: "danger", icon: "ArrowDownLeft", 
        subStats: [
          { label: "USD Debt", value: formatUsd(toNumber(usdPayablesRaw._sum.usdTotal) - toNumber(usdPayablesRaw._sum.usdAmountPaid)) }
        ],
        progress: { value: payProgress, label: "Payment Progress", color: "bg-rose-500" },
        href: "/purchases/supplier-payments", footerLabel: "View Debt" 
    },
    { 
        title: "Promo Discounts", value: formatCurrency(toNumber(promoDiscountRaw._sum.discount)), icon: "Percent", 
        subStats: [{ label: "Items", value: String(promoDiscountCount) }, { label: "Period", value: "This Month" }],
        href: "/reports/discounted-items", footerLabel: "View Report" 
    },
  ];

  const alerts: MetricCard[] = [
    { 
        title: "System Alerts", 
        value: String(activeAlertsCount), 
        tone: activeAlertsCount > 0 ? "danger" : "default", 
        icon: "BellRing", 
        meta: "Threshold crossings pending resolution",
        href: "/inventory/alert-records", 
        footerLabel: "Review Logs" 
    },
    { 
        title: "Critical Stock", 
        value: String(lowStock.length), 
        tone: lowStock.length > 0 ? "warning" : "default", 
        icon: "AlertTriangle", 
        meta: "Items currently below min level",
        href: "/inventory/low-stock", 
        footerLabel: "Replenish Items" 
    },
    { 
        title: "Pending Transfers", 
        value: String(pendingTransfersCount), 
        icon: "ArrowLeftRight", 
        meta: "Active stock movements",
        href: "/inventory/transfers", 
        footerLabel: "Track Progress" 
    },
  ];

  // Trends
  const salesByDay = new Map<string, number>();
  sevenDaySales.forEach((s: any) => {
    const day = s.soldAt.toISOString().split("T")[0]!;
    salesByDay.set(day, (salesByDay.get(day) ?? 0) + toNumber(s.total));
  });

  const salesTrend: TrendPoint[] = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dayStr = d.toISOString().split("T")[0]!;
    return {
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      value: salesByDay.get(dayStr) ?? 0,
    };
  });

  const paymentMethods = paymentMethodGroups.map((g: any) => ({ label: g.paymentMethod, value: toNumber(g._sum.total) }));
  const locationStock: TrendPoint[] = allLocations.map((b: any) => {
      const locationStockVal = stockSummary.filter((s: any) => s.locationId === b.id).reduce((acc: number, curr: any) => acc + curr.stockValue, 0);
      return { label: b.name, value: locationStockVal };
  });

  // Monthly Sales Trend (last 12 months)
  const monthlyMap = new Map<string, number>();
  for (const group of monthlySalesGroups) {
    const monthKey = format(new Date(group.soldAt), "MMM");
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + toNumber(group._sum.total));
  }
  const monthlySalesTrend: TrendPoint[] = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(new Date(), 11 - i);
    const label = format(d, "MMM");
    return { label, value: monthlyMap.get(label) ?? 0 };
  });

  // Top Products — fetch product names
  const productIds = topProductSales.map((p: any) => p.productId);
  const productNames = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });
  const productNameMap = new Map(productNames.map(p => [p.id, p.name]));
  const topProducts: TopDashboardProduct[] = topProductSales.map((p: any) => ({
    id: p.productId,
    name: productNameMap.get(p.productId) ?? "Unknown",
    quantity: toNumber(p._sum.quantity),
    totalRevenue: toNumber(p._sum.lineTotal),
    totalSales: p._count.id,
  }));

  const recentTransactions = [
    ...recentSales.map((s: any) => ({ id: s.id, type: "Sale", reference: s.saleNumber, amount: toNumber(s.total), location: s.location.name, createdAt: s.soldAt.toISOString() })),
    ...recentPurchases.map((p: any) => ({ id: p.id, type: "Purchase", reference: p.purchaseNumber, amount: toNumber(p.total), location: p.location.name, createdAt: p.purchasedAt.toISOString() })),
    ...recentExpenses.map((e: any) => ({ id: e.id, type: "Expense", reference: e.expenseNumber, amount: toNumber(e.amount), location: e.location.name, createdAt: e.expenseDate.toISOString() }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return {
    metrics, summary, alerts, salesTrend, monthlySalesTrend, topProducts,
    recentTransactions,
    lowStock: lowStock.slice(0, 5),
    inventoryValue: {
      buyingValue: Math.max(totalStockValue, 0),
      retailValue: Math.max(totalRetailValue, 0),
      totalItems: totalStockItems,
    },
    charts: {
        paymentMethods,
        customerDist: [{ label: "Normal", value: Math.max(0, customerCount - creditCustomersCount) }, { label: "Credit", value: creditCustomersCount }],
        locationStock
    },
    usdExposure: {
      totalPayable: toNumber(usdPayablesRaw._sum.usdTotal) - toNumber(usdPayablesRaw._sum.usdAmountPaid),
      totalReceivable: 0, // Placeholder if needed later
    },
  };
}

async function getLowStockRows(locationId?: string): Promise<SimpleRow[]> {
  const summary = await getStockSummaryRows(locationId);
  return summary
    .filter(row => row.quantity <= row.minimumStockAlert && row.quantity > 0)
    .map(row => ({
      id: row.id, location: row.location, name: row.product, currentStock: row.quantity, minimumStockAlert: row.minimumStockAlert,
      status: row.quantity <= Math.max(1, Math.floor(row.minimumStockAlert / 2)) ? "CRITICAL" : "LOW",
      label: row.product, value: String(row.quantity),
    }));
}