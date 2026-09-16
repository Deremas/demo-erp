export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  CreditCard,
  MapPin, 
  Phone, 
  FileText,
  Mail
} from "lucide-react";
import Link from "next/link";

import { getCustomerMetrics } from "@/lib/page-data-sales";
import { getTablePageConfig } from "@/lib/page-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";
import { CustomerWorkspaceTabs } from "@/components/sales/customer-workspace-tabs";

type CustomerDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<RouteSearchParams>;
};

type MetricCard = {
  title: string;
  value: string;
  meta: string;
  tone: "default" | "success" | "warning" | "danger";
};

export default async function Page({ params, searchParams }: CustomerDetailPageProps) {
  const { id: customerId } = await params;
  const p = await searchParams;
  const locationId =
    getSingleSearchParam(p, "locationId") ?? getSingleSearchParam(p, "branchId");

  const [customer, metricsData, salesConfig, creditConfig, paymentsConfig, itemsConfig] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        isActive: true,
        partyType: true,
        creditLimit: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    getCustomerMetrics(customerId, locationId ?? undefined),
    getTablePageConfig("salesList", {
      customerId,
      ...(locationId ? { locationId } : {}),
    }),
    getTablePageConfig("salesCustomerCredit", {
      customerId,
      ...(locationId ? { locationId } : {}),
    }),
    getTablePageConfig("salesCustomerPayments", {
      customerId,
      ...(locationId ? { locationId } : {}),
    }),
    getTablePageConfig("salesSoldItems", {
      customerId,
      ...(locationId ? { locationId } : {}),
    }),
  ]);

  if (!customer) {
    return notFound();
  }

  const { totalPurchases, totalPaid, creditBalance, lastPurchaseAt } = metricsData;

  const metrics: MetricCard[] = [
    {
      title: "Lifetime Purchases",
      value: formatCurrency(totalPurchases),
      meta: "Gross volume settled",
      tone: "default",
    },
    {
      title: "Amount Paid",
      value: formatCurrency(totalPaid),
      meta: "Realized revenue",
      tone: "success",
    },
    {
      title: "Credit Balance",
      value: formatCurrency(creditBalance),
      meta: `Limit ${formatCurrency(Number(customer.creditLimit))}`,
      tone: creditBalance > 0 ? "danger" : "default",
    },
    {
      title: "Last Activity",
      value: lastPurchaseAt ? formatDateTime(lastPurchaseAt.toISOString()) : "-",
      meta: "Most recent sale",
      tone: "default",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="-ml-2 rounded-full">
              <Link href="/sales/customers">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
            <Badge variant="outline" className="rounded-lg">
              {customer.partyType === "AGENT" ? "Agent" : "Customer"}
            </Badge>
            <Badge variant={customer.isActive ? "success" : "secondary"} className="rounded-lg">
              {customer.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground ml-9">Customer Relationship Dashboard</p>
        </div>
        <div className="ml-9 flex items-center gap-3 sm:ml-0">
          {creditBalance > 0 ? (
            <Button size="sm" className="rounded-full px-5 shadow-lg" asChild>
              <Link href={`/sales/customer-payments?customerId=${customerId}&open=1`}>
                <CreditCard className="mr-2 h-4 w-4" />
                Settle Credit
              </Link>
            </Button>
          ) : null}
          <Button size="sm" variant="outline" className="rounded-full px-5" asChild>
            <Link href="/sales/customers">
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
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{metric.title}</p>
              <div className="mt-2 flex items-baseline justify-between">
                <h3 className={`text-xl font-bold tracking-tight ${
                  metric.tone === "success" ? "text-success" : 
                  metric.tone === "danger" ? "text-danger" : 
                  metric.tone === "warning" ? "text-warning" : "text-foreground"
                }`}>
                  {metric.value}
                </h3>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground font-medium">{metric.meta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border">
        <CardHeader className="border-b border-border/70 bg-muted/30 py-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Customer Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-0 p-0 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { icon: Phone, label: "Phone", value: customer.phone || "-" },
            { icon: Mail, label: "Email", value: customer.email || "-" },
            { icon: MapPin, label: "Address", value: customer.address || "-" },
            {
              icon: FileText,
              label: "Created",
              value: formatDateTime(customer.createdAt.toISOString()),
            },
            {
              icon: FileText,
              label: "Updated",
              value: formatDateTime(customer.updatedAt.toISOString()),
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

      <CustomerWorkspaceTabs
        customerId={customerId}
        salesConfig={salesConfig}
        creditConfig={creditConfig}
        paymentsConfig={paymentsConfig}
        itemsConfig={itemsConfig}
      />
    </div>
  );
}