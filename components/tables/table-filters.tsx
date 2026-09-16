"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { ChevronDown, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import type { TableFilterField } from "@/lib/table";
import { cn } from "@/lib/utils";

const ALL_VALUE = "__all__";

function fieldHasValue(value: string | undefined, field: TableFilterField) {
  const next = value ?? "";
  return Boolean(next) && next !== ALL_VALUE && next !== (field.defaultValue ?? "");
}

function FilterControl({
  field,
  currentValue,
  onChange,
}: {
  field: TableFilterField;
  currentValue: string;
  onChange: (value: string) => void;
}) {
  const isSearch = field.type === "search" || !field.type;
  const widthClass = isSearch
    ? "w-[240px]"
    : field.type === "date"
      ? "w-[148px]"
      : field.type === "multiselect"
        ? "w-[176px]"
        : "w-[160px]";

  return (
    <div className={cn("shrink-0 space-y-1", widthClass)}>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {field.label}
      </label>

      {field.type === "multiselect" ? (
        <MultiSelect
          name={field.key}
          options={field.options ?? []}
          selected={currentValue ? currentValue.split(",") : []}
          onChange={(vals) => onChange(vals.join(","))}
          placeholder={field.placeholder ?? `Select ${field.label}`}
          className="h-9 bg-background"
        />
      ) : field.type === "select" ? (
        <div className="relative">
          <Select
            name={field.key}
            value={currentValue || ALL_VALUE}
            onChange={(event) => onChange(event.target.value)}
            className="h-9 w-full pr-8 text-[13px]"
          >
            <option value={ALL_VALUE}>{field.placeholder ?? `All ${field.label}`}</option>
            {(field.options ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {currentValue && currentValue !== ALL_VALUE ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      ) : field.type === "date" ? (
        <Input
          name={field.key}
          type="date"
          value={currentValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 text-[13px]"
        />
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            name={field.key}
            value={currentValue}
            onChange={(event) => onChange(event.target.value)}
            placeholder={field.placeholder ?? "Search..."}
            className="h-9 pl-9 text-[13px]"
          />
        </div>
      )}
    </div>
  );
}

export function TableFilters({ fields }: { fields?: TableFilterField[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const primaryFields = useMemo(() => (fields ?? []).filter((field) => !field.advanced), [fields]);
  const advancedFields = useMemo(() => (fields ?? []).filter((field) => field.advanced), [fields]);

  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const newValues: Record<string, string> = {};
    let hasAdvancedValue = false;
    for (const field of fields ?? []) {
      const val = searchParams.get(field.key) ?? field.defaultValue ?? "";
      newValues[field.key] = val;
      if (field.advanced && fieldHasValue(val, field)) {
        hasAdvancedValue = true;
      }
    }
    setLocalValues(newValues);
    if (hasAdvancedValue) {
      setShowAdvanced(true);
    }
  }, [searchParams, fields]);

  if (!fields?.length) {
    return null;
  }

  function updateValue(key: string, value: string) {
    setLocalValues((prev) => ({ ...prev, [key]: value === ALL_VALUE ? "" : value }));
  }

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
    setShowAdvanced(false);
    router.push((params.toString() ? `${pathname}?${params.toString()}` : pathname) as any);
  }

  const visibleFields = showAdvanced ? [...primaryFields, ...advancedFields] : primaryFields;
  const activeAdvancedCount = advancedFields.filter((field) => fieldHasValue(localValues[field.key], field)).length;

  return (
    <form action={handleSubmit} className="rounded-2xl border border-border bg-card p-3 sm:p-4">
      <div className="flex flex-wrap items-end gap-3">
        {visibleFields.map((field) => (
          <FilterControl
            key={field.key}
            field={field}
            currentValue={localValues[field.key] ?? ""}
            onChange={(value) => updateValue(field.key, value)}
          />
        ))}

        <div className="flex shrink-0 items-center gap-2 pb-0.5">
          {advancedFields.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setShowAdvanced((open) => !open)}
            >
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              {showAdvanced ? "Less" : "More"}
              {activeAdvancedCount > 0 ? (
                <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary">
                  {activeAdvancedCount}
                </span>
              ) : null}
              <ChevronDown className={cn("ml-1 h-3.5 w-3.5 transition", showAdvanced ? "rotate-180" : "")} />
            </Button>
          ) : null}
          <Button type="submit" size="sm" className="h-9 px-4">
            Apply
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-9 px-3" onClick={resetFilters}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>
    </form>
  );
}
