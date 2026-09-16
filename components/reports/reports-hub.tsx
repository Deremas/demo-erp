"use client";

import type { Route } from "next";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Filter, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { LocationOption } from "@/lib/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { reportDefinitions, type ReportCategory } from "@/lib/report-definitions";

const categories: (ReportCategory | "All")[] = ["All", "Sales", "Inventory", "Procurement", "Finance", "Administrative"];

const categoryColors: Record<ReportCategory, string> = {
  Sales: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
  Inventory: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
  Procurement: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30",
  Finance: "text-slate-600 bg-slate-100 dark:bg-slate-900",
  Administrative: "text-violet-600 bg-violet-50 dark:bg-violet-950/30",
};

export function ReportsHub({ locations }: { locations: LocationOption[] }) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return reportDefinitions.filter((report) => {
      const matchesCategory = selectedCategory === "All" || report.category === selectedCategory;
      const matchesSearch =
        !q ||
        report.title.toLowerCase().includes(q) ||
        report.description.toLowerCase().includes(q) ||
        report.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  function openReport(reportId: string) {
    const params = new URLSearchParams();
    if (locationIds.length > 0) params.set("locationId", locationIds.join(","));
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    const query = params.toString();
    router.push(`/reports/${reportId}${query ? `?${query}` : ""}` as Route);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Reporting Hub</h2>
          <p className="text-sm text-muted-foreground">
            Search, filter, and open schema-aware Demo ERP reports from one place.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search reports..."
            className="h-10 bg-white pl-10 dark:bg-slate-950"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <Card className="border-none bg-slate-50/50 shadow-none dark:bg-slate-900/20">
        <CardContent className="flex flex-wrap items-end gap-4 p-4">
          <div className="min-w-[220px] flex-1 space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Locations (Aggregate)
            </Label>
            <MultiSelect
              placeholder="All locations"
              options={locations.map(l => ({ label: l.name, value: l.id }))}
              selected={locationIds}
              onChange={setLocationIds}
              className="bg-white dark:bg-slate-950"
            />
          </div>
          <div className="min-w-[150px] flex-1 space-y-1.5">
            <Label htmlFor="dateFrom" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Date From
            </Label>
            <Input id="dateFrom" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="h-10 bg-white dark:bg-slate-950" />
          </div>
          <div className="min-w-[150px] flex-1 space-y-1.5">
            <Label htmlFor="dateTo" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Date To
            </Label>
            <Input id="dateTo" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="h-10 bg-white dark:bg-slate-950" />
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setLocationIds([]);
              setDateFrom("");
              setDateTo("");
            }}
            className="h-10 text-xs font-bold text-slate-500"
          >
            Reset Filters
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-lg border px-4 py-2 text-xs font-bold transition-all",
              selectedCategory === category
                ? "border-slate-900 bg-slate-900 text-white shadow-sm dark:border-white dark:bg-white dark:text-slate-900"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:text-white",
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => {
          const Icon = report.icon;

          return (
            <Card
              key={report.id}
              className={cn(
                "group relative cursor-pointer overflow-hidden border-slate-200 shadow-sm transition-all hover:border-primary/40 hover:ring-2 hover:ring-primary/20 dark:border-slate-800",
                report.highlight && "border-primary/20 bg-primary/[0.01]",
              )}
              onClick={() => openReport(report.id)}
            >
              {report.highlight ? (
                <Sparkles className="absolute right-3 top-3 h-3.5 w-3.5 text-primary/50" />
              ) : null}
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
                <div className={cn("shrink-0 rounded-xl p-2.5", categoryColors[report.category])}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">{report.category}</span>
                  <CardTitle className="text-[15px] font-bold transition-colors group-hover:text-primary">
                    {report.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <CardDescription className="min-h-[40px] text-xs leading-relaxed">
                  {report.description}
                </CardDescription>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/50">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <Filter className="h-3 w-3" />
                    Supports filters
                  </div>
                  <div className="flex translate-x-2 items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                    Open Report
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-20 dark:border-slate-800 dark:bg-slate-900/20">
          <Search className="mb-3 h-10 w-10 text-slate-300" />
          <p className="font-medium text-slate-500">No reports found.</p>
          <Button variant="ghost" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
            Clear search
          </Button>
        </div>
      ) : null}
    </div>
  );
}