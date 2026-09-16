export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Route } from "next";

import { PageHeader } from "@/components/app-shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";

type AccountDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<RouteSearchParams>;
};

function toNum(d: any): number {
  return typeof d === "object" && d !== null ? Number(d.toString()) : Number(d ?? 0);
}

const ENTRY_TYPE_LABELS: Record<string, string> = {
  SALE: "Sale",
  PURCHASE: "Purchase",
  EXPENSE: "Expense",
  CUSTOMER_PAYMENT: "Customer Payment",
  SUPPLIER_PAYMENT: "Supplier Payment",
  CASH_TRANSFER: "Cash Transfer",
  OPENING_BALANCE: "Opening Balance",
  ADJUSTMENT: "Adjustment",
};

export default async function AccountDetailPage({
  params,
  searchParams,
}: AccountDetailPageProps) {
  const { id } = await params;
  const sp = await searchParams;

  const locationId = getSingleSearchParam(sp, "locationId") || undefined;
  const dateFrom = getSingleSearchParam(sp, "dateFrom") || undefined;
  const dateTo = getSingleSearchParam(sp, "dateTo") || undefined;
  const page = Math.max(1, Number(getSingleSearchParam(sp, "page") || "1"));
  const pageSize = 25;

  const [account, locations] = await Promise.all([
    prisma.financeAccount.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        bankName: true,
        accountNumber: true,
        isActive: true,
      },
    }),
    prisma.location.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!account) notFound();

  const where: any = {
    financeAccountId: id,
    ...(locationId ? { locationId } : {}),
    ...(dateFrom || dateTo
      ? {
          entryDate: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo + "T23:59:59Z") } : {}),
          },
        }
      : {}),
  };

  const [totalEntries, entries, balanceAgg] = await Promise.all([
    prisma.ledgerEntry.count({ where }),
    prisma.ledgerEntry.findMany({
      where,
      orderBy: { entryDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        location: { select: { name: true } },
      },
    }),
    prisma.ledgerEntry.findMany({
      where: { financeAccountId: id },
      select: { amount: true, direction: true },
    }),
  ]);

  const totalBalance = balanceAgg.reduce((sum, e) => {
    const amt = toNum(e.amount);
    return e.direction === "DEBIT" ? sum + amt : sum - amt;
  }, 0);

  const totalPages = Math.ceil(totalEntries / pageSize);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const base: Record<string, string> = {};
    if (locationId) base.locationId = locationId;
    if (dateFrom) base.dateFrom = dateFrom;
    if (dateTo) base.dateTo = dateTo;
    if (page > 1) base.page = String(page);
    const merged = { ...base, ...overrides };
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(merged).filter(([, v]) => v != null)) as Record<string, string>,
    ).toString();
    return `/finance/accounts/${id}${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link
          href="/finance/accounts"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Accounts
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title={account.name}
          description={`${account.type === "BANK" ? "Bank account" : "Cash account"}${account.bankName ? ` · ${account.bankName}` : ""}${account.accountNumber ? ` · ${account.accountNumber}` : ""}`}
        />
        <div className="flex items-center gap-2">
          <Badge variant={account.isActive ? "default" : "secondary"}>
            {account.isActive ? "Active" : "Inactive"}
          </Badge>
          <Link
            href={`/finance/accounts?editAccountId=${account.id}&open=1` as Route}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Balance</p>
            <p className={`mt-1 text-2xl font-bold ${totalBalance < 0 ? "text-destructive" : "text-primary"}`}>
              {formatCurrency(totalBalance)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Entries</p>
            <p className="mt-1 text-2xl font-bold">{balanceAgg.length.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Account Code</p>
            <p className="mt-1 text-2xl font-bold font-mono">{account.code}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form method="GET" action={`/finance/accounts/${id}`} className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Location</label>
              <select
                name="locationId"
                defaultValue={locationId ?? ""}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">All locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">From</label>
              <input
                type="date"
                name="dateFrom"
                defaultValue={dateFrom ?? ""}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">To</label>
              <input
                type="date"
                name="dateTo"
                defaultValue={dateTo ?? ""}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              />
            </div>
            <button
              type="submit"
              className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              Apply
            </button>
            {(locationId || dateFrom || dateTo) && (
              <Link
                href={`/finance/accounts/${id}` as Route}
                className="flex h-9 items-center rounded-lg border border-input px-4 text-sm text-muted-foreground hover:bg-accent transition-colors"
              >
                Clear
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Ledger table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-600">
            Ledger entries
            {totalEntries > 0 && (
              <span className="ml-2 text-muted-foreground font-normal">({totalEntries.toLocaleString()} total)</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/30">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Date</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Type</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Description</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Location</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Debit</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                      No ledger entries found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => {
                    const amt = toNum(entry.amount);
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {new Date(entry.entryDate).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {ENTRY_TYPE_LABELS[entry.entryType] ?? entry.entryType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                          {entry.description ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {entry.location?.name ?? "Central"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-green-600">
                          {entry.direction === "DEBIT" ? formatCurrency(amt) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-red-500">
                          {entry.direction === "CREDIT" ? formatCurrency(amt) : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 p-4 dark:border-slate-800">
              <p className="text-xs text-slate-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={buildUrl({ page: page > 2 ? String(page - 1) : undefined }) as Route}
                    className="inline-flex h-8 items-center rounded-lg border border-input px-3 text-xs hover:bg-accent transition-colors"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={buildUrl({ page: String(page + 1) }) as Route}
                    className="inline-flex h-8 items-center rounded-lg border border-input px-3 text-xs hover:bg-accent transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}