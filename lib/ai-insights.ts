import { subDays } from "date-fns";

import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/data-runtime-utils";
import { formatCurrency, parseFilterList } from "@/lib/utils";
import { getLowStockRows } from "@/lib/page-data-inventory";
import { getStockSummaryRows } from "@/lib/stock-runtime-data";
import { getCustomerRows } from "@/lib/page-data-sales";

export type AiInsight = {
  title: string;
  detail: string;
  href?: string;
};

export type AiInsightsSnapshot = {
  summary: string;
  recommendations: AiInsight[];
  creditRisk: AiInsight[];
  anomalies: AiInsight[];
  suggestedPurchases: AiInsight[];
};

function locWhere(locationId?: string): Record<string, unknown> {
  const locationIds = parseFilterList(locationId);
  if (!locationIds) return {};
  return locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } };
}

export async function getAiInsightsSnapshot(locationId?: string): Promise<AiInsightsSnapshot> {
  const since = subDays(new Date(), 30);
  const where = locWhere(locationId) as any;
  const customerFilters = locationId ? { locationId, status: "ACTIVE" as const } : { status: "ACTIVE" as const };

  const [sales, expenses, receivables, payables, lowStock, stock, customers, discounted] = await Promise.all([
    prisma.sale.aggregate({
      where: { status: "COMPLETED", ...where, soldAt: { gte: since } },
      _sum: { total: true, amountDue: true },
      _count: { _all: true },
    }),
    prisma.expense.aggregate({
      where: { status: "POSTED", ...where, expenseDate: { gte: since } },
      _sum: { amount: true },
    }),
    prisma.sale.aggregate({
      where: { status: "COMPLETED", paymentStatus: { in: ["UNPAID", "PARTIAL"] }, ...where },
      _sum: { amountDue: true },
    }),
    prisma.purchase.aggregate({
      where: { status: "POSTED", paymentStatus: { in: ["UNPAID", "PARTIAL"] }, ...where },
      _sum: { amountDue: true },
    }),
    getLowStockRows(locationId),
    getStockSummaryRows(locationId),
    getCustomerRows(customerFilters),
    prisma.saleItem.findMany({
      where: {
        discount: { gt: 0 },
        sale: {
          status: "COMPLETED",
          soldAt: { gte: since },
          ...where,
        } as any,
      },
      take: 8,
      orderBy: { discount: "desc" },
      select: {
        discount: true,
        unitPrice: true,
        product: { select: { name: true } },
        sale: { select: { saleNumber: true, id: true } },
      },
    }),
  ]);

  const salesTotal = toNumber(sales._sum.total);
  const expenseTotal = toNumber(expenses._sum.amount);
  const receivableTotal = toNumber(receivables._sum.amountDue);
  const payableTotal = toNumber(payables._sum.amountDue);
  const stockValue = stock.reduce((sum, row) => sum + toNumber(row.stockValue), 0);

  const slowMoving = stock
    .filter((row) => row.quantity > 0 && row.lastMovementDate.getTime() === 0)
    .slice(0, 5);

  const creditRisk = customers
    .filter((row) => toNumber(row.creditBalance) > 0)
    .sort((left, right) => toNumber(right.creditBalance) - toNumber(left.creditBalance))
    .slice(0, 6)
    .map((row) => {
      const limit = toNumber(row.creditLimit);
      const outstanding = toNumber(row.creditBalance);
      const overLimit = limit > 0 && outstanding > limit;
      return {
        title: String(row.name),
        detail: overLimit
          ? `${String(row.partyType)} is over the ${formatCurrency(limit)} limit with ${formatCurrency(outstanding)} outstanding.`
          : `${String(row.partyType)} has ${formatCurrency(outstanding)} outstanding credit.`,
        href: `/sales/customers/${row.id}`,
      };
    });

  const recommendations: AiInsight[] = [
    ...lowStock.slice(0, 6).map((row) => ({
      title: String(row.product ?? row.name ?? "Low stock item"),
      detail: `Stock is below the alert level at ${String(row.location ?? "this location")}. Reorder before shop sales continue.`,
      href: "/inventory/low-stock",
    })),
    ...slowMoving.map((row) => ({
      title: row.product,
      detail: `${row.quantity} units are sitting with little recent movement. Review pricing or transfer to a faster shop.`,
      href: "/inventory/stock",
    })),
  ];

  const suggestedPurchases: AiInsight[] = lowStock.slice(0, 8).map((row) => {
    const current = toNumber(row.currentStock ?? row.baseQuantity);
    const alert = toNumber(row.minimumStockAlert);
    const qty = Math.max(12, alert * 2 - current);
    return {
      title: String(row.product ?? row.name ?? "Item"),
      detail: `Suggested purchase quantity: ${qty} units based on alert level and current stock.`,
      href: "/purchases/new",
    };
  });

  const anomalies: AiInsight[] = discounted.map((row) => ({
    title: row.product.name,
    detail: `Unusual discount of ${formatCurrency(toNumber(row.discount))} on sale ${row.sale.saleNumber} at unit price ${formatCurrency(toNumber(row.unitPrice))}.`,
    href: `/sales/sales-list/${row.sale.id}`,
  }));

  const summary = [
    `In the last 30 days there were ${sales._count._all} completed sales totaling ${formatCurrency(salesTotal)}.`,
    `Operating expenses were ${formatCurrency(expenseTotal)}.`,
    `Customer receivables are ${formatCurrency(receivableTotal)} and supplier payables are ${formatCurrency(payableTotal)}.`,
    `Current stock value is about ${formatCurrency(stockValue)}.`,
    lowStock.length > 0
      ? `${lowStock.length} items are below the low-stock alert.`
      : "No low-stock alerts in the selected locations.",
  ].join(" ");

  return {
    summary,
    recommendations: recommendations.slice(0, 8),
    creditRisk,
    anomalies,
    suggestedPurchases,
  };
}

export function answerAiQuestion(question: string, snapshot: AiInsightsSnapshot) {
  const text = question.trim().toLowerCase();
  if (!text) {
    return snapshot.summary;
  }

  if (/(low.?stock|reorder|replenish|out of stock)/.test(text)) {
    return snapshot.recommendations.length
      ? snapshot.recommendations.map((item) => `${item.title}: ${item.detail}`).join(" ")
      : "No low-stock recommendations right now.";
  }

  if (/(credit|receivable|overdue|agent|balance)/.test(text)) {
    return snapshot.creditRisk.length
      ? snapshot.creditRisk.map((item) => `${item.title}: ${item.detail}`).join(" ")
      : "No outstanding customer or agent credit in this view.";
  }

  if (/(anomal|discount|unusual|fraud)/.test(text)) {
    return snapshot.anomalies.length
      ? snapshot.anomalies.map((item) => `${item.title}: ${item.detail}`).join(" ")
      : "No unusual discount activity was found in the last 30 days.";
  }

  if (/(purchase|import|supplier|buy)/.test(text)) {
    return snapshot.suggestedPurchases.length
      ? snapshot.suggestedPurchases.map((item) => `${item.title}: ${item.detail}`).join(" ")
      : "Stock levels do not currently suggest an urgent purchase.";
  }

  if (/(profit|sales|expense|cash|summary|report|finance)/.test(text)) {
    return snapshot.summary;
  }

  return `${snapshot.summary} Ask about low stock, credit risk, unusual discounts, suggested purchases, or the 30-day finance summary.`;
}
