"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { createCustomerPaymentAction } from "@/lib/actions/customer-payments";
import { FormFeedback } from "@/components/forms/form-feedback";
import type { CustomerPaymentFormOptions } from "@/lib/types";
import { formatCurrency, formatCustomerName, formatDateForInput, formatDateTime } from "@/lib/utils";
import {
  customerPaymentSchema,
  type CustomerPaymentFormInput,
  type CustomerPaymentInput,
} from "@/lib/validation/customer-payment";
import { useCreateDialog } from "@/components/tables/modal-table-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatFinanceAccountLabel } from "@/lib/finance-account-utils";

type CustomerPaymentFormProps = {
  options: CustomerPaymentFormOptions;
  initialCustomerId?: string;
  initialSaleId?: string;
  initialSettlementMode?: "FULL" | "PARTIAL";
};

function getDefaultValues(
  options: CustomerPaymentFormOptions,
  initialCustomerId?: string,
  initialSaleId?: string,
  initialSettlementMode: "FULL" | "PARTIAL" = "FULL",
): CustomerPaymentFormInput {
  const defaultCustomer =
    options.customers.find((customer) => customer.id === initialCustomerId) ??
    options.customers[0];
  const customerSales = options.outstandingSales.filter(
    (sale) => sale.customerId === defaultCustomer?.id,
  );
  const defaultSale = customerSales.find(s => s.id === initialSaleId) ?? customerSales[0];

  return {
    customerId: defaultCustomer?.id ?? "",
    saleId: defaultSale?.id ?? "",
    settlementTarget: initialSaleId ? "SINGLE" : (customerSales.length > 1 ? "ALL" : "SINGLE"),
    financeAccountId: "",
    settlementMode: initialSettlementMode,
    paymentMethod: "CASH",
    amount: defaultSale?.amountDue ?? 0,
    paymentDate: formatDateForInput(),
    note: "",
    payments: [],
  };
}

export function CustomerPaymentForm({
  options,
  initialCustomerId,
  initialSaleId,
  initialSettlementMode = "FULL",
}: CustomerPaymentFormProps) {
  const createDialog = useCreateDialog();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const defaultValues = getDefaultValues(
    options,
    initialCustomerId,
    initialSaleId,
    initialSettlementMode,
  );

  const form = useForm<CustomerPaymentFormInput, undefined, CustomerPaymentInput>({
    resolver: zodResolver(customerPaymentSchema),
    defaultValues,
  });

  const customerId = form.watch("customerId");
  const saleId = form.watch("saleId");
  const settlementTarget = form.watch("settlementTarget");
  const settlementMode = form.watch("settlementMode");
  const paymentMethod = form.watch("paymentMethod");

  const customerSales = useMemo(
    () => options.outstandingSales.filter((sale) => sale.customerId === customerId),
    [customerId, options.outstandingSales],
  );

  const selectedSale = customerSales.find((sale) => sale.id === saleId) ?? customerSales[0];
  const targetSales = settlementTarget === "ALL" ? customerSales : selectedSale ? [selectedSale] : [];
  const targetTotal = Number(targetSales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2));
  const targetPaid = Number(targetSales.reduce((sum, sale) => sum + sale.amountPaid, 0).toFixed(2));
  const targetDue = Number(targetSales.reduce((sum, sale) => sum + sale.amountDue, 0).toFixed(2));
  const watchedAmount = Number(form.watch("amount") || 0);
  const remainingAfterPayment = Math.max(0, Number((targetDue - watchedAmount).toFixed(2)));

  const totalCustomerCredit = useMemo(
    () => customerSales.reduce((sum, sale) => sum + sale.amountDue, 0),
    [customerSales],
  );

  const { fields: paymentFields, append: appendPayment, remove: removePayment } = useFieldArray({
    control: form.control,
    name: "payments",
  });

  const availableAccounts = useMemo(
    () =>
      options.accounts.filter(
        (account) =>
          account.branchId
            ? targetSales.some((sale) => sale.branchId === account.branchId)
            : true,
      ),
    [options.accounts, targetSales],
  );

  useEffect(() => {
    if (paymentMethod === "MIXED" && paymentFields.length === 0) {
      appendPayment({ method: "CASH", financeAccountId: "", amount: watchedAmount });
    }
  }, [paymentMethod, paymentFields.length, appendPayment, watchedAmount]);

  useEffect(() => {
    if (settlementTarget === "ALL") {
      form.setValue("amount", targetDue, {
        shouldDirty: true,
      });
    } else if (settlementMode === "FULL") {
      form.setValue("amount", selectedSale?.amountDue ?? 0, {
        shouldDirty: true,
      });
    }
  }, [form, selectedSale, settlementMode, targetDue, settlementTarget]);

  useEffect(() => {
    const financeAccountId = form.getValues("financeAccountId");

    if (!availableAccounts.some((account) => account.id === financeAccountId)) {
      form.setValue("financeAccountId", availableAccounts[0]?.id ?? "", {
        shouldDirty: true,
      });
    }
  }, [availableAccounts, form]);

  useEffect(() => {
    if (settlementMode === "FULL") {
      form.setValue("amount", targetDue, {
        shouldDirty: true,
      });
      return;
    }

    const currentAmount = Number(form.getValues("amount") || 0);
    if (targetDue <= 0) {
      form.setValue("amount", 0, { shouldDirty: true });
    } else if (currentAmount <= 0 || currentAmount > targetDue) {
      form.setValue("amount", targetDue, { shouldDirty: true });
    }
  }, [form, selectedSale, settlementMode, targetDue]);

  function handleCancel() {
    setSubmitError(null);
    form.reset(defaultValues);
    createDialog?.close();
  }

  function onSubmit(values: CustomerPaymentInput) {
    startTransition(async () => {
      setSubmitError(null);
      const result = await createCustomerPaymentAction(values);

      if (!result.success) {
        setSubmitError(result.message);
        toast.error(result.message);
        return;
      }

      setSubmitError(null);
      toast.success(result.message);
      form.reset(
        getDefaultValues(options, initialCustomerId, initialSettlementMode),
      );
      router.refresh();
      createDialog?.close();
    });
  }

  if (options.customers.length === 0 || options.outstandingSales.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          There are no outstanding customer credit balances to settle right now.
        </p>
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1 rounded-xl border border-slate-200/60 bg-slate-50/50 p-2.5 md:p-3 dark:border-slate-800/60">
          <Label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Outstanding</Label>
          <p className="text-sm font-bold tracking-tight text-amber-600">
            {formatCurrency(totalCustomerCredit)}
          </p>
        </div>
        <div className="space-y-1 rounded-xl border border-slate-200/60 bg-slate-50/50 p-2.5 md:p-3 dark:border-slate-800/60">
          <Label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">Settlement Date</Label>
          <Input type="datetime-local" {...form.register("paymentDate")} className="h-6 bg-white dark:bg-slate-950 text-xs font-bold border-slate-200 px-2 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col gap-4 md:gap-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_480px] 3xl:grid-cols-[1fr_600px] 4xl:grid-cols-[1fr_800px] gap-4 md:gap-5">
          {/* Group 1: Details */}
          <Card className="overflow-hidden border-slate-200/60 shadow-sm dark:border-slate-800/60 rounded-xl md:rounded-2xl">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-4 md:px-5 py-2.5 md:py-3">
              <CardTitle className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-500">1. Settlement Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-5 space-y-4 md:space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="customerId" className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer</Label>
                  <Select id="customerId" {...form.register("customerId")} className="h-9 font-medium text-xs bg-white dark:bg-slate-950">
                    <option value="">Select customer</option>
                    {options.customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>{formatCustomerName(customer)}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settlementTarget" className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">Scope</Label>
                  <Select id="settlementTarget" {...form.register("settlementTarget")} className="h-9 font-medium text-xs bg-white dark:bg-slate-950">
                    <option value="ALL">All outstanding</option>
                    <option value="SINGLE">One selected</option>
                  </Select>
                </div>
              </div>

              {settlementTarget === "SINGLE" && (
                <div className="space-y-1.5 rounded-xl bg-slate-50/50 p-3 border border-slate-100 dark:border-slate-800">
                  <Label htmlFor="saleId" className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Credit Sale</Label>
                  <Select id="saleId" {...form.register("saleId")} className="h-9 font-medium text-xs bg-white dark:bg-slate-950">
                    <option value="">Select credit sale</option>
                    {customerSales.map((sale) => (
                      <option key={sale.id} value={sale.id}>
                        {sale.saleNumber} | Due {formatCurrency(sale.amountDue)}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              
              <div className="space-y-1.5">
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
                <Label htmlFor="amount" className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-blue-600">Settlement Amount</Label>
                <Controller
                  control={form.control}
                  name="amount"
                  render={({ field: { value, onChange, ref } }) => (
                    <CurrencyInput
                      id="amount"
                      value={value as any}
                      onValueChange={(values) => onChange(values.floatValue ?? 0)}
                      getInputRef={ref}
                      readOnly={settlementMode === "FULL"}
                      className="h-10 text-base font-bold text-blue-600 bg-white dark:bg-slate-950 border-blue-200"
                    />
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="settlementMode" className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">Settlement Mode</Label>
                  <Select id="settlementMode" {...form.register("settlementMode")} className="h-9 font-bold text-xs bg-white dark:bg-slate-950">
                    <option value="FULL">Full settlement</option>
                    <option value="PARTIAL">Partial settlement</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="paymentMethod" className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment Method</Label>
                  <Select id="paymentMethod" {...form.register("paymentMethod")} className="h-9 font-bold text-xs bg-white dark:bg-slate-950">
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="MIXED">Mixed Payment</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment Account</Label>
                {paymentMethod !== "MIXED" ? (
                  <Select {...form.register("financeAccountId")} className="h-9 font-bold text-xs bg-white dark:bg-slate-950">
                    <option value="">Select account</option>
                    {availableAccounts
                      .filter(a => paymentMethod === "CASH" ? a.type === "CASH" : a.type === "BANK")
                      .map((account) => (
                        <option key={account.id} value={account.id}>{formatFinanceAccountLabel(account)}</option>
                      ))}
                  </Select>
                ) : (
                  <div className="flex h-9 items-center justify-between rounded-lg border border-dashed border-blue-200 px-3 text-[10px] font-bold text-blue-600 bg-blue-50/10">
                    Mixed
                    <Button type="button" variant="ghost" size="sm" className="h-6 text-[9px] px-2" onClick={() => appendPayment({ method: "CASH", amount: 0, financeAccountId: "" })}>
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
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total Settlement</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base md:text-lg font-black tracking-tight text-blue-600">
                  {formatCurrency(watchedAmount)}
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">ETB</span>
              </div>
            </div>
            
            <div className="hidden sm:flex flex-col border-l border-slate-200 dark:border-slate-800 pl-6">
               <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Remaining Due</span>
               <span className="text-xs font-bold tracking-tight text-slate-500">
                 {formatCurrency(remainingAfterPayment)}
               </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button type="button" variant="ghost" className="h-9 flex-1 sm:flex-none px-4 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900" onClick={handleCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" className="h-9 flex-1 sm:flex-none px-6 rounded-lg bg-blue-600 text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98]" disabled={isPending}>
              {isPending ? "SETTLING..." : "SETTLE CREDIT"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}