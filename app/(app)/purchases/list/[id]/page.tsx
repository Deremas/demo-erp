export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  Printer, 
  Truck, 
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { PrintButton } from "@/components/shared/print-button";
import { requireSession } from "@/lib/auth/session";

export default async function PurchaseDetailPage(props: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const params = await props.params;
  const purchase = await prisma.purchase.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      purchaseNumber: true,
      invoiceNumber: true,
      purchasedAt: true,
      status: true,
      paymentStatus: true,
      subtotal: true,
      tax: true,
      discount: true,
      total: true,
      amountPaid: true,
      amountDue: true,
      usdTotal: true,
      usdAmountPaid: true,
      exchangeRate: true,
      trackInUsd: true,
      note: true,
      supplierId: true,
      locationId: true,
      location: {
        select: { id: true, name: true },
      },
      supplier: {
        select: { id: true, name: true, phone: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      items: {
        select: {
          id: true,
          quantity: true,
          unitCost: true,
          lineTotal: true,
          product: {
            select: {
              id: true,
              name: true,
              category: { select: { name: true } },
            },
          },
        },
      },
      supplierPayments: {
        select: {
          id: true,
          amount: true,
          paymentDate: true,
          isUsd: true,
          exchangeRate: true,
        },
      },
    },
  });

  if (!purchase) {
    notFound();
  }

  // Access Control: Ensure user is authorized to view this location's purchases
  const isAuthorized = user.role === "ADMIN" || user.locations.some(l => l.id === purchase.locationId);
  if (!isAuthorized) {
    redirect("/dashboard");
  }


  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      {/* Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="h-9 rounded-xl">
            <Link href="/purchases/list">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Link>
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <h1 className="text-xl font-black tracking-tight uppercase">Purchase Details</h1>
        </div>
        <div className="flex items-center gap-2">
          {Number(purchase.amountDue) > 0 && purchase.supplierId && (
            <Button size="sm" asChild className="rounded-xl shadow-lg font-bold">
              <Link href={`/purchases/supplier-payments?supplierId=${purchase.supplierId}&open=1`}>
                <CreditCard className="mr-2 h-4 w-4" />
                Settle Payment
              </Link>
            </Button>
          )}
          <PrintButton 
            url={`/print/purchase/${purchase.id}`} 
            variant="outline" 
            className="rounded-xl border-slate-200 shadow-sm"
            label="Print Invoice"
          />
          <Button className="rounded-xl shadow-lg shadow-primary/20" asChild>
            <Link href={`/purchases/new?purchaseId=${purchase.id}&mode=edit&open=1`}>
              Edit Purchase
            </Link>
          </Button>
        </div>
      </div>

      {/* Header Strip */}
      <Card className="border-none bg-slate-50 shadow-none dark:bg-slate-900/40">
        <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Purchase No.</p>
            <p className="text-lg font-black tracking-tight">{purchase.purchaseNumber}</p>
            <Badge variant={purchase.status === "POSTED" ? "success" : "warning"} className="rounded-lg">
              {purchase.status}
            </Badge>
          </div>
          <div className="space-y-1.5 border-l border-slate-200 pl-6 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Supplier</p>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-slate-400" />
              <p className="font-bold">{purchase.supplier?.name ?? "Internal source"}</p>
            </div>
            <p className="text-xs text-slate-500">{purchase.supplier?.phone || "No phone"}</p>
          </div>
          <div className="space-y-1.5 border-l border-slate-200 pl-6 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Destination</p>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <p className="font-bold">{purchase.location.name}</p>
            </div>
            <p className="text-xs text-slate-500">Recorded by {purchase.createdBy.name}</p>
          </div>
          <div className="space-y-1.5 border-l border-slate-200 pl-6 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Timestamp</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <p className="font-bold">{format(new Date(purchase.purchasedAt), "dd MMM yyyy")}</p>
            </div>
            <p className="text-xs text-slate-500">{format(new Date(purchase.purchasedAt), "HH:mm")}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_480px]">
        {/* Items Section */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-slate-200/60 shadow-sm dark:border-slate-800/60">
            <CardHeader className="border-b border-slate-100 bg-slate-50/30 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Purchased Inventory</CardTitle>
                <Badge variant="outline" className="bg-white dark:bg-slate-950">{purchase.items.length} Lines</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/20 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:border-slate-800">
                    <th className="px-4 py-2.5">Product</th>
                    <th className="px-4 py-2.5 text-center w-[80px]">Qty</th>
                    <th className="px-4 py-2.5 text-right w-[130px]">Unit Cost</th>
                    <th className="px-4 py-2.5 text-right w-[150px]">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
                  {purchase.items.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-900/20">
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-bold leading-tight">{item.product.name}</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-tight">{item.product.category?.name ?? "General"}</p>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex flex-col -space-y-0.5">
                          <span className="text-xs font-bold">{formatCurrency(Number(item.unitCost))}</span>
                          {purchase.trackInUsd && Number(purchase.exchangeRate) > 0 && (
                            <span className="text-[9px] text-slate-400 font-bold">
                              ${(Number(item.unitCost) / Number(purchase.exchangeRate)).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex flex-col -space-y-0.5">
                          <span className="text-xs font-black text-slate-900 dark:text-slate-100">{formatCurrency(Number(item.lineTotal))}</span>
                          {purchase.trackInUsd && Number(purchase.exchangeRate) > 0 && (
                            <span className="text-[9px] text-slate-400 font-bold">
                              ${(Number(item.lineTotal) / Number(purchase.exchangeRate)).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Payment History */}
          {purchase.supplierPayments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 px-1">Payment History</h3>
              <div className="grid gap-3">
                {purchase.supplierPayments.map((payment) => (
                  <Card key={payment.id} className="border-slate-200/50 bg-white/50 shadow-none dark:border-slate-800/50">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Supplier Settlement</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                            {formatDateTime(payment.paymentDate)}
                            {payment.isUsd && payment.exchangeRate && (
                               <span className="ml-2 text-indigo-500">@ {Number(payment.exchangeRate).toFixed(2)}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {payment.isUsd ? (
                          <>
                            <p className="font-black text-emerald-600">{formatCurrency(Number(payment.amount))}</p>
                            <p className="text-[10px] font-bold text-slate-400">
                              ${(Number(payment.amount) / Number(payment.exchangeRate || 1)).toFixed(2)} USD paid at current rate
                            </p>
                          </>
                        ) : (
                          <p className="font-black text-emerald-600">{formatCurrency(Number(payment.amount))}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Financial Sidebar */}
        <div className="space-y-6">
          <Card className="border-none bg-slate-900 text-white shadow-xl shadow-slate-200/50 dark:shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Financial Summary</CardTitle>
                <CreditCard className="h-4 w-4 text-slate-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Gross Subtotal</span>
                  <span className="font-medium">{formatCurrency(Number(purchase.subtotal))}</span>
                </div>
                {Number(purchase.tax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Tax</span>
                    <span className="font-medium">{formatCurrency(Number(purchase.tax))}</span>
                  </div>
                )}
                {Number(purchase.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-rose-400">Discount</span>
                    <span className="font-medium text-rose-400">-{formatCurrency(Number(purchase.discount))}</span>
                  </div>
                )}
                <div className="h-px bg-slate-800 my-2" />
                <div className="flex justify-between items-baseline">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold">Total Payable</span>
                    {purchase.trackInUsd && (
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rate: {Number(purchase.exchangeRate).toFixed(2)}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black tracking-tighter block">{formatCurrency(Number(purchase.total))}</span>
                    {purchase.trackInUsd && (
                      <span className="text-sm font-bold text-indigo-400">${Number(purchase.usdTotal).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl bg-white/5 p-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Amount Paid</span>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 block">{formatCurrency(Number(purchase.amountPaid))}</span>
                    {purchase.trackInUsd && (
                       <span className="text-[10px] font-bold text-emerald-500/70">${Number(purchase.usdAmountPaid).toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Outstanding Balance</span>
                  <div className="text-right">
                    <span className={Number(purchase.amountDue) > 0 ? "text-amber-400 font-bold block" : "text-slate-500 font-bold block"}>
                      {formatCurrency(Number(purchase.amountDue))}
                    </span>
                    {purchase.trackInUsd && Number(purchase.amountDue) > 0 && Number(purchase.exchangeRate) > 0 && (
                      <span className="text-[10px] font-bold text-amber-500/70">${(Number(purchase.amountDue) / Number(purchase.exchangeRate)).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <div className="h-2 flex-1 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${(Number(purchase.amountPaid) / Number(purchase.total)) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {Math.round((Number(purchase.amountPaid) / Number(purchase.total)) * 100)}% Settled
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-slate-50/50 shadow-none dark:bg-slate-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Reference Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inv. Ref</span>
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <span>{purchase.invoiceNumber || "N/A"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment</span>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                  {purchase.paymentStatus === "PAID" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  <span className={purchase.paymentStatus === "PAID" ? "text-emerald-500" : "text-amber-500"}>
                    {purchase.paymentStatus}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}