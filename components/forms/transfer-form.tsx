"use client";

import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FormFeedback } from "@/components/forms/form-feedback";
import { useCreateDialog } from "@/components/tables/modal-table-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createTransferAction } from "@/lib/actions/transfers";
import type { TransferFormOptions } from "@/lib/types";
import { formatCurrency, formatDateForInput } from "@/lib/utils";
import {
  transferSchema,
  type TransferFormInput,
} from "@/lib/validation/transfer";

type TransferFormProps = {
  options: TransferFormOptions;
  initialProductId?: string;
  initialSourceLocationId?: string;
};

function getAvailableProductsForLocation(
  options: TransferFormOptions,
  locationId: string | undefined,
) {
  if (!locationId) {
    return [];
  }

  const availableProductIds = new Set(
    options.locationStock
      .filter((stock) => stock.locationId === locationId && stock.availableQty > 0)
      .map((stock) => stock.productId),
  );

  return options.products.filter((product) => availableProductIds.has(product.id));
}

function getStockForProductAtLocation(
  options: TransferFormOptions,
  locationId: string | undefined,
  productId: string | undefined,
) {
  if (!locationId || !productId) return null;
  return (
    options.locationStock.find(
      (stock) => stock.locationId === locationId && stock.productId === productId,
    ) ?? null
  );
}

function getAvailabilityDisplay(
  stock: { availableQty: number } | null,
  product: { unitName: string } | undefined,
) {
  if (!stock || !product) return "—";
  return `${stock.availableQty} ${product.unitName}`;
}

function getMaxQuantity(
  stock: { availableQty: number } | null,
  product: { unitName: string } | undefined,
) {
  if (!stock || !product) return 0;
  return stock.availableQty;
}

function getDefaultValues(options: TransferFormOptions): TransferFormInput {
  return {
    sourceLocationId: "",
    destinationLocationId: "",
    transferAt: formatDateForInput(),
    note: "",
    items: [
      {
        productId: "",
        unitId: "",
        quantity: 1,
      },
    ],
  };
}

export function TransferForm({ options, initialProductId, initialSourceLocationId }: TransferFormProps) {
  const createDialog = useCreateDialog();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const defaultProduct = options.products[0];

  const defaultValues = useMemo(() => {
    const base = getDefaultValues(options);
    return {
      ...base,
      ...(initialSourceLocationId ? { sourceLocationId: initialSourceLocationId } : {}),
      items: [
        {
          ...base.items[0],
          ...(initialProductId ? { productId: initialProductId } : {}),
        },
      ],
    };
  }, [options, initialProductId, initialSourceLocationId]);

  const canSubmit = options.locations.length > 1 && options.products.length > 0;

  const form = useForm<TransferFormInput>({
    resolver: zodResolver(transferSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const sourceLocationId = form.watch("sourceLocationId");
  const destinationLocationId = form.watch("destinationLocationId");
  const items = form.watch("items");
  const availableProducts = getAvailableProductsForLocation(options, sourceLocationId);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    itemsRef.current.forEach((item, index) => {
      if (item.productId && !item.unitId) {
        const product = options.products.find((p) => p.id === item.productId);
        if (product) {
          form.setValue(`items.${index}.unitId`, product.unitId);
        }
      }
    });
  }, [items, options.products, form]);

  function handleCancel() {
    setSubmitError(null);
    form.reset(defaultValues);
    createDialog?.close();
  }

  function onSubmit(values: TransferFormInput) {
    startTransition(async () => {
      setSubmitError(null);
      const result = await createTransferAction(values);

      if (!result.success) {
        setSubmitError(result.message);
        toast.error(result.message);
        return;
      }

      setSubmitError(null);
      toast.success(result.message);
      form.reset(defaultValues);
      router.refresh();
      createDialog?.close();
    });
  }

  if (options.locations.length < 2) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-[hsl(var(--brand-gold)/0.7)] bg-[hsl(var(--brand-gold)/0.20)] p-4 text-sm text-[hsl(var(--brand-gold-foreground))]">
          Assign this user to at least two stores or shops before creating transfers.
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => createDialog?.close()}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="min-w-0 space-y-6"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormFeedback
        errors={form.formState.errors}
        submitError={submitError}
        showValidationSummary={form.formState.submitCount > 0}
      />

      <div className="flex flex-col gap-6 lg:gap-8">
        {/* SECTION 1: Movement Details */}
        <div className="space-y-4">
          <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20 py-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Movement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source (From)</Label>
                  <Select {...form.register("sourceLocationId")} className="h-9 text-xs font-bold">
                    <option value="">Select source</option>
                    {options.locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Destination (To)</Label>
                  <Select {...form.register("destinationLocationId")} className="h-9 text-xs font-bold">
                    <option value="">Select destination</option>
                    {options.locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Transfer Date</Label>
                  <Input type="datetime-local" {...form.register("transferAt")} className="h-9 text-xs" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reference / Note</Label>
                  <textarea
                    {...form.register("note")}
                    rows={2}
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs shadow-sm transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    placeholder="Optional notes..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION 2: Transfer Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
              Transfer Items
            </h3>
            {fields.length > 0 && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {fields.length} {fields.length === 1 ? "Item" : "Items"} Listed
              </span>
            )}
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => {
              const item = items[index];
              const product = options.products.find(p => p.id === item?.productId);
              const stockAtSource = getStockForProductAtLocation(
                options,
                sourceLocationId,
                item?.productId,
              );

              return (
                <Card key={field.id} className="overflow-hidden border-slate-200/60 shadow-sm dark:border-slate-800/60">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900/30">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Line {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-destructive transition-colors hover:text-destructive/70"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="grid gap-4 md:grid-cols-12">
                      <div className="md:col-span-5 space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product</Label>
                        <Select
                          {...form.register(`items.${index}.productId`)}
                          className="h-9 text-xs"
                          searchable
                        >
                          <option value="">Select item</option>
                          {availableProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="md:col-span-3 space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit</Label>
                        <Select
                          {...form.register(`items.${index}.unitId`)}
                          className="h-9 text-xs"
                        >
                          {product ? (
                            <>
                              <option value={product.unitId}>{product.unitName}</option>
                            </>
                          ) : (
                            <option value="">Select unit</option>
                          )}
                        </Select>
                      </div>

                      <div className="md:col-span-2 space-y-1.5 text-center">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available</Label>
                        <div className="flex h-9 items-center justify-center rounded-lg border border-slate-100 bg-slate-50/50 px-2 text-[11px] font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900/30">
                          {getAvailabilityDisplay(stockAtSource, product)}
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-blue-600">Transfer Qty</Label>
                        <Input
                          type="number"
                          min={1}
                          max={getMaxQuantity(stockAtSource, product)}
                          {...form.register(`items.${index}.quantity`)}
                          className="h-9 text-xs font-bold text-blue-600"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <div className="flex justify-end pt-2 pr-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-lg border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white"
                onClick={() => append({ productId: "", unitId: "", quantity: 1 })}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Item
              </Button>
            </div>
          </div>
        </div>

        {/* SECTION 3: Footer Actions & Totals */}
        <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-6 pt-4 border-t border-border/50">
          <div className="text-[10px] text-muted-foreground italic leading-relaxed max-w-lg">
            * Transfers reduce stock at the source location immediately upon posting. Ensure the destination warehouse is prepared to receive the items.
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="rounded-xl bg-slate-50 px-4 py-2 flex items-center gap-4 dark:bg-slate-900 ring-1 ring-border min-w-[200px] justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Units</span>
              <span className="text-lg font-black text-primary">
                {items.reduce((acc, item) => acc + (Number(item?.quantity) || 0), 0)}
              </span>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
                className="h-10 flex-1 sm:flex-none rounded-xl font-bold uppercase tracking-wider text-[10px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !canSubmit}
                className="h-10 flex-1 sm:flex-none rounded-xl font-bold uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20"
              >
                {isPending ? "Posting..." : "Post Transfer"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}