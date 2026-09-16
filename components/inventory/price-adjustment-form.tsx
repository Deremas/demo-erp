"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type Option = { id: string; name: string };

type ProductOption = {
  id: string;
  name: string;
  sku: string | null;
  categoryId: string | null;
  brandId: string | null;
  companyId: string | null;
  sellingPrice: number;
};

type ExistingPrice = {
  productId: string;
  locationId: string;
  sellingPrice: number;
};

type PriceAdjustmentFormProps = {
  action: (formData: FormData) => Promise<ActionResult>;
  locations: Option[];
  products: ProductOption[];
  categories: Option[];
  brands: Option[];
  companies: Option[];
  existingPrices: ExistingPrice[];
};

type ActionResult = {
  success: boolean;
  message: string;
} | null;

function nextPrice(current: number, mode: string, amount: number) {
  if (!Number.isFinite(amount)) return current;
  if (mode === "PERCENTAGE_DECREASE") return Math.max(0, current * (1 - amount / 100));
  if (mode === "FIXED_INCREASE") return Math.max(0, current + amount);
  if (mode === "FIXED_DECREASE") return Math.max(0, current - amount);
  if (mode === "SET_EXACT") return Math.max(0, amount);
  return Math.max(0, current * (1 + amount / 100));
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

import { MultiSelect } from "@/components/ui/multi-select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function FilterField({
  name,
  label,
  options,
  selected,
  onChange,
  required,
  placeholder,
}: {
  name: string;
  label: string;
  options: { id: string; name: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</label>
        <button
          type="button"
          className="text-[10px] font-black uppercase text-primary hover:underline"
          onClick={() => onChange(selected.length === options.length ? [] : options.map((o) => o.id))}
        >
          {selected.length === options.length ? "Clear" : "Select All"}
        </button>
      </div>
      <MultiSelect
        name={name}
        options={options.map(o => ({ label: o.name, value: o.id }))}
        selected={selected}
        onChange={onChange}
        placeholder={placeholder ?? `Select ${label.toLowerCase()}...`}
        className="bg-muted/40 border-slate-200 dark:border-slate-800"
      />
      {required && selected.length === 0 && <input type="hidden" required />}
    </div>
  );
}

export function PriceAdjustmentForm({
  action,
  locations,
  products,
  categories,
  brands,
  companies,
  existingPrices,
}: PriceAdjustmentFormProps) {
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [brandIds, setBrandIds] = useState<string[]>([]);
  const [companyIds, setCompanyIds] = useState<string[]>([]);
  const [itemSearch, setItemSearch] = useState("");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [mode, setMode] = useState("PERCENTAGE_INCREASE");
  const [amount, setAmount] = useState(0);
  const [state, formAction, isPending] = useActionState(
    async (_previousState: ActionResult, formData: FormData) => action(formData),
    null,
  );

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success(state.message);
      setLocationIds([]);
      setCategoryIds([]);
      setBrandIds([]);
      setCompanyIds([]);
      setItemSearch("");
      setSelectedRowIds([]);
      setMode("PERCENTAGE_INCREASE");
      setAmount(0);
      return;
    }

    toast.error(state.message);
  }, [state]);

  const priceByKey = useMemo(
    () => new Map(existingPrices.map((price) => [`${price.locationId}:${price.productId}`, price])),
    [existingPrices],
  );

  const previewRows = useMemo(() => {
    const search = itemSearch.trim().toLowerCase();
    const filteredProducts = products.filter((product) => {
      if (categoryIds.length && (!product.categoryId || !categoryIds.includes(product.categoryId))) return false;
      if (brandIds.length && (!product.brandId || !brandIds.includes(product.brandId))) return false;
      if (companyIds.length && (!product.companyId || !companyIds.includes(product.companyId))) return false;
      if (search && !`${product.name} ${product.sku ?? ""}`.toLowerCase().includes(search)) return false;
      return true;
    });

    return locationIds.flatMap((locationId) => {
      const location = locations.find((item) => item.id === locationId);
      return filteredProducts.map((product) => {
        const current = priceByKey.get(`${locationId}:${product.id}`);
        const baseBefore = current?.sellingPrice ?? product.sellingPrice;
        return {
          id: `${locationId}:${product.id}`,
          location: location?.name ?? "-",
          product: product.name,
          sku: product.sku ?? "-",
          baseBefore,
          baseAfter: Number(nextPrice(baseBefore, mode, amount).toFixed(2)),
        };
      });
    });
  }, [amount, brandIds, categoryIds, companyIds, itemSearch, locationIds, locations, mode, priceByKey, products]);

  const previewRowIds = useMemo(() => previewRows.map((row) => row.id), [previewRows]);
  const previewRowIdKey = previewRowIds.join("|");
  const selectedPreviewRows = useMemo(
    () => previewRows.filter((row) => selectedRowIds.includes(row.id)),
    [previewRows, selectedRowIds],
  );

  useEffect(() => {
    setSelectedRowIds(previewRowIds);
  }, [previewRowIdKey]);

  const canApply =
    locationIds.length > 0 &&
    selectedPreviewRows.length > 0 &&
    Number.isFinite(amount) &&
    amount > 0;

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Target Filters */}
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="border-b border-border/50 bg-muted/20 py-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Target Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 grid gap-5 sm:grid-cols-2">
            <FilterField name="locationIds" label="Locations" options={locations} selected={locationIds} onChange={setLocationIds} required />
            <FilterField name="categoryIds" label="Categories" options={categories} selected={categoryIds} onChange={setCategoryIds} />
            <FilterField name="brandIds" label="Brands" options={brands} selected={brandIds} onChange={setBrandIds} />
            <div className="sm:col-span-2">
              <FilterField name="companyIds" label="Brand Owners" options={companies} selected={companyIds} onChange={setCompanyIds} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Item search</label>
              <Input
                value={itemSearch}
                onChange={(event) => setItemSearch(event.target.value)}
                placeholder="Search matching items or SKU..."
                className="h-11 rounded-[1rem] border-slate-200 bg-muted/40 text-[13px] font-bold text-foreground transition-all focus:bg-background focus:ring-2 focus:ring-primary/20 dark:border-slate-800"
              />
            </div>
          </CardContent>
        </Card>

        {/* Adjustment Settings */}
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="border-b border-border/50 bg-muted/20 py-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Adjustment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Adjustment Type</label>
                <select name="mode" value={mode} onChange={(e) => setMode(e.target.value)} className="h-11 w-full rounded-[1rem] border-slate-200 bg-muted/40 px-3 text-[13px] font-bold text-foreground transition-all focus:bg-background focus:ring-2 focus:ring-primary/20 dark:border-slate-800">
                  <option value="PERCENTAGE_INCREASE">Increase by percentage</option>
                  <option value="PERCENTAGE_DECREASE">Decrease by percentage</option>
                  <option value="FIXED_INCREASE">Increase by fixed ETB</option>
                  <option value="FIXED_DECREASE">Decrease by fixed ETB</option>
                  <option value="SET_EXACT">Set exact selling price</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Adjustment Amount</label>
                <Input name="amount" type="number" min="0.01" step="0.01" required value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} placeholder="e.g. 15" className="h-11 rounded-[1rem] border-slate-200 bg-muted/40 text-[13px] font-bold text-foreground transition-all focus:bg-background focus:ring-2 focus:ring-primary/20 dark:border-slate-800" />
              </div>
            </div>

            <div className="rounded-xl border bg-slate-50/50 p-4 mt-2 flex flex-col sm:flex-row items-center justify-between dark:bg-slate-900/30 gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preview Scope</p>
                <p className="text-xs font-semibold text-muted-foreground mt-1">
                  {locationIds.length} location(s), {new Set(selectedPreviewRows.map((row) => row.product)).size} selected item(s)
                </p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-2xl font-black text-primary">{selectedPreviewRows.length.toLocaleString()}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rows selected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedRowIds.map((rowId) => (
        <input key={rowId} type="hidden" name="selectedRows" value={rowId} />
      ))}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <p className="text-[10px] text-muted-foreground italic leading-relaxed max-w-xl">
          * Exact price adjustments set the base selling price to the entered amount. Changes apply immediately upon clicking below.
        </p>
        <Button type="submit" disabled={!canApply || isPending} className="h-11 w-full sm:w-auto px-8 rounded-[1rem] shadow-xl shadow-primary/20 text-xs font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5">
          {isPending ? "Applying..." : "Apply Previewed Changes"}
        </Button>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/20 px-4 py-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preview Items</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {selectedPreviewRows.length.toLocaleString()} selected from {previewRows.length.toLocaleString()} matching rows.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-lg text-[10px] font-black uppercase tracking-wider"
              onClick={() => setSelectedRowIds(previewRowIds)}
              disabled={previewRows.length === 0}
            >
              Select visible
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-lg text-[10px] font-black uppercase tracking-wider"
              onClick={() => setSelectedRowIds([])}
              disabled={previewRows.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>
        <div className="max-h-[30rem] overflow-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="sticky top-0 z-10 border-b bg-muted/50 backdrop-blur-sm text-[10px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 accent-primary"
                    checked={previewRows.length > 0 && selectedPreviewRows.length === previewRows.length}
                    onChange={(event) => setSelectedRowIds(event.target.checked ? previewRowIds : [])}
                    aria-label="Select all visible price adjustment rows"
                  />
                </th>
                <th className="p-4">Location</th>
                <th className="p-4">Item</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Unit Before</th>
                <th className="p-4">Unit After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {previewRows.slice(0, 250).map((row) => (
                <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 accent-primary"
                      checked={selectedRowIds.includes(row.id)}
                      onChange={() => setSelectedRowIds((values) => toggleValue(values, row.id))}
                      aria-label={`Select ${row.product} at ${row.location}`}
                    />
                  </td>
                  <td className="p-4 text-xs font-bold">{row.location}</td>
                  <td className="p-4 text-xs">{row.product}</td>
                  <td className="p-4 text-xs font-medium text-muted-foreground">{row.sku}</td>
                  <td className="p-4 text-xs text-muted-foreground">{formatCurrency(row.baseBefore)}</td>
                  <td className="p-4 text-xs font-black text-primary">{formatCurrency(row.baseAfter)}</td>
                </tr>
              ))}
              {previewRows.length === 0 ? (
                <tr>
                  <td className="p-12 text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest" colSpan={6}>
                    Select locations and filters to preview affected prices.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {previewRows.length > 250 ? (
          <div className="border-t bg-muted/20 p-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Showing first 250 rows. Applying will update all {previewRows.length.toLocaleString()} rows.
          </div>
        ) : null}
      </Card>
    </form>
  );
}