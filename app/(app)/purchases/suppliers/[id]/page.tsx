export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  Receipt,
} from "lucide-react";

import { SupplierWorkspaceTabs } from "@/components/purchases/supplier-workspace-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPurchaseRows,
  getSupplierMetrics,
  getSupplierPaymentRows,
} from "@/lib/page-data-purchases-finance-admin";
import { prisma } from "@/lib/prisma";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";
import type { SimpleColumn } from "@/lib/table";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type SupplierDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<RouteSearchParams>;
};

type MetricCard = {
  title: string;
  value: string;
  meta: string;
  tone: "default" | "success" | "warning" | "danger";
};

const purchaseColumns: SimpleColumn[] = [
  { key: "purchaseNumber", header: "Purchase No.", defaultHidden: true },
  { key: "location", header: "Location" },
  { key: "supplier", header: "Supplier" },
  { key: "itemsPurchased", header: "Items", type: "multiline" },
  { key: "total", header: "Total", type: "currency", showTotal: true },
  { key: "amountDue", header: "Amount Due", type: "currency", showTotal: true },
  { key: "usdTotal", header: "Total (USD)", type: "usd", showTotal: true },
  { key: "usdAmountDue", header: "Balance (USD)", type: "usd", showTotal: true },
  { key: "paymentStatus", header: "Status", type: "status" },
  { key: "purchasedAt", header: "Purchased At", type: "dateTime" },
];

const paymentColumns: SimpleColumn[] = [
  { key: "paymentNumber", header: "Payment No.", defaultHidden: true },
  { key: "supplier", header: "Supplier" },
  { key: "location", header: "Location" },
  { key: "account", header: "Account" },
  { key: "amount", header: "Amount", type: "currency", showTotal: true },
  { key: "appliedTo", header: "Applied To" },
  { key: "paidAt", header: "Paid At", type: "dateTime" },
  { key: "status", header: "Status", type: "status" },
];

function getMetricTone(tone: MetricCard["tone"]) {
  if (tone === "success") return "text-success";
  if (tone === "danger") return "text-danger";
  if (tone === "warning") return "text-warning";
  return "text-foreground";
}

export default async function SupplierDetailPage({
  params,
  searchParams,
}: SupplierDetailPageProps) {
  const { id: supplierId } = await params;
  const p = await searchParams;
  const locationId =
    getSingleSearchParam(p, "locationId") ?? getSingleSearchParam(p, "branchId");

  const [supplier, metricsData, purchaseRows, payableRows, paymentRows] =
    await Promise.all([
      prisma.supplier.findUnique({
        where: { id: supplierId },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          address: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      getSupplierMetrics(supplierId, locationId ?? undefined),
      getPurchaseRows({
        supplierId,
        ...(locationId ? { locationId } : {}),
      }),
      getPurchaseRows({
        supplierId,
        status: "DUE",
        ...(locationId ? { locationId } : {}),
      }),
      getSupplierPaymentRows({
        supplierId,
        ...(locationId ? { locationId } : {}),
      }),
    ]);

  if (!supplier) {
    return notFound();
  }

  const metrics: MetricCard[] = [
    {
      title: "Total Purchases",
      value: formatCurrency(metricsData.totalPurchases),
      meta: `${metricsData.purchaseCount} posted purchases`,
      tone: "default",
    },
    {
      title: "Amount Paid",
      value: formatCurrency(metricsData.totalPaid),
      meta: `${metricsData.paymentCount} payment records`,
      tone: "success",
    },
    {
      title: "Payable Balance",
      value: formatCurrency(metricsData.payableBalance),
      meta: metricsData.usdPayable > 0 ? `+ $${metricsData.usdPayable.toLocaleString()} USD` : "Outstanding supplier debt",
      tone: metricsData.payableBalance > 0 || metricsData.usdPayable > 0 ? "danger" : "default",
    },
    {
      title: "Last Purchase",
      value: metricsData.lastPurchaseAt
        ? formatDateTime(metricsData.lastPurchaseAt.toISOString())
        : "-",
      meta: `${metricsData.itemLines} item lines, ${metricsData.totalQuantity} units`,
      tone: "default",
    },
  ];
  const purchasesConfig = {
    title: "Purchase List",
    columns: purchaseColumns,
    rows: purchaseRows,
  };
  const payablesConfig = {
    title: "Open Payables",
    columns: purchaseColumns,
    rows: payableRows,
  };
  const paymentsConfig = {
    title: "Supplier Payments",
    columns: paymentColumns,
    rows: paymentRows,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="-ml-2 rounded-full">
              <Link href="/purchases/suppliers">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{supplier.name}</h1>
            <Badge variant={supplier.isActive ? "success" : "secondary"} className="rounded-lg">
              {supplier.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="ml-9 text-sm text-muted-foreground">Supplier Procurement Dashboard</p>
        </div>
        <div className="ml-9 flex items-center gap-3 sm:ml-0">
          {metricsData.payableBalance > 0 ? (
            <Button size="sm" className="rounded-full px-5 shadow-lg" asChild>
              <Link href={`/purchases/supplier-payments?supplierId=${supplierId}&open=1`}>
                <CreditCard className="mr-2 h-4 w-4" />
                Settle Payable
              </Link>
            </Button>
          ) : null}
          <Button size="sm" variant="outline" className="rounded-full px-5" asChild>
            <Link href="/purchases/suppliers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="border-none shadow-sm ring-1 ring-border">
            <CardContent className="p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                {metric.title}
              </p>
              <h3 className={`mt-2 text-xl font-bold tracking-tight ${getMetricTone(metric.tone)}`}>
                {metric.value}
              </h3>
              <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                {metric.meta}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border">
        <CardHeader className="border-b border-border/70 bg-muted/30 py-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Supplier Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-0 p-0 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: Phone, label: "Phone", value: supplier.phone || "-" },
            { icon: Mail, label: "Email", value: supplier.email || "-" },
            { icon: MapPin, label: "Address", value: supplier.address || "-" },
            {
              icon: Receipt,
              label: "Last Payment",
              value: metricsData.lastPaymentAt
                ? formatDateTime(metricsData.lastPaymentAt.toISOString())
                : "-",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex min-w-0 items-center gap-3 border-b border-border/60 p-4 last:border-b-0 sm:border-r sm:last:border-r-0 xl:border-b-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    {item.label}
                  </p>
                  <p className="truncate text-sm font-bold text-foreground" title={item.value}>
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <SupplierWorkspaceTabs
        supplierId={supplierId}
        purchasesConfig={purchasesConfig}
        payablesConfig={payablesConfig}
        paymentsConfig={paymentsConfig}
      />
    </div>
  );
}