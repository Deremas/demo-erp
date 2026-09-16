"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FormFeedback } from "@/components/forms/form-feedback";
import { SupplierForm } from "@/components/forms/supplier-form";
import { useCreateDialog } from "@/components/tables/modal-table-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createPurchaseAction, updatePurchaseAction } from "@/lib/actions/purchases";
import type { PurchaseFormOptions } from "@/lib/types";
import { cn, formatCurrency, formatDateForInput } from "@/lib/utils";
import {
  purchaseSchema,
  type PurchaseFormInput,
} from "@/lib/validation/purchase";
import { formatFinanceAccountLabel } from "@/lib/finance-account-utils";

type PurchaseFormProps = {
  options: PurchaseFormOptions;
  userRole?: string | undefined;
  initialLocationId?: string | undefined;
  initialProductId?: string | undefined;
  initialData?: PurchaseFormInput | undefined;
  mode?: "page" | "modal" | undefined;
  cancelHref?: Route | undefined;
  onCancel?: (() => void) | undefined;
  onSuccess?: (() => void) | undefined;
  defaultIsUsd?: boolean | undefined;
};

function PurchaseItemPicker({
  value,
  products,
  disabledProductIds,
  onValueChange,
}: {
  value: string;
  products: PurchaseFormOptions["products"];
  disabledProductIds: Set<string>;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const selectedProduct = products.find((product) => product.id === value);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      return;
    }
    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [open]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;
    return products.filter((p) => {
      const searchStr = `${p.name} ${p.sku || ""} ${p.companyName || ""}`.toLowerCase();
      return searchStr.includes(query);
    });
  }, [searchQuery, products]);

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-primary/40 data-[state=open]:ring-2 data-[state=open]:ring-primary/20"
        >
          <span
            className={cn(
              "min-w-0 truncate text-left",
              selectedProduct ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {selectedProduct?.name ?? "Select item"}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        collisionPadding={12}
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[320px] max-w-[min(32rem,calc(100vw-2rem))] p-1"
      >
        <div
          className="sticky top-0 z-10 bg-popover p-1"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-2.5 text-sm shadow-sm focus-within:border-[hsl(var(--brand-cyan)/0.65)] focus-within:ring-2 focus-within:ring-[hsl(var(--brand-cyan)/0.18)]">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search items..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div
          style={{
            maxHeight: "220px",
            overflowY: "auto",
            scrollbarWidth: "thin",
          }}
        >
          <DropdownMenuRadioGroup value={value} onValueChange={(val) => {
            onValueChange(val);
            setOpen(false);
          }}>
            <DropdownMenuRadioItem value="">
              <span className="truncate">Select item</span>
            </DropdownMenuRadioItem>

            {filteredProducts.map((product) => {
              const disabled =
                disabledProductIds.has(product.id) && product.id !== value;

              return (
                <DropdownMenuRadioItem
                  key={product.id}
                  value={product.id}
                  disabled={disabled}
                  className="max-w-full"
                >
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <span className="whitespace-normal leading-snug">
                      {product.name}
                      {product.companyName && (
                        <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          ({product.companyName})
                        </span>
                      )}
                    </span>

                    {disabled ? (
                      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Added
                      </span>
                    ) : null}
                  </div>
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
          {filteredProducts.length === 0 && (
            <div className="px-3 py-6 text-center text-xs font-semibold text-muted-foreground">
              No matching items
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getDefaultValues(
  options: PurchaseFormOptions,
  initialLocationId?: string,
  initialProductId?: string,
  defaultIsUsd = false,
): PurchaseFormInput {
  const defaultProduct = options.products.find(
    (product) => product.id === initialProductId,
  );

  const defaultLocation = options.locations.find(
    (loc) => loc.id === initialLocationId,
  );

  return {
    locationId: defaultLocation?.id ?? "",
    supplierId: "",
    paymentMethod: "CASH",
    paymentAccountId: "",
    settlementMode: "FULL",
    amountPaid: 0,
    payments: [],
    purchasedAt: formatDateForInput(),
    note: "",
    isUsd: defaultIsUsd,
    exchangeRate: 0,
    items: [
      {
        productId: defaultProduct?.id ?? "",
        unitId: defaultProduct?.unitId ?? "",
        quantity: 1,
        unitCost: defaultProduct?.buyingPrice ?? 0,
        sellingPrice: defaultProduct?.sellingPrice ?? 0,
      },
    ],
  };
}

function getUnitPrices(
  product: PurchaseFormOptions["products"][number] | undefined,
) {
  if (!product) {
    return { buyingPrice: 0, sellingPrice: 0 };
  }
  return {
    buyingPrice: product.buyingPrice,
    sellingPrice: product.sellingPrice,
  };
}

function getDerivedUnitHint(
  product: PurchaseFormOptions["products"][number] | undefined,
  unitId: string,
  price: number,
  isUsd?: boolean,
): string | null {
  return null;
}

function getConversionPreview(
  product: PurchaseFormOptions["products"][number] | undefined,
  unitId: string,
  quantity: number,
): string | null {
  return null;
}

function getEditableConversionPreview(
  product: PurchaseFormOptions["products"][number] | undefined,
  unitId: string,
  quantity: number,
): string | null {
  return null;
}

export function PurchaseForm({
  options,
  initialLocationId,
  initialProductId,
  initialData,
  mode = "page",
  cancelHref,
  onCancel,
  onSuccess,
  defaultIsUsd = false,
}: PurchaseFormProps) {
  const createDialog = useCreateDialog();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [supplierOptions, setSupplierOptions] = useState(options.suppliers);
  const [isSupplierDialogOpen, setSupplierDialogOpen] = useState(false);

  const defaultValues = initialData ?? getDefaultValues(
    { ...options, suppliers: supplierOptions },
    initialLocationId,
    initialProductId,
    defaultIsUsd,
  );

  const canSubmit = options.locations.length > 0 && options.products.length > 0;

  const form = useForm<PurchaseFormInput>({
    resolver: zodResolver(purchaseSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control: form.control,
    name: "payments",
  });

  const locationId = form.watch("locationId");
  const supplierId = form.watch("supplierId");
  const settlementMode = form.watch("settlementMode");
  const paymentMethod = form.watch("paymentMethod");
  const paymentAccountId = form.watch("paymentAccountId");
  const rawAmountPaid = Number(form.watch("amountPaid") || 0);
  const items = form.watch("items");
  const payments = form.watch("payments");

  const previousProductIds = useRef(
    defaultValues.items.map((item) => item.productId),
  );

  const total = items.reduce((sum, item) => {
    return sum + Number(item.quantity || 0) * Number(item.unitCost || 0);
  }, 0);
  const subtotal = total;

  const availableAccounts = useMemo(
    () =>
      options.accounts.filter(
        (account) =>
          !locationId || !account.locationId || account.locationId === locationId,
      ),
    [locationId, options.accounts],
  );

  const selectedProductIds = useMemo(
    () => new Set(items.map((item) => item.productId).filter(Boolean)),
    [items],
  );

  const productNameById = useMemo(
    () => new Map(options.products.map((product) => [product.id, product.name])),
    [options.products],
  );

  const hasUnusedProducts = useMemo(
    () => options.products.some((product) => !selectedProductIds.has(product.id)),
    [options.products, selectedProductIds],
  );

  const purchaseSummaryItems = useMemo(
    () =>
      items
        .map((item, index) => {
          const quantity = Number(item.quantity || 0);
          const unitCost = Number(item.unitCost || 0);
          const productName = item.productId
            ? productNameById.get(item.productId) ?? `Line ${index + 1}`
            : `Line ${index + 1}`;

          return {
            id: `${index}-${item.productId || "empty"}`,
            productName,
            quantity,
            unitCost,
            lineTotal: quantity * unitCost,
            hasSelection: Boolean(item.productId),
          };
        })
        .filter(
          (item) =>
            item.hasSelection || item.unitCost > 0,
        ),
    [items, productNameById],
  );

  const mixedTotal = payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) ?? 0;

  const effectiveAmountPaid = settlementMode === "UNPAID" ? 0 : mixedTotal;

  const amountDue = Math.max(total - effectiveAmountPaid, 0);

  const canPostWithPayment =
    settlementMode === "UNPAID" || availableAccounts.length > 0;

  useEffect(() => {
    items.forEach((item, index) => {
      const previousProductId = previousProductIds.current[index];

      if (item.productId === previousProductId) {
        return;
      }

      const product = options.products.find(
        (option) => option.id === item.productId,
      );

      form.setValue(`items.${index}.unitId`, product?.unitId ?? "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      form.setValue(`items.${index}.unitCost`, product?.buyingPrice ?? 0, {
        shouldDirty: true,
      });
    });

    previousProductIds.current = items.map((item) => item.productId);
  }, [form, items, options.products]);

  useEffect(() => {
    if (supplierOptions.length === 0) {
      if (supplierId) {
        form.setValue("supplierId", "", {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      return;
    }

    if (
      supplierId &&
      !supplierOptions.some((supplier) => supplier.id === supplierId)
    ) {
      form.setValue("supplierId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [form, supplierId, supplierOptions]);



  // Seed one payment row when switching to a paying mode; clear rows on Credit
  useEffect(() => {
    if (settlementMode !== "UNPAID" && (!payments || payments.length === 0)) {
      appendPayment({ method: "CASH", amount: 0, financeAccountId: "" });
    }
    if (settlementMode === "UNPAID" && payments && payments.length > 0) {
      for (let i = payments.length - 1; i >= 0; i--) removePayment(i);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settlementMode]);

  useEffect(() => {
    items.forEach((item, index) => {
      const product = options.products.find((p) => p.id === item.productId);
      if (!product) return;
      const quantity = Number(item.quantity || 0);
      if (!quantity) {
        form.setValue(`items.${index}.quantity`, 1, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    });
  }, [form, items, options.products]);

  function getResetValues() {
    return {
      ...getDefaultValues(
        { ...options, suppliers: supplierOptions },
        form.getValues("locationId") || initialLocationId,
        initialProductId,
      ),
      locationId: form.getValues("locationId") || defaultValues.locationId,
      supplierId: form.getValues("supplierId") || "",
    } satisfies PurchaseFormInput;
  }

  function handleCancel() {
    setSubmitError(null);
    form.reset(getResetValues());

    if (mode === "page") {
      onCancel?.();

      if (cancelHref) {
        router.push(cancelHref);
      } else {
        router.back();
      }

      return;
    }

    onCancel?.();
    createDialog?.close();
  }

  function onSubmit(values: PurchaseFormInput) {
    startTransition(async () => {
      setSubmitError(null);

      const result = await (defaultValues.id
        ? updatePurchaseAction(values)
        : createPurchaseAction(values));

      if (!result.success) {
        setSubmitError(result.message);
        toast.error(result.message);
        return;
      }

      setSubmitError(null);
      toast.success(result.message);
      
      if (!defaultValues.id) {
        form.reset(getResetValues());
      }
      
      router.refresh();
      onSuccess?.();
      createDialog?.close();
      
      if (mode === "page") {
        router.push("/purchases/list");
      }
    });
  }

  function handleAppendItem() {
    if (!hasUnusedProducts) {
      toast.error(
        "All items are already added. Increase quantity on the existing line instead.",
      );
      return;
    }

    append({
      productId: "",
      unitId: "",
      quantity: 1,
      unitCost: 0,
      sellingPrice: 0,
    });
  }

  function handleLineProductChange(index: number, productId: string) {
    const product = options.products.find((option) => option.id === productId);
    const prices = getUnitPrices(product);

    form.setValue(`items.${index}.productId`, productId, {
      shouldDirty: true,
      shouldValidate: true,
    });

    form.setValue(`items.${index}.unitId`, product?.unitId ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });

    form.setValue(`items.${index}.unitCost`, prices.buyingPrice, {
      shouldDirty: true,
    });
    
    form.setValue(`items.${index}.sellingPrice`, prices.sellingPrice, {
      shouldDirty: true,
    });
  }

  return (
    <>
      <form
        className="w-full max-w-full min-w-0 overflow-x-clip space-y-6"
        onChangeCapture={() => {

          if (submitError) {
            setSubmitError(null);
          }
        }}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormFeedback
          errors={form.formState.errors}
          submitError={submitError}
          showValidationSummary={form.formState.submitCount > 0}
        />
        <div className="grid min-w-0 max-w-full gap-6 overflow-x-clip">
          <div className="min-w-0 space-y-6">
            <Card className="min-w-0 border-none shadow-sm ring-1 ring-border">
              <CardHeader className="border-b border-border/50 bg-muted/20 py-3">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Transaction Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Location</Label>
                  <Select {...form.register("locationId")} className="bg-white dark:bg-slate-950">
                    <option value="">Select location</option>
                    {options.locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">USD Tracking</Label>
                  <div className="flex h-10 w-fit items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-3 dark:border-slate-800 dark:bg-slate-900/50">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Track in USD</span>
                    <button
                      type="button"
                      onClick={() => form.setValue("isUsd", !form.watch("isUsd"), { shouldDirty: true })}
                      className={cn(
                        "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        form.watch("isUsd") ? "bg-blue-600" : "bg-slate-300",
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          form.watch("isUsd") ? "translate-x-3" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>
                </div>

                {form.watch("isUsd") && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Exchange Rate (ETB/USD)</Label>
                    <Input
                      placeholder="e.g. 125"
                      type="number"
                      step="0.01"
                      className="h-10 bg-white text-xs font-bold dark:bg-slate-950"
                      {...form.register("exchangeRate")}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Supplier (Optional)</Label>
                    <button type="button" onClick={() => setSupplierDialogOpen(true)} className="text-[10px] font-bold text-primary hover:underline">+ New Supplier</button>
                  </div>
                  <Select {...form.register("supplierId")} className="bg-white dark:bg-slate-950" searchable>
                    <option value="">Direct Purchase / Walk-in</option>
                    {supplierOptions.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Purchase Date</Label>
                  <Input type="datetime-local" {...form.register("purchasedAt")} className="bg-white dark:bg-slate-950" />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                  Line Items
                </h3>
              </div>

              <div className="min-w-0 space-y-3">
                {fields.map((field, index) => {
                  const quantity = Number(items[index]?.quantity ?? 1);
                  return (
                    <Card
                      key={field.id}
                      className="w-full min-w-0 max-w-full overflow-hidden border-slate-200/60 shadow-sm dark:border-slate-800/60"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900/30">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Line {index + 1}
                        </span>

                        {index > 0 ? (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-destructive transition-colors hover:text-destructive/70"
                            title="Remove line"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>

                      <CardContent className="max-w-full overflow-x-auto p-3">
                        <div className="grid w-full min-w-0 grid-cols-[minmax(14rem,1.8fr)_6rem_minmax(9rem,1fr)_minmax(9rem,1fr)] items-start gap-2 [&_label]:flex [&_label]:h-8 [&_label]:items-end [&_label]:leading-tight">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Item
                            </Label>

                            <PurchaseItemPicker
                              value={items[index]?.productId ?? ""}
                              products={options.products}
                              disabledProductIds={
                                new Set(
                                  items
                                    .filter((_, itemIndex) => itemIndex !== index)
                                    .map((item) => item.productId)
                                    .filter(Boolean),
                                )
                              }
                              onValueChange={(nextValue: string) =>
                                handleLineProductChange(index, nextValue)
                              }
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Qty
                            </Label>

                            <Input
                              type="number"
                              min={1}
                              {...form.register(`items.${index}.quantity`)}
                              className="h-9"
                            />

                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Buy Price ({form.watch("isUsd") ? "USD" : "ETB"})
                            </Label>

                            <Controller
                              control={form.control}
                              name={`items.${index}.unitCost`}
                              render={({ field: { value, onChange, ref } }) => (
                                <CurrencyInput
                                  value={value as any}
                                  onValueChange={(values) =>
                                    onChange(values.floatValue ?? 0)
                                  }
                                  getInputRef={ref}
                                  className="h-9"
                                />
                              )}
                            />

                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Sell Price (ETB)
                            </Label>

                            <Controller
                              control={form.control}
                              name={`items.${index}.sellingPrice`}
                              render={({ field: { value, onChange, ref } }) => (
                                <CurrencyInput
                                  value={value as any}
                                  onValueChange={(values) =>
                                    onChange(values.floatValue ?? 0)
                                  }
                                  getInputRef={ref}
                                  className="h-9"
                                />
                              )}
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
                    disabled={options.products.length === 0}
                    onClick={handleAppendItem}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Item
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-12 dark:border-slate-800">
                    <div className="rounded-full bg-slate-50 p-3 dark:bg-slate-900">
                      <Plus className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-400">No items added yet</p>
                    <Button type="button" variant="ghost" size="sm" className="mt-4 text-primary" onClick={handleAppendItem}>
                      Click to add your first item
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="min-w-0 space-y-6">
            <Card className="min-w-0 border-none bg-slate-50 shadow-none dark:bg-slate-900/40">
              <CardHeader className="border-b border-slate-200/60 bg-slate-100/30 py-3 dark:border-slate-800">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2">
                  <div className="space-y-6 p-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Payment & Settlement
                      </Label>
                      
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: "FULL", label: "FULL PAYMENT", color: "bg-green-600" },
                          { id: "PARTIAL", label: "PARTIAL", color: "bg-amber-500" },
                          { id: "UNPAID", label: "PAY LATER", color: "bg-slate-700" }
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => form.setValue("settlementMode", mode.id as any, { shouldDirty: true })}
                            className={cn(
                              "flex-1 min-w-[100px] h-10 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase border-2",
                              settlementMode === mode.id 
                                ? `${mode.color} border-transparent text-white shadow-lg` 
                                : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 dark:bg-slate-950 dark:border-slate-800"
                            )}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>

                      {settlementMode !== "UNPAID" && (
                        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment Breakdown</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[10px] font-bold text-primary hover:bg-primary/5"
                              onClick={() => appendPayment({ method: "CASH", amount: 0, financeAccountId: "" })}
                            >
                              + ADD METHOD
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {paymentFields.map((field, index) => {
                              const rowMethod = form.watch(`payments.${index}.method`);
                              const rowAccounts = availableAccounts.filter(a =>
                                (rowMethod === "CASH" ? a.type === "CASH" : a.type === "BANK")
                              );
                              return (
                                <div key={field.id} className="group flex flex-wrap items-end gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2 dark:border-slate-900 dark:bg-slate-900/30">
                                  <div className="flex-1 min-w-[100px] space-y-1">
                                    <Label className="text-[9px] font-bold uppercase text-slate-400 pl-1">Method</Label>
                                    <Select {...form.register(`payments.${index}.method`)} className="h-8 text-[11px] font-bold bg-white dark:bg-slate-950">
                                      <option value="CASH">Cash</option>
                                      <option value="BANK">Bank</option>
                                    </Select>
                                  </div>
                                  <div className="flex-[2] min-w-[150px] space-y-1">
                                    <Label className="text-[9px] font-bold uppercase text-slate-400 pl-1">Account</Label>
                                    <Select {...form.register(`payments.${index}.financeAccountId`)} className="h-8 text-[11px] font-bold bg-white dark:bg-slate-950">
                                      <option value="">Select account</option>
                                      {rowAccounts.map(a => (
                                        <option key={a.id} value={a.id}>{formatFinanceAccountLabel(a)}</option>
                                      ))}
                                    </Select>
                                  </div>
                                  <div className="flex-1 min-w-[100px] space-y-1">
                                    <Label className="text-[9px] font-bold uppercase text-slate-400 pl-1">Amount ({form.watch("isUsd") ? "$" : "ETB"})</Label>
                                    <Controller
                                      control={form.control}
                                      name={`payments.${index}.amount`}
                                      render={({ field: { value, onChange } }) => (
                                        <CurrencyInput
                                          value={value as any}
                                          onValueChange={(v) => onChange(v.floatValue ?? 0)}
                                          className="h-8 text-[11px] font-black bg-white dark:bg-slate-950"
                                        />
                                      )}
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-300 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removePayment(index)}
                                    disabled={paymentFields.length === 1}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-l border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950/50">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <span>Gross Subtotal</span>
                          <span className="text-slate-600 font-black">
                            {form.watch("isUsd") ? `$ ${subtotal.toLocaleString()}` : formatCurrency(subtotal)}
                          </span>
                        </div>
                        <div className="h-px bg-slate-100 dark:bg-slate-800" />
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm font-black uppercase tracking-tighter text-slate-900 dark:text-white">Payable Amount</span>
                          <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                            {form.watch("isUsd") ? `$ ${total.toLocaleString()}` : formatCurrency(total)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-slate-400">Paid Amount</span>
                          <span className="text-green-600">
                            {form.watch("isUsd") ? `$ ${effectiveAmountPaid.toLocaleString()}` : formatCurrency(effectiveAmountPaid)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-slate-400">Balance Due</span>
                          <span className={cn(amountDue > 0 ? "text-destructive" : "text-green-600")}>
                            {form.watch("isUsd") ? `$ ${amountDue.toLocaleString()}` : formatCurrency(amountDue)}
                          </span>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isPending || !canSubmit || !canPostWithPayment}
                        className="w-full h-14 rounded-2xl bg-[linear-gradient(135deg,hsl(var(--brand-blue)),hsl(var(--brand-cyan)))] text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                      >
                        {isPending ? "PROCESSING..." : defaultValues.id ? "UPDATE PURCHASE" : "COMPLETE ORDER"}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={isPending}
                        className="w-full h-10 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        CANCEL TRANSACTION
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      <Dialog open={isSupplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add supplier</DialogTitle>
            <DialogDescription>
              Create a supplier without leaving the purchase entry.
            </DialogDescription>
          </DialogHeader>

          <SupplierForm
            onCancel={() => setSupplierDialogOpen(false)}
            onSuccess={(supplier) => {
              setSupplierOptions((prev) => [...prev, supplier]);
              form.setValue("supplierId", supplier.id, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setSupplierDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}