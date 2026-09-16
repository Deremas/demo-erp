"use client";

import * as React from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, SlidersHorizontal } from "lucide-react";

import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ReportFilterKind, ReportFilters } from "@/lib/reports";
import type { SimpleRow, TablePageConfig } from "@/lib/table";
import { formatCurrency } from "@/lib/utils";

import { MultiSelect } from "@/components/ui/multi-select";

type Option = { id: string; name: string };

type ReportDetailProps = {
  definition: {
    id: string;
    title: string;
    description: string;
    category: string;
    filters: ReportFilterKind[];
  };
  config: TablePageConfig;
  filters: ReportFilters;
  summaries: { label: string; value: number; type: "currency" | "number" }[];
  options: {
    locations: Option[];
    categories: Option[];
    brands: Option[];
    companies: Option[];
    products: Option[];
    customers: Option[];
    suppliers: Option[];
    users: Option[];
    accounts: Option[];
  };
};

const selectFilters: Partial<Record<ReportFilterKind, { label: string; key: keyof ReportFilters; options?: keyof ReportDetailProps["options"]; values?: { id: string; name: string }[] }>> = {
  product: { label: "Product", key: "productId", options: "products" },
  category: { label: "Category", key: "categoryId", options: "categories" },
  brand: { label: "Brand", key: "brandId", options: "brands" },
  company: { label: "Brand Owner", key: "companyId", options: "companies" },
  customer: { label: "Customer", key: "customerId", options: "customers" },
  supplier: { label: "Supplier", key: "supplierId", options: "suppliers" },
  user: { label: "User", key: "userId", options: "users" },
  financeAccount: { label: "Finance Account", key: "financeAccountId", options: "accounts" },
  status: { label: "Status", key: "status", values: [{ id: "COMPLETED", name: "Completed" }, { id: "PARTIALLY_RETURNED", name: "Partially Returned" }, { id: "RETURNED", name: "Returned" }, { id: "PARTIALLY_EXCHANGED", name: "Partially Exchanged" }, { id: "EXCHANGED", name: "Exchanged" }, { id: "POSTED", name: "Posted" }, { id: "DRAFT", name: "Draft" }, { id: "VOIDED", name: "Voided" }, { id: "ACTIVE", name: "Active" }, { id: "INACTIVE", name: "Inactive" }] },
  paymentMethod: { label: "Payment Method", key: "paymentMethod", values: [{ id: "CASH", name: "Cash" }, { id: "BANK", name: "Bank" }, { id: "CREDIT", name: "Credit" }] },
  paymentStatus: { label: "Payment Status", key: "paymentStatus", values: [{ id: "PAID", name: "Paid" }, { id: "PARTIAL", name: "Partial" }, { id: "UNPAID", name: "Unpaid" }] },
  movementType: { label: "Movement Type", key: "movementType", values: [{ id: "PURCHASE", name: "Purchase" }, { id: "SALE", name: "Sale" }, { id: "TRANSFER_IN", name: "Transfer In" }, { id: "TRANSFER_OUT", name: "Transfer Out" }, { id: "ADJUSTMENT", name: "Adjustment" }, { id: "CUSTOMER_RETURN", name: "Customer Return" }] },
  accountType: { label: "Account Type", key: "accountType", values: [{ id: "CASH", name: "Cash" }, { id: "BANK", name: "Bank" }] },
  sortBy: { label: "Sort By", key: "sortBy", values: [{ id: "soldQuantity", name: "Quantity sold" }, { id: "revenue", name: "Revenue" }, { id: "profit", name: "Profit" }] },
  lowStockOnly: { label: "Stock Status", key: "lowStockOnly", values: [{ id: "1", name: "Low stock only" }] },
};

const singleSelectFilterKeys = new Set<keyof ReportFilters>(["accountType", "sortBy", "lowStockOnly"]);

function formatSummary(summary: { value: number; type: "currency" | "number" }) {
  if (summary.type === "currency") return formatCurrency(summary.value);
  return summary.value.toLocaleString();
}

function splitSelected(value: unknown) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ReportDetail({ definition, config, filters, summaries, options }: ReportDetailProps) {
  const router = useRouter();
  const [selectedValues, setSelectedValues] = React.useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    initial.locationId = splitSelected(filters.locationId);
    for (const kind of definition.filters) {
      const filter = selectFilters[kind];
      if (filter && !singleSelectFilterKeys.has(filter.key)) {
        initial[String(filter.key)] = splitSelected(filters[filter.key]);
      }
    }
    return initial;
  });

  function updateSelected(key: keyof ReportFilters, values: string[]) {
    setSelectedValues((current) => ({ ...current, [String(key)]: values }));
  }

  function submit(formData: FormData) {
    const params = new URLSearchParams();
    for (const key of ["locationId", "dateFrom", "dateTo", "search", "status", "paymentMethod", "paymentStatus", "productId", "categoryId", "brandId", "companyId", "customerId", "supplierId", "userId", "movementType", "accountType", "financeAccountId", "sortBy", "lowStockOnly", "range1Month", "range1From", "range1To", "range2Month", "range2From", "range2To", "range3Month", "range3From", "range3To"]) {
      const value = String(formData.get(key) ?? "");
      if (value) params.set(key, value);
    }
    router.push(`/reports/${definition.id}?${params.toString()}` as Route);
  }

  const activeFilters = Object.entries(filters).filter(([, value]) => Boolean(value));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link href="/reports"><ArrowLeft className="h-4 w-4" /> Back to Reports</Link>
          </Button>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{definition.category}</p>
          <h1 className="text-3xl font-black tracking-tight">{definition.title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{definition.description}</p>
        </div>
      </div>

      <Card className="border-none bg-slate-50/60 shadow-none dark:bg-slate-900/30">
        <CardContent className="p-4">
          <form action={submit} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10">
            {definition.filters.includes("location") && (
              <div className="space-y-1.5">
                <Label>Locations</Label>
                <MultiSelect
                  name="locationId"
                  placeholder="All Locations"
                  options={options.locations.map((l) => ({ label: l.name, value: l.id }))}
                  selected={selectedValues.locationId ?? []}
                  onChange={(values) => updateSelected("locationId", values)}
                  className="bg-white dark:bg-slate-950"
                />
              </div>
            )}
            {definition.filters.includes("dateFrom") && <div className="space-y-1.5"><Label>Date From</Label><Input name="dateFrom" type="date" defaultValue={filters.dateFrom ?? ""} /></div>}
            {definition.filters.includes("dateTo") && <div className="space-y-1.5"><Label>Date To</Label><Input name="dateTo" type="date" defaultValue={filters.dateTo ?? ""} /></div>}
            {definition.filters.includes("comparisonRanges") && (
              <div className="grid gap-3 rounded-xl border border-border bg-white p-3 dark:bg-slate-950 sm:col-span-2 xl:col-span-4">
                {[1, 2, 3].map((range) => (
                  <div key={range} className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label>{range === 1 ? "Range 1 Month" : range === 2 ? "Range 2 Month" : "Optional Range 3 Month"}</Label>
                      <Input name={`range${range}Month`} type="month" defaultValue={String(filters[`range${range}Month` as keyof ReportFilters] ?? "")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Start Date</Label>
                      <Input name={`range${range}From`} type="date" defaultValue={String(filters[`range${range}From` as keyof ReportFilters] ?? "")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>End Date</Label>
                      <Input name={`range${range}To`} type="date" defaultValue={String(filters[`range${range}To` as keyof ReportFilters] ?? "")} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {definition.filters.filter((kind) => selectFilters[kind] && kind !== "location").map((kind) => {
              const filter = selectFilters[kind]!;
              const values = filter.options ? options[filter.options] : filter.values ?? [];
              if (!singleSelectFilterKeys.has(filter.key)) {
                return (
                  <div key={kind} className="space-y-1.5">
                    <Label>{filter.label}</Label>
                    <MultiSelect
                      name={String(filter.key)}
                      placeholder={`All ${filter.label}`}
                      options={values.map((option) => ({ label: option.name, value: option.id }))}
                      selected={selectedValues[String(filter.key)] ?? []}
                      onChange={(nextValues) => updateSelected(filter.key, nextValues)}
                      className="bg-white dark:bg-slate-950"
                    />
                  </div>
                );
              }
              return (
                <div key={kind} className="space-y-1.5">
                  <Label>{filter.label}</Label>
                  <Select name={filter.key} defaultValue={String(filters[filter.key] ?? "")}>
                    <option value="">All</option>
                    {values.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                  </Select>
                </div>
              );
            })}
            {definition.filters.includes("search") && <div className="space-y-1.5 sm:col-span-2"><Label>Search</Label><Input name="search" placeholder="Search report..." defaultValue={filters.search ?? ""} /></div>}
            <div className="flex items-end gap-2">
              <Button type="submit"><SlidersHorizontal className="h-4 w-4" /> Apply Filters</Button>
              <Button asChild type="button" variant="outline"><Link href={`/reports/${definition.id}` as Route}><RotateCcw className="h-4 w-4" /> Reset</Link></Button>
            </div>
          </form>
          {activeFilters.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilters.map(([key, value]) => (
                <span key={key} className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground dark:bg-slate-950">
                  {key}: {String(value)}
                </span>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10">
        {summaries.map((summary) => (
          <Card key={summary.label}>
            <CardContent className="p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{summary.label}</p>
              <p className="mt-2 text-2xl font-black">{formatSummary(summary)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <DataTable columns={config.columns} data={config.rows as SimpleRow[]} exportTitle={definition.title} exportFileName={definition.id} includeCsvExport={false} />
        </CardContent>
      </Card>
    </div>
  );
}