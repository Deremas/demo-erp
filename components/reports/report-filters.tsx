"use client";

import * as React from "react";
import { Filter, X, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { LocationOption } from "@/lib/types";

interface ReportFiltersProps {
  branches: LocationOption[];
  onFilter: (filters: any) => void;
  onClear: () => void;
  initialFilters?: any;
  children?: React.ReactNode; // For page-specific filters (Row 2)
  showSearch?: boolean;
  searchPlaceholder?: string;
}

export function ReportFilters({
  branches,
  onFilter,
  onClear,
  initialFilters = {},
  children,
  showSearch = true,
  searchPlaceholder = "Search records...",
}: ReportFiltersProps) {
  const [filters, setFilters] = React.useState(initialFilters);

  const handleChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApply = () => {
    onFilter(filters);
  };

  const handleClear = () => {
    setFilters({});
    onClear();
  };

  return (
    <Card className="border-none bg-slate-50 shadow-none dark:bg-slate-900/40 overflow-visible">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4">
          {/* Location */}
          <div className="space-y-1.5 xl:flex-1 xl:min-w-[160px]">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Location
            </Label>
            <Select
              value={filters.branchId || "all"}
              onChange={(event) =>
                handleChange("branchId", event.target.value === "all" ? "" : event.target.value)
              }
              className="h-9 rounded-xl bg-white border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm"
            >
              <option value="all">All Locations</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-1.5 xl:flex-1 xl:min-w-[140px]">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Date From
            </Label>
            <Input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => handleChange("dateFrom", e.target.value)}
              className="h-9 rounded-xl bg-white border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm"
            />
          </div>

          {/* Date To */}
          <div className="space-y-1.5 xl:flex-1 xl:min-w-[140px]">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Date To
            </Label>
            <Input
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) => handleChange("dateTo", e.target.value)}
              className="h-9 rounded-xl bg-white border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm"
            />
          </div>

          {/* Search */}
          {showSearch && (
            <div className="col-span-2 md:col-span-3 space-y-1.5 xl:flex-[2] xl:min-w-[200px]">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Search
              </Label>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder={searchPlaceholder}
                  value={filters.search || ""}
                  onChange={(e) => handleChange("search", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApply()}
                  className="h-9 pl-8 rounded-xl bg-white border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm"
                />
              </div>
            </div>
          )}

          {/* Page-specific children */}
          {children}

          {/* Actions - visible inline on xl, hidden otherwise */}
          <div className="hidden xl:flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              onClick={handleClear}
              className="h-9 px-3 rounded-xl text-slate-500 font-bold hover:text-rose-500 transition-colors"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button
              onClick={handleApply}
              className="h-9 px-5 rounded-xl font-bold text-sm"
            >
              <Filter className="mr-2 h-3.5 w-3.5" />
              Apply
            </Button>
          </div>
        </div>

        {/* Mobile actions row */}
        <div className="mt-3 flex items-center justify-between gap-2 xl:hidden">
          <Button
            variant="ghost"
            onClick={handleClear}
            className="h-9 px-3 rounded-xl text-slate-500 font-bold hover:text-rose-500 text-sm"
          >
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="h-9 px-5 rounded-xl font-bold text-sm flex-1"
          >
            <Filter className="mr-2 h-3.5 w-3.5" />
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}