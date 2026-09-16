"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

import { FormFeedback } from "@/components/forms/form-feedback";
import { createSupplierPaymentAction } from "@/lib/actions/supplier-payments";
import type { SupplierPaymentFormOptions } from "@/lib/types";
import { formatCurrency, formatDateTime, formatDateForInput } from "@/lib/utils";
import {
  supplierPaymentSchema,
  type SupplierPaymentFormInput,
  type SupplierPaymentInput,
} from "@/lib/validation/supplier-payment";
import { useCreateDialog } from "@/components/tables/modal-table-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatFinanceAccountLabel } from "@/lib/finance-account-utils";

type SupplierPaymentFormProps = {
  options: SupplierPaymentFormOptions;
  initialSupplierId?: string;
  initialPurchaseId?: string;
};

function getDefaultValues(
  options: SupplierPaymentFormOptions,
  initialSupplierId?: string,
  initialPurchaseId?: string,
): SupplierPaymentFormInput {
  const defaultSupplier =
    options.suppliers.find((supplier) => supplier.id === initialSupplierId) ??
    options.suppliers[0];
  const supplierPurchases = options.outstandingPurchases.filter(
    (purchase) => purchase.supplierId === defaultSupplier?.id,
  );
  const defaultPurchase = supplierPurchases.find(p => p.id === initialPurchaseId) ?? supplierPurchases[0];

  return {
    supplierId: defaultSupplier?.id ?? "",
    purchaseId: defaultPurchase?.id ?? "",
    financeAccountId: "",
    settlementMode: "FULL",
    paymentMethod: "CASH",
    amount: defaultPurchase?.amountDue ?? 0,
    paymentDate: formatDateForInput(),
    note: "",
    isUsd: false,
    exchangeRate: 0,
    payments: [],
  };
}

export function SupplierPaymentForm({
  options,
  initialSupplierId,
  initialPurchaseId,
}: SupplierPaymentFormProps) {
  const createDialog = useCreateDialog();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const defaultValues = getDefaultValues(options, initialSupplierId, initialPurchaseId);

  const form = useForm<SupplierPaymentFormInput, undefined, SupplierPaymentInput>({
    resolver: zodResolver(supplierPaymentSchema),
    defaultValues,
  });

  const supplierId = form.watch("supplierId");
  const purchaseId = form.watch("purchaseId");
  const settlementMode = form.watch("settlementMode");
  const paymentMethod = form.watch("paymentMethod");
  const isUsd = form.watch("isUsd");
  const exchangeRate = Number(form.watch("exchangeRate") || 0);
  const watchedAmount = Number(form.watch("amount") || 0);

  const supplierPurchases = useMemo(
    () => options.outstandingPurchases.filter((purchase) => purchase.supplierId === supplierId),
    [options.outstandingPurchases, supplierId],
  );

  const selectedPurchase =
    supplierPurchases.find((purchase) => purchase.id === purchaseId) ?? supplierPurchases[0];
  
  const paymentEtbDeduction = isUsd ? watchedAmount * exchangeRate : watchedAmount;
  const balanceImpactEtb = isUsd && selectedPurchase?.trackInUsd
    ? watchedAmount * selectedPurchase.exchangeRate
    : paymentEtbDeduction;
  const remainingAfterPayment = Math.max(0, (selectedPurchase?.amountDue ?? 0) - balanceImpactEtb);
  const selectedPurchaseUsdDue = selectedPurchase?.trackInUsd && selectedPurchase.exchangeRate > 0
    ? selectedPurchase.amountDue / selectedPurchase.exchangeRate
    : null;

  const availableAccounts = useMemo(
    () =>
      options.accounts.filter(
        (account) =>
          !selectedPurchase || !account.locationId || account.locationId === selectedPurchase.locationId,
      ),
    [options.accounts, selectedPurchase],
  );

  const { fields: paymentFields, append: appendPayment, remove: removePayment } = useFieldArray({
    control: form.control,
    name: "payments",
  });

  useEffect(() => {
    if (!supplierPurchases.some((purchase) => purchase.id === purchaseId)) {
      form.setValue("purchaseId", supplierPurchases[0]?.id ?? "", {
        shouldDirty: true,
      });
    }
  }, [form, purchaseId, supplierPurchases]);

  useEffect(() => {
    const financeAccountId = form.getValues("financeAccountId");
    if (financeAccountId !== "") {
      const validForMethod = availableAccounts.some(
        (a) => a.id === financeAccountId && (paymentMethod === "MIXED" || a.type === paymentMethod)
      );
      if (!validForMethod) {
        form.setValue("financeAccountId", "", { shouldDirty: true });
      }
    }
  }, [availableAccounts, paymentMethod, form]);

  // Auto-seed exchange rate from purchase
  useEffect(() => {
    if (isUsd && selectedPurchase?.trackInUsd && selectedPurchase.exchangeRate > 0) {
      const currentRate = form.getValues("exchangeRate");
      if (!currentRate || Number(currentRate) === 0) {
        form.setValue("exchangeRate", selectedPurchase.exchangeRate, { shouldDirty: true });
      }
    }
  }, [isUsd, selectedPurchase, form]);

  useEffect(() => {
    if (settlementMode === "FULL") {
      const dueEtb = selectedPurchase?.amountDue ?? 0;
      let amountToSet = dueEtb;

      if (isUsd) {
        if (selectedPurchase?.trackInUsd && selectedPurchase.exchangeRate > 0) {
          // If the purchase was tracked in USD, we want to pay the original USD balance
          amountToSet = dueEtb / selectedPurchase.exchangeRate;
        } else if (exchangeRate > 0) {
          // If it's an ETB purchase paid in USD, we use the CURRENT rate
          amountToSet = dueEtb / exchangeRate;
        }
      }
      
      form.setValue("amount", Number(amountToSet.toFixed(2)), {
        shouldDirty: true,
      });
      return;
    }

    const currentAmount = Number(form.getValues("amount") || 0);
    if (!selectedPurchase) {
      form.setValue("amount", 0, { shouldDirty: true });
    } else if (currentAmount <= 0 || currentAmount > selectedPurchase.amountDue) {
      form.setValue("amount", selectedPurchase.amountDue, { shouldDirty: true });
    }
  }, [form, selectedPurchase, settlementMode, isUsd, exchangeRate]);

  useEffect(() => {
    if (paymentMethod === "MIXED" && paymentFields.length === 0) {
      appendPayment({ method: "CASH", financeAccountId: "", amount: watchedAmount });
    }
  }, [paymentMethod, paymentFields.length, appendPayment, watchedAmount]);

  function handleCancel() {
    setSubmitError(null);
    form.reset(defaultValues);
    createDialog?.close();
  }

  function onSubmit(values: SupplierPaymentInput) {
    startTransition(async () => {
      setSubmitError(null);
      const result = await createSupplierPaymentAction(values);

      if (!result.success) {
        setSubmitError(result.message);
        toast.error(result.message);
        return;
      }

      setSubmitError(null);
      toast.success(result.message);
      form.reset(getDefaultValues(options, initialSupplierId));
      router.refresh();
      createDialog?.close();
    });
  }

  if (options.suppliers.length === 0 || options.outstandingPurchases.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          There are no outstanding supplier balances to pay right now.
        </p>
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => createDialog?.close()}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  const totalSupplierCredit = useMemo(
    () => supplierPurchases.reduce((sum, purchase) => sum + purchase.amountDue, 0),
    [supplierPurchases],
  );

  return (
    <form
      className="flex flex-col gap-4 md:gap-5"
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

      {/* Context Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/60 bg-slate-50/50 p-3 dark:border-slate-800/60">
        <div className="flex items-center gap-6">
          <div className="space-y-0.5">
            <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total Payable</Label>
            <p className="text-sm font-black tracking-tight text-amber-600">
              {formatCurrency(totalSupplierCredit)}
            </p>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-0.5">
            <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Payment Date</Label>
            <div className="flex items-center gap-2">
              <Input type="datetime-local" {...form.register("paymentDate")} className="h-7 w-[180px] bg-white dark:bg-slate-950 text-[11px] font-bold border-slate-200 px-2 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100/50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">USD?</span>
            <button
              type="button"
              onClick={() => form.setValue("isUsd", !isUsd, { shouldDirty: true })}
              className={cn(
                "relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                isUsd ? "bg-blue-600" : "bg-slate-200"
              )}
            >
              <span className={cn(
                "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                isUsd ? "translate-x-4" : "translate-x-0"
              )} />
            </button>
          </div>
          {isUsd && (
            <div className="flex items-center gap-2 border-l border-blue-100 pl-3 ml-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Rate</Label>
              <Input 
                type="number" 
                step="0.01" 
                {...form.register("exchangeRate")} 
                className="h-7 w-20 text-xs font-black bg-white border-blue-200" 
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 md:gap-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 md:gap-5">
          {/* Group 1: Details */}
          <Card className="overflow-hidden border-slate-200/60 shadow-sm dark:border-slate-800/60 rounded-xl md:rounded-2xl">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-4 md:px-5 py-2.5 md:py-3">
              <CardTitle className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-500">1. Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-5 space-y-4 md:space-y-5">
              <div className="space-y-1.5 max-w-sm">
                <Label htmlFor="supplierId" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Supplier</Label>
                <Select id="supplierId" {...form.register("supplierId")} className="h-9 font-medium text-[11px] bg-white dark:bg-slate-950">
                  <option value="">Select supplier</option>
                  {options.suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5 max-w-md">
                <Label htmlFor="purchaseId" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Purchase Reference</Label>
                <Select id="purchaseId" {...form.register("purchaseId")} className="h-9 font-medium text-[11px] bg-white dark:bg-slate-950">
                  <option value="">Select purchase</option>
                  {supplierPurchases.map((purchase) => (
                    <option key={purchase.id} value={purchase.id}>
                      {purchase.purchaseNumber} | Due {formatCurrency(purchase.amountDue)}
                      {purchase.trackInUsd && purchase.exchangeRate > 0 && ` ($${(purchase.amountDue / purchase.exchangeRate).toFixed(2)})`}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div className="space-y-1.5 max-w-lg">
                <Label htmlFor="note" className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">Note (Optional)</Label>
                <Textarea id="note" rows={2} placeholder="Add payment details..." {...form.register("note")} className="resize-none text-xs bg-white dark:bg-slate-950" />
              </div>
            </CardContent>
          </Card>

          {/* Group 2: Financials */}
          <Card className="overflow-hidden border-slate-200/60 shadow-sm dark:border-slate-800/60 rounded-xl md:rounded-2xl">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-4 md:px-5 py-2.5 md:py-3">
              <CardTitle className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-500">2. Financials</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-5 space-y-4 md:space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Amount ({isUsd ? "USD" : "ETB"})
                </Label>
                <Controller
                  control={form.control}
                  name="amount"
                  render={({ field: { value, onChange, ref } }) => (
                    <div className="space-y-1">
                      <CurrencyInput
                        id="amount"
                        value={value as any}
                        onValueChange={(values) => onChange(values.floatValue ?? 0)}
                        getInputRef={ref}
                        readOnly={settlementMode === "FULL"}
                        className="h-10 text-base font-black text-blue-600 bg-white dark:bg-slate-950 border-blue-200"
                      />
                      {isUsd && exchangeRate > 0 && Number(value) > 0 && (
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">
                          ≈ ETB {(Number(value) * exchangeRate).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                />
                {isUsd && exchangeRate > 0 && watchedAmount > 0 ? (
                  <div className="mt-1 space-y-1 rounded-lg bg-blue-50/30 p-2 border border-blue-100/30 text-[9px] font-black uppercase tracking-tight">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Cash/Bank deduction:</span>
                      <span className="text-slate-700">{formatCurrency(paymentEtbDeduction)}</span>
                    </div>
                    {selectedPurchase?.trackInUsd ? (
                      <>
                        <div className="flex justify-between items-center text-slate-500">
                          <span>Credit balance impact @ {selectedPurchase.exchangeRate.toLocaleString()}:</span>
                          <span className="text-slate-700">{formatCurrency(balanceImpactEtb)}</span>
                        </div>
                        <div className="h-px bg-blue-100/50 my-1" />
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Forex {exchangeRate > selectedPurchase.exchangeRate ? "Loss" : "Gain"}:</span>
                          <span className={cn("font-bold", exchangeRate > selectedPurchase.exchangeRate ? "text-rose-600" : "text-emerald-600")}>
                            {formatCurrency(Math.abs(paymentEtbDeduction - balanceImpactEtb))}
                          </span>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}
                {selectedPurchaseUsdDue !== null ? (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50/30 p-1.5 rounded-lg border border-indigo-100/30">
                    <span className="shrink-0">USD balance:</span>
                    <span className="text-xs font-black">${selectedPurchaseUsdDue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    <span className="text-[9px] text-slate-400 font-bold ml-auto uppercase tracking-tighter">@ original rate {selectedPurchase?.exchangeRate.toLocaleString()}</span>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="settlementMode" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Mode</Label>
                  <Select id="settlementMode" {...form.register("settlementMode")} className="h-9 font-black text-[10px] bg-white dark:bg-slate-950">
                    <option value="FULL">Full payment</option>
                    <option value="PARTIAL">Partial payment</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="paymentMethod" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Method</Label>
                  <Select id="paymentMethod" {...form.register("paymentMethod")} className="h-9 font-black text-[10px] bg-white dark:bg-slate-950">
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="MIXED">Mixed</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account</Label>
                {paymentMethod !== "MIXED" ? (
                  <Controller
                    control={form.control}
                    name="financeAccountId"
                    render={({ field }) => (
                      <Select 
                        name={field.name}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        className="h-9 font-black text-[10px] bg-white dark:bg-slate-950"
                      >
                        <option value="">Select account</option>
                        {availableAccounts
                          .filter(a => paymentMethod === "CASH" ? a.type === "CASH" : a.type === "BANK")
                          .map((account) => (
                            <option key={account.id} value={account.id}>{formatFinanceAccountLabel(account)}</option>
                          ))}
                      </Select>
                    )}
                  />
                ) : (
                  <div className="flex h-9 items-center justify-between rounded-lg border border-dashed border-blue-200 px-3 text-[10px] font-bold text-blue-600 bg-blue-50/10">
                    Mixed
                    <Button type="button" variant="ghost" size="sm" className="h-5 text-[9px] px-1" onClick={() => appendPayment({ method: "CASH", amount: 0, financeAccountId: "" })}>
                      + Add
                    </Button>
                  </div>
                )}
              </div>

              {paymentMethod === "MIXED" && (
                <div className="space-y-2 rounded-xl bg-slate-50/50 p-3 border border-slate-100 max-h-[150px] overflow-y-auto">
                   {paymentFields.map((field, index) => (
                     <div key={field.id} className="flex gap-2 items-start">
                        <Select {...form.register(`payments.${index}.method`)} className="h-8 text-[10px] flex-1 bg-white">
                          <option value="CASH">Cash</option>
                          <option value="BANK">Bank</option>
                        </Select>
                        <Select {...form.register(`payments.${index}.financeAccountId`)} className="h-8 text-[10px] flex-[2] bg-white">
                          <option value="">Account</option>
                          {options.accounts.filter(a => form.watch(`payments.${index}.method`) === a.type).map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </Select>
                        <Input type="number" step="0.01" {...form.register(`payments.${index}.amount`)} className="h-8 text-[10px] font-bold bg-white" />
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/70" onClick={() => removePayment(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                   ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Footer - Compact & Ergonomic */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl md:rounded-2xl border border-slate-200/60 bg-slate-50/80 p-2.5 md:p-3 dark:bg-slate-900/40">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full sm:w-auto text-center sm:text-left px-2">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Payment</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base md:text-lg font-black tracking-tight text-blue-600">
                  {isUsd ? `$ ${watchedAmount.toLocaleString()}` : formatCurrency(watchedAmount)}
                </span>
                {isUsd && (
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    ≈ {formatCurrency(watchedAmount * exchangeRate)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="hidden sm:flex flex-col border-l border-slate-200 dark:border-slate-800 pl-6">
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Remaining Due</span>
               <span className="text-xs font-black tracking-tight text-slate-500 tabular-nums">
                 {formatCurrency(remainingAfterPayment)}
               </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button type="button" variant="ghost" className="h-9 flex-1 sm:flex-none px-4 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900" onClick={handleCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" className="h-9 flex-1 sm:flex-none px-6 rounded-lg bg-blue-600 text-xs font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98]" disabled={isPending}>
              {isPending ? "PAYING..." : "POST PAYMENT"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}