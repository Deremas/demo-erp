"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";


import { CustomerForm } from "@/components/forms/customer-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { FormFeedback } from "@/components/forms/form-feedback";
import { useCreateDialog } from "@/components/tables/modal-table-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createSaleAction, updateSaleAction } from "@/lib/actions/sales";
import { formatFinanceAccountLabel } from "@/lib/finance-account-utils";
import type { ProductOption, SaleFormOptions } from "@/lib/types";
import { cn, formatCurrency, formatCustomerName, formatDateForInput } from "@/lib/utils";
import { saleSchema, type SaleFormInput } from "@/lib/validation/sale";

type SaleFormProps = {
  options: SaleFormOptions;
  userRole?: string | undefined;
  initialLocationId?: string | undefined;
  initialProductId?: string | undefined;
  initialData?: SaleFormInput | undefined;
  mode?: "page" | "modal" | undefined;
  cancelHref?: Route | undefined;
  onCancel?: (() => void) | undefined;
  onSuccess?: (() => void) | undefined;
};

type SaleLineDiscountType = "PER_QTY" | "FIXED" | "PERCENTAGE" | "";

function getStock(options: SaleFormOptions, locationId: string, productId: string) {
  return options.locationStock.find(
    (row) => row.locationId === locationId && row.productId === productId,
  );
}

function getUnitPrice(
  product: ProductOption | undefined,
  unitId: string,
  options?: SaleFormOptions,
  locationId?: string,
) {
  if (!product) return 0;
  const stockPrice = options && locationId ? getStock(options, locationId, product.id) : undefined;
  const price = stockPrice?.unitPrice ?? product.sellingPrice;
  return Number(price) || 0;
}

function getLineBaseQuantity(product: ProductOption | undefined, line: SaleFormInput["items"][number] | undefined) {
  if (!product || !line) return 0;
  return Number(line.quantity || 0);
}

function getLineGross(product: ProductOption | undefined, line: SaleFormInput["items"][number] | undefined, options: SaleFormOptions, locationId: string) {
  if (!product || !line) return 0;
  const bPrice = Number(line.unitPrice) || getUnitPrice(product, product.unitId, options, locationId);
  return Number(line.quantity || 0) * bPrice;
}

function getLineDiscountPerUnit(
  product: ProductOption | undefined,
  line: SaleFormInput["items"][number] | undefined,
  discountType: SaleLineDiscountType,
  discountRate: number,
  unitPrice?: number,
) {
  if (!product || !line || !discountType || discountRate <= 0) return 0;
  const baseQuantity = getLineBaseQuantity(product, line);

  if (baseQuantity <= 0) return 0;

  if (discountType === "PERCENTAGE") {
    return ((unitPrice ?? product.sellingPrice) * discountRate) / 100;
  }

  if (discountType === "PER_QTY") {
    return discountRate;
  }

  return discountRate / baseQuantity;
}

function buildDefaultValues(
  options: SaleFormOptions,
  initialLocationId?: string,
  initialProductId?: string,
): SaleFormInput {
  const location = initialLocationId
    ? options.locations.find((item) => item.id === initialLocationId)
    : undefined;
  const product = initialProductId
    ? options.products.find((item) => item.id === initialProductId)
    : undefined;
  const defaultUnitId = product?.unitId ?? "";
  const cashAccount = options.accounts.find(
    (account) => account.type === "CASH" && (!location?.id || !account.locationId || account.locationId === location.id),
  );
  const bankAccount = options.accounts.find(
    (account) => account.type === "BANK" && (!location?.id || !account.locationId || account.locationId === location.id),
  );
  const paymentMethod = cashAccount ? "CASH" : bankAccount ? "BANK" : "CREDIT";

  return {
    locationId: location?.id ?? "",
    customerId: "",
    paymentMethod,
    financeAccountId: paymentMethod === "BANK" ? bankAccount?.id ?? "" : cashAccount?.id ?? "",
    settlementMode: "FULL",
    amountPaid: 0,
    soldAt: formatDateForInput(),
    note: "",
    payments: [],
    items: [
      {
        productId: product?.id ?? "",
        unitId: defaultUnitId,
        quantity: 1,
        unitPrice: getUnitPrice(product, defaultUnitId, options, location?.id),
        discount: 0,
        discountType: "",
        discountRate: 0,
      },
    ],
  };
}

export function SaleForm({
  options,
  initialLocationId,
  initialProductId,
  initialData,
  mode = "page",
  cancelHref,
  onCancel,
  onSuccess,
}: SaleFormProps) {
  const router = useRouter();
  const createDialog = useCreateDialog();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [customers, setCustomers] = useState(options.customers);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const defaultValues = initialData ?? buildDefaultValues(
    options,
    initialLocationId,
    initialProductId,
  );
  const form = useForm<SaleFormInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: defaultValues,
  });
  const { fields: paymentFields, append: appendPayment, remove: removePayment } = useFieldArray({
    control: form.control,
    name: "payments",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  const locationId = form.watch("locationId");
  const paymentMethod = form.watch("paymentMethod");
  const settlementMode = form.watch("settlementMode");
  const rawAmountPaid = Number(form.watch("amountPaid") || 0);
  const items = form.watch("items");
  const payments = form.watch("payments");

  const availableProducts = options.products.filter((product) => {
    const stock = getStock(options, locationId, product.id);
    return !locationId || Boolean(stock?.availableQty);
  });
  const accounts = options.accounts.filter(
    (account) =>
      (!locationId || !account.locationId || account.locationId === locationId),
  );
  const paymentAccounts = accounts.filter((account) => paymentMethod !== "CREDIT" && (paymentMethod === "MIXED" || account.type === paymentMethod));
  const grossTotal = items.reduce((sum, item) => {
    const p = options.products.find(x => x.id === item.productId);
    return sum + getLineGross(p, item, options, locationId);
  }, 0);
  
  const discountTotal = items.reduce((sum, item) => {
    const p = options.products.find(x => x.id === item.productId);
    return sum + getLineBaseQuantity(p, item) * Number(item.discount || 0);
  }, 0);
  const netTotal = Math.max(0, grossTotal - discountTotal);

  const effectiveAmountPaid =
    paymentMethod === "CREDIT"
      ? 0
      : settlementMode === "FULL"
        ? netTotal
        : paymentMethod === "MIXED"
          ? (payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) ?? 0)
          : Math.min(rawAmountPaid, netTotal);

  const amountDue = Math.max(netTotal - effectiveAmountPaid, 0);



  useEffect(() => {
    if (settlementMode === "UNPAID") {
      if (paymentMethod !== "CREDIT") {
        form.setValue("paymentMethod", "CREDIT", { shouldDirty: true });
        form.setValue("financeAccountId", "", { shouldDirty: true });
      }
    } else if (paymentMethod === "CREDIT") {
      // If we're in FULL or PARTIAL mode, we can't be on CREDIT method
      const cashAccount = options.accounts.find(a => a.type === "CASH" && (!locationId || !a.locationId || a.locationId === locationId));
      form.setValue("paymentMethod", cashAccount ? "CASH" : "BANK", { shouldDirty: true });
    }
  }, [form, settlementMode, paymentMethod, locationId, options.accounts]);

  // Handle automatic account selection when payment method changes (POS style)
  useEffect(() => {
    if (paymentMethod === "CASH" || paymentMethod === "BANK") {
      const currentAccount = form.getValues("financeAccountId");
      const validAccounts = options.accounts.filter(a => 
        a.type === paymentMethod && (!locationId || !a.locationId || a.locationId === locationId)
      );
      
      if (validAccounts.length > 0 && (!currentAccount || !validAccounts.some(a => a.id === currentAccount))) {
        const firstAccount = validAccounts[0];
        if (firstAccount) {
          form.setValue("financeAccountId", firstAccount.id, { shouldDirty: true });
        }
      }
    } else if (paymentMethod === "CREDIT" || paymentMethod === "CHEQUE" || paymentMethod === "MIXED") {
      form.setValue("financeAccountId", "", { shouldDirty: true });
    }
  }, [paymentMethod, locationId, options.accounts, form]);

  useEffect(() => {
    const isPayingNow = paymentMethod !== "CREDIT";

    if (
      isPayingNow &&
      paymentAccounts.length > 0 &&
      !paymentAccounts.some((a) => a.id === form.getValues("financeAccountId"))
    ) {
      form.setValue("financeAccountId", "", { shouldDirty: true });
    }

    if (!isPayingNow && form.getValues("financeAccountId")) {
      form.setValue("financeAccountId", "", { shouldDirty: true });
    }
  }, [paymentAccounts, form, paymentMethod]);

  function resetLinePrice(index: number, productId: string, unitId?: string) {
    const product = options.products.find((item) => item.id === productId);
    const nextUnitId = product?.unitId || "";
    form.setValue(`items.${index}.unitId`, nextUnitId, { shouldDirty: true });
    form.setValue(`items.${index}.unitPrice`, getUnitPrice(product, nextUnitId, options, form.getValues("locationId")), { shouldDirty: true });

    if (!product) {
      form.setValue(`items.${index}.quantity`, 0, { shouldDirty: true });
      form.setValue(`items.${index}.quantity`, 0, { shouldDirty: true });
      form.setValue(`items.${index}.quantity`, 1, { shouldDirty: true });
      form.setValue(`items.${index}.discount`, 0, { shouldDirty: true });
      form.setValue(`items.${index}.discountType`, "", { shouldDirty: true });
      form.setValue(`items.${index}.discountRate`, 0, { shouldDirty: true });
      return;
    }

    const baseQuantity = Number(form.getValues(`items.${index}.quantity`) || 1);
    form.setValue(`items.${index}.quantity`, baseQuantity, { shouldDirty: true });
  }

  function updateLineQuantity(index: number, product: ProductOption | undefined, quantity: number) {
    const safeQuantity = Math.max(1, quantity);
    form.setValue(`items.${index}.quantity`, safeQuantity, { shouldDirty: true });

    const line = form.getValues(`items.${index}`);
    const discountType = (line.discountType || "") as SaleLineDiscountType;
    const discountRate = Number(line.discountRate || 0);
    form.setValue(
      `items.${index}.discount`,
        getLineDiscountPerUnit(
        product,
        { ...line, quantity: safeQuantity },
        discountType,
        discountRate,
        getUnitPrice(product, product?.unitId ?? "", options, locationId),
      ),
      { shouldDirty: true },
    );
  }

  function updateLineDiscount(index: number, product: ProductOption | undefined, discountType: SaleLineDiscountType, discountRate: number) {
    const line = form.getValues(`items.${index}`);
    form.setValue(`items.${index}.discountType`, discountType, { shouldDirty: true });
    form.setValue(`items.${index}.discountRate`, discountRate, { shouldDirty: true });
    form.setValue(
      `items.${index}.discount`,
        getLineDiscountPerUnit(
        product,
        line,
        discountType,
        discountRate,
        getUnitPrice(product, product?.unitId ?? "", options, locationId),
      ),
      { shouldDirty: true },
    );
  }

  function handleCancel() {
    setSubmitError(null);
    form.reset(defaultValues);
    onCancel?.();
    if (mode === "modal") {
      createDialog?.close();
    } else if (cancelHref) {
      router.push(cancelHref);
    } else {
      router.back();
    }
  }

  function onSubmit(values: SaleFormInput) {
    startTransition(async () => {
      setSubmitError(null);
      const result = await (defaultValues.id ? updateSaleAction(values) : createSaleAction(values));

      if (result.success) {
        toast.success(initialData?.id ? "Sale updated successfully" : "Sale recorded successfully");
        if (!initialData?.id) {
          form.reset(buildDefaultValues(options, initialLocationId, initialProductId));
        }
        router.refresh();
        onSuccess?.();
        createDialog?.close();
        if (mode === "page") {
          router.push("/sales/sales-list");
        }
      } else {
        setSubmitError(result.message);
        toast.error(result.message);
      }
    });
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

      {initialData?.id ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
          Admin correction mode: update payment, items, discounts, customer, or notes here. Saving will rebuild the sale totals, ledger entries, and stock movements for this sale.
        </div>
      ) : null}

      <div className="flex flex-col gap-8">
        {/* Row 1: Transaction Details */}
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="border-b border-border/50 bg-muted/20 py-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Selling Location</Label>
              <Select {...form.register("locationId")} className="bg-white dark:bg-slate-950 h-10">
                <option value="">Select location</option>
                {options.locations.map((location) => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Customer</Label>
                <button
                  type="button"
                  onClick={() => setIsCustomerDialogOpen(true)}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  + New Customer
                </button>
              </div>
              <Select {...form.register("customerId")} className="bg-white dark:bg-slate-950 h-10" searchable>
                <option value="">Walk-in Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {formatCustomerName(customer)}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sale Date</Label>
              <Input 
                type="datetime-local" 
                {...form.register("soldAt")} 
                className="bg-white dark:bg-slate-950 h-10" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Row 2: Line Items (RESTORED) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
              Line Items
            </h3>
          </div>

          {!locationId ? (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-sm font-medium text-slate-500">
              Please select a selling location to view and add items.
            </div>
          ) : (
          <div className="p-0 overflow-x-auto bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3 w-[80px]">Qty</th>
                  <th className="px-4 py-3 w-[120px]">Unit Price</th>
                  <th className="px-4 py-3 w-[170px]">Discount</th>
                  <th className="px-4 py-3 text-right w-[120px]">Total</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {fields.map((field, index) => {
                  const line = items[index];
                  const product = options.products.find((item) => item.id === line?.productId);
                  const stock = line?.productId ? getStock(options, locationId, line.productId) : null;

                  return (
                    <tr key={field.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-1.5 align-middle">
                        <div className="w-[200px] space-y-1">
                          <Select
                            {...form.register(`items.${index}.productId`, {
                              onChange: (event) => resetLinePrice(index, event.target.value),
                            })}
                            className="h-8 text-xs font-bold"
                            searchable
                          >
                            <option value="">Select product</option>
                            {availableProducts.map((item) => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </Select>
                          {stock && (
                            <p className="text-[9px] font-medium text-slate-400">
                              Available: <span className="font-bold text-slate-600 dark:text-slate-300">{stock.availableQty} {product?.unitName}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-1.5 align-middle">
                        <div className="w-[72px]">
                          <Input 
                            type="number" 
                            min={0} 
                            {...form.register(`items.${index}.quantity`, {
                              onChange: (e) => {
                                const q = Number(e.target.value || 0);
                                updateLineQuantity(index, product, q);
                              }
                            })}
                            className="h-8 text-xs font-bold text-center"
                            placeholder={product?.unitName || "QTY"}
                          />
                        </div>
                      </td>

                      <td className="px-4 py-1.5 align-middle">
                        <div className="w-[100px]">
                          <Controller
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                              <CurrencyInput
                                value={field.value as number}
                                onValueChange={(values) => field.onChange(values.floatValue ?? 0)}
                                className="h-8 text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900"
                              />
                            )}
                          />
                        </div>
                      </td>

                      <td className="px-4 py-1.5 align-middle">
                        <div className="flex items-center gap-1.5 w-[170px]">
                          <div className="flex gap-0.5 shrink-0 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md">
                            <button
                              type="button"
                              onClick={() => updateLineDiscount(index, product, "PER_QTY", Number(line?.discountRate || 0))}
                              className={cn(
                                "text-[8px] font-black uppercase px-1.5 py-0.5 rounded transition-colors",
                                (line?.discountType || "PER_QTY") === "PER_QTY"
                                  ? "bg-white dark:bg-slate-700 text-destructive shadow-sm"
                                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                              )}
                            >QTY</button>
                            <button
                              type="button"
                              onClick={() => updateLineDiscount(index, product, "FIXED", Number(line?.discountRate || 0))}
                              className={cn(
                                "text-[8px] font-black uppercase px-1.5 py-0.5 rounded transition-colors",
                                line?.discountType === "FIXED"
                                  ? "bg-white dark:bg-slate-700 text-destructive shadow-sm"
                                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                              )}
                            >FIX</button>
                            <button
                              type="button"
                              onClick={() => updateLineDiscount(index, product, "PERCENTAGE", Number(line?.discountRate || 0))}
                              className={cn(
                                "text-[8px] font-black uppercase px-1.5 py-0.5 rounded transition-colors",
                                line?.discountType === "PERCENTAGE"
                                  ? "bg-white dark:bg-slate-700 text-destructive shadow-sm"
                                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                              )}
                            >%</button>
                          </div>
                          <CurrencyInput
                            value={line?.discountRate != null ? Number(line.discountRate) : ""}
                            onValueChange={(values) =>
                              updateLineDiscount(
                                index,
                                product,
                                ((line?.discountType || "PER_QTY") as SaleLineDiscountType),
                                values.floatValue ?? 0,
                              )
                            }
                            placeholder="0"
                            className="h-8 w-full border border-destructive/20 bg-destructive/5 rounded-lg text-right text-[11px] font-black px-2 focus:outline-none focus:border-destructive text-destructive placeholder:text-destructive/30"
                          />
                        </div>
                      </td>

                      <td className="px-4 py-1.5 text-right align-middle">
                        {(() => {
                          const gross = getLineGross(product, line, options, locationId);
                          const discount = getLineBaseQuantity(product, line) * Number(line?.discount || 0);
                          const total = Math.max(0, gross - discount);
                          return (
                            <>
                              <p className="text-[13px] font-black text-slate-950 dark:text-white mt-1">{formatCurrency(total)}</p>
                              {discount > 0 && <p className="text-[10px] font-bold text-destructive">-{formatCurrency(discount)}</p>}
                            </>
                          );
                        })()}
                      </td>

                      <td className="px-4 py-1.5 align-middle">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-end p-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white font-bold px-6"
                onClick={() => {
                  append({
                    productId: "",
                    unitId: "",
                    quantity: 1,
                    unitPrice: 0,
                    discount: 0,
                    discountType: "",
                    discountRate: 0,
                  });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Line Item
              </Button>
            </div>
            </div>
          )}
        </div>

        {/* Row 3: Financials Footer Grid */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Payment & Settlement Card */}
          <Card className="border-none shadow-sm ring-1 ring-border lg:col-span-3">
            <CardHeader className="border-b border-border/50 bg-muted/20 py-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Payment & Settlement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                    {(["CASH", "BANK", "CHEQUE", "CREDIT", "MIXED"] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => {
                          form.setValue("paymentMethod", method, { shouldDirty: true });
                          form.setValue("settlementMode", method === "CREDIT" ? "UNPAID" : "FULL", { shouldDirty: true });
                        }}
                        className={cn(
                          "h-10 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border",
                          paymentMethod === method
                            ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]"
                            : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
                        )}
                      >
                        {method === "CREDIT" ? "CREDIT" : method}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === "MIXED" && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between px-1">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Breakdown</Label>
                      <button 
                        type="button" 
                        onClick={() => appendPayment({ method: "CASH", amount: 0, financeAccountId: "" })}
                        className="text-[10px] font-black text-primary uppercase hover:underline"
                      >
                        + Add Method
                      </button>
                    </div>
                    <div className="space-y-2">
                      {paymentFields.map((field, idx) => (
                        <div key={field.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Select 
                              {...form.register(`payments.${idx}.method`)} 
                              className="h-8 w-24 text-[10px] font-bold"
                            >
                              <option value="CASH">Cash</option>
                              <option value="BANK">Bank</option>
                              <option value="CHEQUE">Cheque</option>
                              <option value="CREDIT">Credit</option>
                            </Select>

                            {["CASH", "BANK"].includes(form.watch(`payments.${idx}.method`) ?? "") ? (
                              <Select 
                                {...form.register(`payments.${idx}.financeAccountId`)} 
                                className="h-8 flex-1 text-[10px]"
                              >
                                <option value="">Select account</option>
                                {options.accounts
                                  .filter(acc => acc.type === form.watch(`payments.${idx}.method`) && (!acc.locationId || acc.locationId === locationId))
                                  .map(acc => (
                                    <option key={acc.id} value={acc.id}>{formatFinanceAccountLabel(acc)}</option>
                                  ))}
                              </Select>
                            ) : (
                              <div className="flex-1 text-[10px] font-bold text-slate-400 italic">
                                {form.watch(`payments.${idx}.method`) === "CHEQUE" ? "Cheque details below" : "No account needed"}
                              </div>
                            )}

                            <Controller
                              control={form.control}
                              name={`payments.${idx}.amount`}
                              render={({ field: amtField }) => (
                                <CurrencyInput
                                  value={amtField.value as number}
                                  onValueChange={(values) => amtField.onChange(values.floatValue ?? 0)}
                                  className="h-8 w-28 text-right text-[11px] font-black"
                                />
                              )}
                            />
                            <button type="button" onClick={() => removePayment(idx)} className="text-destructive hover:text-destructive/80">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          
                          {form.watch(`payments.${idx}.method`) === "CHEQUE" && (
                            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 mt-1">
                              <Input placeholder="Cheque #" {...form.register(`payments.${idx}.chequeNumber`)} className="h-8 text-[10px]" />
                              <Input placeholder="Bank" {...form.register(`payments.${idx}.bankName`)} className="h-8 text-[10px]" />
                              <Input type="date" {...form.register(`payments.${idx}.chequeDate`)} className="h-8 text-[10px]" />
                              <Input type="date" {...form.register(`payments.${idx}.depositableDate`)} className="h-8 text-[10px]" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  {(paymentMethod === "CASH" || paymentMethod === "BANK" || paymentMethod === "CHEQUE") && (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                        {paymentMethod === "BANK" ? "Bank Account" : paymentMethod === "CHEQUE" ? "Settlement Account (Optional)" : "Cash Account"}
                      </Label>
                      <Select {...form.register("financeAccountId")} className="h-10 text-sm">
                        <option value="">Select account</option>
                        {paymentAccounts.map((account) => (
                          <option key={account.id} value={account.id}>{formatFinanceAccountLabel(account)}</option>
                        ))}
                      </Select>
                    </div>
                  )}

                  {paymentMethod === "CHEQUE" && (
                    <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/30 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-600">Cheque Details</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[9px] font-bold uppercase text-slate-400 pl-1">Cheque Number</Label>
                          <Input placeholder="e.g. 12345678" {...form.register("chequeNumber")} className="h-9 text-xs font-bold bg-white dark:bg-slate-950" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-bold uppercase text-slate-400 pl-1">Bank Name</Label>
                          <Input placeholder="e.g. CBE / BOA" {...form.register("bankName")} className="h-9 text-xs font-bold bg-white dark:bg-slate-950" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-bold uppercase text-slate-400 pl-1">Cheque Date</Label>
                          <Input type="date" {...form.register("chequeDate")} className="h-9 text-xs font-bold bg-white dark:bg-slate-950" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-bold uppercase text-slate-400 pl-1">Depositable Date</Label>
                          <Input type="date" {...form.register("depositableDate")} className="h-9 text-xs font-bold bg-white dark:bg-slate-950" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sale Summary Card */}
          <Card className="border-none shadow-sm ring-1 ring-border bg-slate-50/50 lg:col-span-2">
            <CardHeader className="border-b border-border/50 bg-muted/20 py-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Sale Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Gross Subtotal</span>
                    <span className="text-slate-600">{formatCurrency(grossTotal)}</span>
                  </div>
                  {discountTotal > 0 && (
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-green-600">
                      <span>Total Savings</span>
                      <span>-{formatCurrency(discountTotal)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                  <span className="text-sm font-black uppercase tracking-tight text-slate-900">Total Payable</span>
                  <span className="text-2xl font-black text-slate-900">{formatCurrency(netTotal)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  disabled={isPending} 
                  className="h-14 w-full rounded-2xl bg-sky-400 font-black uppercase tracking-widest text-white shadow-lg shadow-sky-200 transition-all hover:bg-sky-500 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isPending ? "Processing..." : `${initialData?.id ? "Update Sale" : "Complete"} ${formatCurrency(netTotal)}`}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={handleCancel} 
                  disabled={isPending} 
                  className="h-10 w-full rounded-xl font-bold uppercase tracking-wider text-[10px] text-slate-400 hover:bg-slate-100"
                >
                  Cancel & Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Add Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm 
             onSuccess={(newCustomer) => {
                setCustomers((prev) => [...prev, newCustomer]);
                form.setValue("customerId", newCustomer.id, { shouldDirty: true });
                setIsCustomerDialogOpen(false);
             }}
             onCancel={() => setIsCustomerDialogOpen(false)}
             refreshAfterSuccess={false}
             closeCreateDialogOnSuccess={true}
          />
        </DialogContent>
      </Dialog>
    </form>
  );
}
