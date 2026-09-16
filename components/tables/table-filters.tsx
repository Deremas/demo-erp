"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Filter, RotateCcw, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import type { TableFilterField } from "@/lib/table";
import { cn } from "@/lib/utils";

const ALL_VALUE = "__all__";

export function TableFilters({ fields }: { fields?: TableFilterField[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!fields?.length) {
    return null;
  }

  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const newValues: Record<string, string> = {};
    for (const field of fields ?? []) {
      const val = searchParams.get(field.key) ?? field.defaultValue ?? "";
      newValues[field.key] = val;
    }
    setLocalValues(newValues);
  }, [searchParams, fields]);

  function handleSubmit(formData: FormData) {
    const params = new URLSearchParams(searchParams.toString());

    for (const field of fields ?? []) {
      const rawValue = formData.get(field.key);
      const value = typeof rawValue === "string" ? rawValue.trim() : "";

      if (!value || value === ALL_VALUE) {
        params.delete(field.key);
      } else {
        params.set(field.key, value);
      }
    }

    params.delete("page");
    router.push((params.toString() ? `${pathname}?${params.toString()}` : pathname) as any);
  }

  function resetFilters() {
    const params = new URLSearchParams(searchParams.toString());

    for (const field of fields ?? []) {
      params.delete(field.key);
    }

    params.delete("page");
    router.push((params.toString() ? `${pathname}?${params.toString()}` : pathname) as any);
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-[2rem] border border-slate-200/60 bg-card p-6 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] dark:border-slate-800/60"
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[15px] font-extrabold text-foreground tracking-tight">Active Filters</h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Refine list results</p>
          </div>
        </div>
        <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="h-9 rounded-full px-4 text-[12px] font-bold text-slate-500 hover:bg-muted hover:text-foreground transition-colors"
        >
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        {fields.map((field) => {
          const currentValue = localValues[field.key] ?? "";
          const isSearch = field.type === "search" || !field.type;

          return (
            <div
              key={field.key}
              className={cn(
                "space-y-2",
                isSearch ? "flex-[2] min-w-[240px] max-w-sm" : "flex-1 min-w-[140px]"
              )}
            >
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                {field.label}
              </label>

              {field.type === "multiselect" ? (
                <MultiSelect
                  name={field.key}
                  options={field.options ?? []}
                  selected={currentValue ? currentValue.split(",") : []}
                  onChange={(vals) => setLocalValues((prev) => ({ ...prev, [field.key]: vals.join(",") }))}
                  placeholder={`Select ${field.label}`}
                  className="bg-muted/40 border-slate-200"
                />
              ) : field.type === "select" ? (
                <div className="relative group">
                    <Select
                        name={field.key}
                        value={currentValue || ALL_VALUE}
                        onChange={(event) => setLocalValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                        className="h-11 w-full rounded-[1rem] border-slate-200 bg-muted/40 text-[13px] font-bold text-foreground transition-all focus:bg-background focus:ring-2 focus:ring-primary/20 group-hover:border-primary/30 dark:border-slate-800 pr-10"
                    >
                        <option value={ALL_VALUE}>
                            {field.placeholder ?? `All ${field.label}`}
                        </option>
                        {(field.options ?? []).map((option) => (
                            <option key={option.value} value={option.value}>
                            {option.label}
                            </option>
                        ))}
                    </Select>
                    {currentValue && currentValue !== ALL_VALUE && (
                      <button
                        type="button"
                        onClick={() => setLocalValues((prev) => ({ ...prev, [field.key]: "" }))}
                        className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground z-10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                </div>
              ) : field.type === "date" ? (
                <Input
                  name={field.key}
                  type="date"
                  value={currentValue}
                  onChange={(event) => setLocalValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                  className="h-11 rounded-[1rem] border-slate-200 bg-muted/40 text-[13px] font-bold text-foreground transition-all focus:bg-background focus:ring-2 focus:ring-primary/20 hover:border-primary/30 dark:border-slate-800"
                />
              ) : (
                <div className="relative group">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-primary/70" />
                  <Input
                    name={field.key}
                    value={currentValue}
                    onChange={(event) => setLocalValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                    placeholder={field.placeholder ?? "Search records..."}
                    className="h-11 rounded-[1rem] border-slate-200 bg-muted/40 pl-11 text-[13px] font-bold text-foreground transition-all focus:bg-background focus:ring-2 focus:ring-primary/20 hover:border-primary/30 dark:border-slate-800"
                  />
                </div>
              )}
            </div>
          );
        })}
        
        <div className="flex-shrink-0">
            <Button 
                type="submit" 
                className="h-11 rounded-[1rem] bg-primary px-8 text-[13px] font-bold text-white shadow-xl shadow-primary/10 hover:bg-primary/90 transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              Apply Filters
            </Button>
        </div>
      </div>
    </form>
  );
}