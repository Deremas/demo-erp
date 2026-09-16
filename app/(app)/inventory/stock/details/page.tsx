export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Boxes, Clock, DollarSign } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStockSummaryRows } from "@/lib/stock-runtime-data";
import { prisma } from "@/lib/prisma";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";
import { formatCurrency, formatDateTime, toTitleCase } from "@/lib/utils";

type StockDetailPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

function stockBreakdown(quantity: number, unit: string) {
  return `${quantity} ${unit}${quantity !== 1 ? "s" : ""}`;
}

export default async function StockDetailPage({ searchParams }: StockDetailPageProps) {
  const params = await searchParams;
  const locationId = getSingleSearchParam(params, "locationId");
  const productId = getSingleSearchParam(params, "productId");

  if (!locationId || !productId) {
    return notFound();
  }

  const [summaryRows, movements, priceAdjustments] = await Promise.all([
    getStockSummaryRows(locationId),
    prisma.stockMovement.findMany({
      where: { locationId, productId },
      orderBy: { movementDate: "desc" },
      take: 50,
      include: {
      },
    }),
    prisma.priceAdjustmentHistory.findMany({
      where: { locationId, productId },
      orderBy: { createdAt: "desc" },
      take: 25,
      include: {
        batch: {
          include: {
            createdBy: { select: { name: true, username: true } },
          },
        },
      },
    }),
  ]);

  const purchaseIds = [
    ...new Set(
      movements
        .filter((movement) => movement.sourceType === "Purchase")
        .map((movement) => movement.sourceId),
    ),
  ];
  const purchases = purchaseIds.length
    ? await prisma.purchase.findMany({
        where: { id: { in: purchaseIds } },
        select: {
          id: true,
          purchaseNumber: true,
          trackInUsd: true,
          exchangeRate: true,
          purchasedAt: true,
          supplier: { select: { name: true } },
        },
      })
    : [];
  const purchaseById = new Map(purchases.map((purchase) => [purchase.id, purchase]));

  const stock = summaryRows.find((row) => row.locationId === locationId && row.productId === productId);

  if (!stock) {
    return notFound();
  }

  const status = stock.quantity <= 0 ? "OUT OF STOCK" : stock.quantity <= stock.minimumStockAlert ? "LOW STOCK" : "HEALTHY";
  const stockInMovements = movements.filter((movement) => movement.quantity > 0);

  function adjustmentLabel(mode: string) {
    if (mode === "PERCENTAGE_DECREASE") return "Decrease %";
    if (mode === "FIXED_INCREASE") return "Increase ETB";
    if (mode === "FIXED_DECREASE") return "Decrease ETB";
    if (mode === "SET_EXACT") return "Set exact";
    return "Increase %";
  }

  function sourceLabel(movement: (typeof movements)[number]) {
    const purchase = purchaseById.get(movement.sourceId);
    if (purchase) return purchase.purchaseNumber;
    return movement.sourceType;
  }

  function usdCostLabel(movement: (typeof movements)[number]) {
    const purchase = purchaseById.get(movement.sourceId);
    if (!purchase?.trackInUsd) return "-";

    const rate = Number(purchase.exchangeRate || 1);
    const unitCost = Number(movement.unitCost ?? 0);
    return `$ ${(unitCost / rate).toLocaleString(undefined, { maximumFractionDigits: 2 })} @ ${rate.toLocaleString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="-ml-2 rounded-full">
              <Link href="/inventory/stock">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{stock.product}</h1>
            <Badge variant={status === "HEALTHY" ? "success" : status === "LOW STOCK" ? "warning" : "secondary"}>
              {status}
            </Badge>
          </div>
          <p className="ml-9 text-sm text-muted-foreground">
            {stock.location} stock detail with price, value, and movement context.
          </p>
        </div>
        <div className="ml-9 flex gap-2 sm:ml-0">
          <Button variant="outline" asChild>
            <Link href={`/purchases/new?locationId=${locationId}&productId=${productId}`}>
              Purchase
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/sales/pos?locationId=${locationId}&productId=${productId}`}>
              Sell
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
            { title: "Current Stock", value: stockBreakdown(stock.quantity, stock.unit), meta: `${stock.quantity} ${stock.unit}${stock.quantity !== 1 ? "s" : ""}`, icon: Boxes },
            { title: "Unit", value: "Single unit only", meta: "No packaging configured", icon: Boxes },
          { title: "Stock Value", value: formatCurrency(stock.quantity * stock.buyingPrice), meta: `${formatCurrency(stock.buyingPrice)} / ${stock.unit}`, icon: DollarSign },
          { title: "Last Movement", value: stock.lastMovementDate.getTime() > 0 ? formatDateTime(stock.lastMovementDate) : "-", meta: `${movements.length} recent records loaded`, icon: Clock },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border-none shadow-sm ring-1 ring-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{item.title}</p>
                    <h3 className="mt-2 text-lg font-bold tracking-tight">{item.value}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border">
        <CardHeader className="border-b border-border/70 bg-muted/30">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Item Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-0 p-0 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Category", stock.category],
            ["Brand", stock.brand],
            ["Unit Buy", formatCurrency(stock.buyingPrice)],
            ["Unit Sell", formatCurrency(stock.sellingPrice)],
            ["Low Stock Alert", `${stock.minimumStockAlert} ${stock.unit}`],
            ["Location", stock.location],
          ].map(([label, value]) => (
            <div key={label} className="border-b border-r border-border/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{label}</p>
              <p className="mt-1 truncate text-sm font-bold text-foreground" title={value}>{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border">
        <CardHeader className="border-b border-border/70 bg-muted/30">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent Movements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-muted/40 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Transaction Qty</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Unit Cost</th>
                  <th className="px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No stock movement yet.</td>
                  </tr>
                ) : movements.map((movement) => (
                  <tr key={movement.id} className="border-t border-border/60">
                    <td className="px-4 py-3">{formatDateTime(movement.movementDate)}</td>
                    <td className="px-4 py-3 font-semibold">{toTitleCase(movement.movementType)}</td>
                    <td className="px-4 py-3">{Math.abs(movement.quantity)} {stock.unit}</td>
                    <td className="px-4 py-3">{movement.quantity} {stock.unit}</td>
                    <td className="px-4 py-3">{formatCurrency(Number(movement.unitCost ?? 0))}</td>
                    <td className="px-4 py-3">{sourceLabel(movement)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border">
        <CardHeader className="border-b border-border/70 bg-muted/30">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Stock In History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-muted/40 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Transaction Qty</th>
                  <th className="px-4 py-3">Qty In</th>
                  <th className="px-4 py-3">Unit Cost</th>
                  <th className="px-4 py-3">Total Cost</th>
                  <th className="px-4 py-3">USD Cost</th>
                  <th className="px-4 py-3">Supplier</th>
                </tr>
              </thead>
              <tbody>
                {stockInMovements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No stock-in records yet.</td>
                  </tr>
                ) : stockInMovements.map((movement) => {
                  const purchase = purchaseById.get(movement.sourceId);
                  const unitCost = Number(movement.unitCost ?? 0);
                  const totalCost = Math.abs(movement.quantity) * unitCost;

                  return (
                    <tr key={movement.id} className="border-t border-border/60">
                      <td className="px-4 py-3">{formatDateTime(movement.movementDate)}</td>
                      <td className="px-4 py-3 font-semibold">{sourceLabel(movement)}</td>
                      <td className="px-4 py-3">{movement.quantity} {stock.unit}</td>
                      <td className="px-4 py-3">{movement.quantity} {stock.unit}</td>
                      <td className="px-4 py-3">{formatCurrency(unitCost)}</td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(totalCost)}</td>
                      <td className="px-4 py-3">{usdCostLabel(movement)}</td>
                      <td className="px-4 py-3">{purchase?.supplier?.name ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border">
        <CardHeader className="border-b border-border/70 bg-muted/30">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Price Adjustment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-muted/40 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Adjustment</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                </tr>
              </thead>
              <tbody>
                {priceAdjustments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No price adjustment history yet.</td>
                  </tr>
                ) : priceAdjustments.map((adjustment) => (
                  <tr key={adjustment.id} className="border-t border-border/60">
                    <td className="px-4 py-3">{formatDateTime(adjustment.createdAt)}</td>
                    <td className="px-4 py-3">{adjustment.batch.createdBy.name || adjustment.batch.createdBy.username}</td>
                    <td className="px-4 py-3 font-semibold">{adjustmentLabel(adjustment.batch.mode)}</td>
                    <td className="px-4 py-3">{Number(adjustment.batch.amount).toLocaleString()}</td>
                    <td className="px-4 py-3">{formatCurrency(Number(adjustment.sellingPriceBefore))}</td>
                    <td className="px-4 py-3 font-bold text-primary">{formatCurrency(Number(adjustment.sellingPriceAfter))}</td>
                    <td className="px-4 py-3">{formatCurrency(Number(adjustment.sellingPriceBefore))}</td>
                    <td className="px-4 py-3 font-bold text-primary">{formatCurrency(Number(adjustment.sellingPriceAfter))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}