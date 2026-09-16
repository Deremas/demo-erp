export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  User,
  MapPin,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { SaleReceiptActions } from "@/components/sales/sale-receipt-actions";
import { ReturnExchangeDialog } from "@/components/sales/return-exchange-dialog";

import { requireSession } from "@/lib/auth/session";

export default async function SaleDetailPage(props: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const params = await props.params;
  const sale = await prisma.sale.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      saleNumber: true,
      soldAt: true,
      paymentMethod: true,
      paymentStatus: true,
      note: true,
      subtotal: true,
      total: true,
      discountTotal: true,
      amountPaid: true,
      amountDue: true,
      status: true,
      customerId: true,
      locationId: true,
      location: {
        select: { id: true, name: true, phone: true },
      },
      customer: {
        select: { id: true, name: true, address: true, phone: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          discount: true,
          discountType: true,
          discountRate: true,
          lineTotal: true,
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              category: { select: { name: true } },
              unit: { select: { name: true } },
            },
          },
        },
      },
      customerPayments: {
        select: {
          id: true,
          amount: true,
          paymentDate: true,
        },
      },
      returns: {
        orderBy: { returnedAt: "desc" },
        select: {
          id: true,
          returnNumber: true,
          returnType: true,
          status: true,
          returnedAmount: true,
          exchangeAmount: true,
          differenceAmount: true,
          amountRefunded: true,
          amountCollected: true,
          refundMethod: true,
          reason: true,
          returnedAt: true,
          createdBy: { select: { name: true } },
          returnItems: {
            select: {
              id: true,
              originalSaleItemId: true,
              quantity: true,
              lineTotal: true,
              product: { select: { sku: true, name: true } },
            },
          },
          exchangeItems: {
            select: {
              id: true,
              quantity: true,
              lineTotal: true,
              product: { select: { sku: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!sale) {
    notFound();
  }

  // Access Control: Ensure user is authorized to view this location's sales
  const isAuthorized = user.role === "ADMIN" || user.locations.some(l => l.id === sale.locationId);
  if (!isAuthorized) {
    redirect("/dashboard");
  }

  const returnedQuantityByItem = new Map<string, number>();
  for (const returnRecord of sale.returns) {
    if (returnRecord.status !== "COMPLETED") continue;
    for (const item of returnRecord.returnItems) {
      returnedQuantityByItem.set(
        item.originalSaleItemId,
        (returnedQuantityByItem.get(item.originalSaleItemId) ?? 0) + item.quantity,
      );
    }
  }

  const returnableItems = sale.items.map((item) => {
    const alreadyReturned = returnedQuantityByItem.get(item.id) ?? 0;
    return {
      id: item.id,
      itemCode: item.product.sku,
      itemName: item.product.name,
      soldQuantity: item.quantity,
      alreadyReturned,
      returnableQuantity: Math.max(0, item.quantity - alreadyReturned),
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount),
      unitName: item.product.unit?.name ?? "unit",
    };
  });
  const completedReturns = sale.returns.filter((returnRecord) => returnRecord.status === "COMPLETED");
  const totalReturnedValue = completedReturns.reduce(
    (sum, returnRecord) => sum + Number(returnRecord.returnedAmount),
    0,
  );
  const totalExchangeValue = completedReturns.reduce(
    (sum, returnRecord) => sum + Number(returnRecord.exchangeAmount),
    0,
  );
  const totalRefunded = completedReturns.reduce(
    (sum, returnRecord) => sum + Number(returnRecord.amountRefunded),
    0,
  );
  const totalCollected = completedReturns.reduce(
    (sum, returnRecord) => sum + Number(returnRecord.amountCollected),
    0,
  );
  const adjustedSaleValue = Number((Number(sale.total) - totalReturnedValue + totalExchangeValue).toFixed(2));
  const adjustedAmountPaid = Number((Number(sale.amountPaid) - totalRefunded + totalCollected).toFixed(2));
  const adjustedAmountDue = Math.max(0, Number((adjustedSaleValue - adjustedAmountPaid).toFixed(2)));
  const hasReturnableItems = returnableItems.some((item) => item.returnableQuantity > 0);
  const isReturnEligible = sale.status === "COMPLETED" || sale.status === "PARTIALLY_RETURNED" || sale.status === "PARTIALLY_EXCHANGED";

  const [products, stockRows, financeAccounts] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        sku: true,
        name: true,
        sellingPrice: true,
        unit: { select: { name: true } },
      },
    }),
    prisma.stockMovement.groupBy({
      by: ["productId"],
      where: { locationId: sale.locationId },
      _sum: { quantity: true },
    }),
    prisma.financeAccount.findMany({
      where: {
        isActive: true,
        OR: [{ locationId: sale.locationId }, { locationId: null }],
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
      },
    }),
  ]);
  const stockByProduct = new Map(stockRows.map((row) => [row.productId, row._sum.quantity ?? 0]));
  const exchangeProducts = products.map((product) => ({
    id: product.id,
    itemCode: product.sku,
    itemName: product.name,
    availableStock: stockByProduct.get(product.id) ?? 0,
    unitPrice: Number(product.sellingPrice),
    unitName: product.unit?.name ?? "unit",
  }));

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      {/* Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="h-9 rounded-xl">
            <Link href="/sales/sales-list">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Link>
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <h1 className="text-xl font-black tracking-tight uppercase">Sale Details</h1>
        </div>
          {Number(sale.amountDue) > 0 && sale.customerId && (
            <Button size="sm" asChild className="rounded-xl shadow-lg font-bold">
              <Link href={`/sales/customer-payments?customerId=${sale.customerId}&open=1`}>
                <CreditCard className="mr-2 h-4 w-4" />
                Settle Credit
              </Link>
            </Button>
          )}
          <SaleReceiptActions saleId={sale.id} />
          <ReturnExchangeDialog
            saleId={sale.id}
            eligible={isReturnEligible && hasReturnableItems}
            returnableItems={returnableItems}
            exchangeProducts={exchangeProducts}
            financeAccounts={financeAccounts}
          />
          <Button className="rounded-xl shadow-lg shadow-primary/20" asChild>
            <Link href={`/sales/new?saleId=${sale.id}&mode=edit&open=1`}>
              Edit Sale
            </Link>
          </Button>
      </div>

      {/* Header Strip */}
      <Card className="border-none bg-slate-50 shadow-none dark:bg-slate-900/40">
        <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sale Number</p>
            <p className="text-lg font-black tracking-tight">{sale.saleNumber}</p>
            <Badge variant={sale.status === "COMPLETED" ? "success" : "warning"} className="rounded-lg">
              {sale.status}
            </Badge>
          </div>
          <div className="space-y-1.5 border-l border-slate-200 pl-6 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Customer</p>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <p className="font-bold">{sale.customer?.name ?? "Walk-in"}</p>
            </div>
            <p className="text-xs text-slate-500">{sale.customer?.phone || "No phone"}</p>
          </div>
          <div className="space-y-1.5 border-l border-slate-200 pl-6 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Location</p>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <p className="font-bold">{sale.location.name}</p>
            </div>
            <p className="text-xs text-slate-500">Sold by {sale.createdBy.name}</p>
          </div>
          <div className="space-y-1.5 border-l border-slate-200 pl-6 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Timestamp</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <p className="font-bold">{format(new Date(sale.soldAt), "dd MMM yyyy")}</p>
            </div>
            <p className="text-xs text-slate-500">{format(new Date(sale.soldAt), "HH:mm")}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-8">
        {/* Items Section */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-slate-200/60 shadow-sm dark:border-slate-800/60">
            <CardHeader className="border-b border-slate-100 bg-slate-50/30 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Sold Items</CardTitle>
                  <p className="mt-1 text-xs text-slate-400">What the customer bought, returned, and kept.</p>
                </div>
                <Badge variant="outline" className="bg-white dark:bg-slate-950">{sale.items.length} Lines</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="min-w-[820px] w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/20 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-slate-800">
                    <th className="px-6 py-3">Product</th>
                    <th className="px-4 py-3">Item Code</th>
                    <th className="px-4 py-3 text-center">Sold</th>
                    <th className="px-4 py-3 text-center">Returned</th>
                    <th className="px-4 py-3 text-center">Customer Kept</th>
                    <th className="px-6 py-3 text-right">Sold Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
                  {sale.items.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-900/20">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold">{item.product.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">{item.product.category?.name ?? "General"}</p>
                      </td>
                      <td className="px-4 py-4 text-sm font-bold">{item.product.sku}</td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-slate-100 text-xs font-bold dark:bg-slate-800">
                            {item.quantity} {item.product.unit?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Badge variant={(returnedQuantityByItem.get(item.id) ?? 0) > 0 ? "warning" : "outline"}>
                          {returnedQuantityByItem.get(item.id) ?? 0} {item.product.unit?.name}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Badge variant={item.quantity - (returnedQuantityByItem.get(item.id) ?? 0) > 0 ? "success" : "outline"}>
                          {Math.max(0, item.quantity - (returnedQuantityByItem.get(item.id) ?? 0))} {item.product.unit?.name}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-slate-100">
                        {formatCurrency(Number(item.lineTotal))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section: Financials & Metadata */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Financial Summary Card */}
          <div className="lg:col-span-5">
          <Card className="border-none bg-slate-900 text-white shadow-xl shadow-slate-200/50 dark:shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Money Summary</CardTitle>
                <CreditCard className="h-4 w-4 text-slate-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">First Sale</p>
                  <p className="text-4xl font-black tracking-tight text-white leading-none">
                    {formatCurrency(Number(sale.total))}
                  </p>
                </div>
                {completedReturns.length > 0 ? (
                  <div className="space-y-2 border-t border-slate-800 pt-4 text-sm">
                    <div className="flex justify-between text-rose-300">
                      <span>Items brought back</span>
                      <span>-{formatCurrency(totalReturnedValue)}</span>
                    </div>
                    <div className="flex justify-between text-sky-300">
                      <span>New items given</span>
                      <span>+{formatCurrency(totalExchangeValue)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-3 font-black">
                      <span>Final sale value</span>
                      <span>{formatCurrency(adjustedSaleValue)}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4 rounded-2xl bg-white/5 p-5 border border-white/5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Paid on first sale</span>
                  <span className="font-bold text-base">{formatCurrency(Number(sale.amountPaid))}</span>
                </div>
                {totalCollected > 0 ? (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Extra money received</span>
                    <span className="font-bold text-emerald-400">+{formatCurrency(totalCollected)}</span>
                  </div>
                ) : null}
                {totalRefunded > 0 ? (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Money given back</span>
                    <span className="font-bold text-rose-400">-{formatCurrency(totalRefunded)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Total money received</span>
                  <span className="font-bold text-emerald-400 text-base">{formatCurrency(adjustedAmountPaid)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-3 text-sm">
                  <span className="text-slate-400 font-medium">Still to pay</span>
                  <span className={cn(
                    "font-bold text-base",
                    adjustedAmountDue > 0 ? "text-amber-400" : "text-slate-500"
                  )}>{formatCurrency(adjustedAmountDue)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <div className="h-2 flex-1 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${adjustedSaleValue > 0 ? Math.min(100, (adjustedAmountPaid / adjustedSaleValue) * 100) : 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {adjustedSaleValue > 0 ? Math.min(100, Math.round((adjustedAmountPaid / adjustedSaleValue) * 100)) : 100}% Settled
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Right Column: Metadata & History */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-none bg-slate-50/50 shadow-none dark:bg-slate-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">First Sale Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Method</span>
                <Badge variant="outline" className="font-bold">{sale.paymentMethod}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                  {sale.paymentStatus === "PAID" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  <span className={sale.paymentStatus === "PAID" ? "text-emerald-500" : "text-amber-500"}>
                    {sale.paymentStatus}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {sale.customerPayments.length > 0 && (
            <div className="space-y-4 overflow-y-auto max-h-[400px]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Recent Payments</h3>
              <div className="grid gap-3">
                {sale.customerPayments.map((payment) => (
                  <Card key={payment.id} className="border-slate-200/50 bg-white shadow-none dark:border-slate-800/50 dark:bg-slate-900/40">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">Settlement Payment</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{formatDateTime(payment.paymentDate)}</p>
                        </div>
                      </div>
                      <p className="font-black text-emerald-600">{formatCurrency(Number(payment.amount))}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          <Card className="border-slate-200/50 bg-white shadow-none dark:border-slate-800/50 dark:bg-slate-900/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Returns and Exchanges</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {sale.returns.length === 0 ? (
                <p className="p-6 text-sm text-slate-500">No returns or exchanges recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[1000px] w-full text-left text-xs">
                    <thead>
                      <tr className="border-y border-slate-100 bg-slate-50/60 font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-900/40">
                        <th className="px-4 py-3">Record</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Items Brought Back</th>
                        <th className="px-4 py-3">New Items Given</th>
                        <th className="px-4 py-3">Money</th>
                        <th className="px-4 py-3">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sale.returns.map((returnRecord) => (
                        <tr key={returnRecord.id} className="align-top">
                          <td className="px-4 py-4">
                            <p className="font-black text-slate-900 dark:text-slate-100">{returnRecord.returnNumber}</p>
                            <p className="mt-1 text-slate-500">{formatDateTime(returnRecord.returnedAt)}</p>
                            <p className="text-slate-500">By {returnRecord.createdBy.name}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-bold">
                              {returnRecord.returnType === "EXCHANGE"
                                ? "Item Exchange"
                                : returnRecord.returnType === "FULL_RETURN"
                                  ? "Full Return"
                                  : "Partial Return"}
                            </p>
                            <Badge className="mt-2" variant={returnRecord.status === "COMPLETED" ? "success" : "warning"}>
                              {returnRecord.status === "COMPLETED" ? "Done" : returnRecord.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            {returnRecord.returnItems.length ? (
                              <div className="space-y-2">
                                {returnRecord.returnItems.map((item) => (
                                  <div key={item.id}>
                                    <p className="font-bold">{item.product.name}</p>
                                    <p className="text-slate-500">{item.product.sku} | Qty {item.quantity}</p>
                                  </div>
                                ))}
                                <p className="font-black text-rose-600">{formatCurrency(Number(returnRecord.returnedAmount))}</p>
                              </div>
                            ) : (
                              <span className="text-slate-400">None</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {returnRecord.exchangeItems.length ? (
                              <div className="space-y-2">
                                {returnRecord.exchangeItems.map((item) => (
                                  <div key={item.id}>
                                    <p className="font-bold">{item.product.name}</p>
                                    <p className="text-slate-500">{item.product.sku} | Qty {item.quantity}</p>
                                  </div>
                                ))}
                                <p className="font-black text-sky-600">{formatCurrency(Number(returnRecord.exchangeAmount))}</p>
                              </div>
                            ) : (
                              <span className="text-slate-400">None</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-bold">
                              {Number(returnRecord.differenceAmount) > 0
                                ? "Received from customer"
                                : Number(returnRecord.differenceAmount) < 0
                                  ? "Given back to customer"
                                  : "No money moved"}
                            </p>
                            <p className="mt-1 text-base font-black">
                              {formatCurrency(Math.abs(Number(returnRecord.differenceAmount)))}
                            </p>
                            <p className="mt-1 text-slate-500">
                              {returnRecord.refundMethod?.replaceAll("_", " ") ?? "Not recorded"}
                            </p>
                          </td>
                          <td className="max-w-[180px] px-4 py-4 text-slate-600 dark:text-slate-300">
                            {returnRecord.reason ?? "Not recorded"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
);
}