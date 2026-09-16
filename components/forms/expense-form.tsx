"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { useCreateDialog } from "@/components/tables/modal-table-page";
import { FormFeedback } from "@/components/forms/form-feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createExpenseCategoryAction } from "@/lib/actions/expense-categories";
import { createExpenseAction } from "@/lib/actions/expenses";
import { formatFinanceAccountLabel } from "@/lib/finance-account-utils";
import type { ExpenseFormOptions } from "@/lib/types";
import { formatCurrency, formatDateForInput } from "@/lib/utils";
import {
  expenseSchema,
  type ExpenseFormInput,
  type ExpenseInput,
} from "@/lib/validation/expense";

type ExpenseFormProps = {
  options: ExpenseFormOptions;
};

function getDefaultValues(options: ExpenseFormOptions): ExpenseFormInput {
  return {
    branchId: "",
    financeAccountId: "",
    categoryName: "",
    name: "",
    amount: 0,
    expenseDate: formatDateForInput(),
    note: "",
  };
}

export function ExpenseForm({ options }: ExpenseFormProps) {
  const createDialog = useCreateDialog();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryNames, setCategoryNames] = useState(options.categoryNames);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const defaultValues = getDefaultValues(options);

  const form = useForm<ExpenseFormInput, undefined, ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues,
  });

  const branchId = form.watch("branchId");
  const availableAccounts = useMemo(
    () =>
      options.accounts.filter(
        (account) => !account.branchId || account.branchId === branchId,
      ),
    [branchId, options.accounts],
  );

  useEffect(() => {
    const financeAccountId = form.getValues("financeAccountId");

    const newValue = availableAccounts[0]?.id ?? "";
    if (financeAccountId !== newValue && !availableAccounts.some((account) => account.id === financeAccountId)) {
      form.setValue("financeAccountId", newValue, {
        shouldDirty: true,
      });
    }
  }, [availableAccounts, form]);

  async function handleQuickAddCategory() {
    if (!newCategoryName.trim()) return;

    startTransition(async () => {
      const result = await createExpenseCategoryAction({
        name: newCategoryName,
        isActive: true,
      });

      if (result.success) {
        toast.success(result.message);
        setCategoryNames((prev) => [...prev, newCategoryName]);
        form.setValue("categoryName", newCategoryName);
        setNewCategoryName("");
        setIsAddingCategory(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleCancel() {
    setSubmitError(null);
    form.reset(defaultValues);
    createDialog?.close();
  }

  function onSubmit(values: ExpenseInput) {
    startTransition(async () => {
      setSubmitError(null);
      const result = await createExpenseAction(values);

      if (!result.success) {
        setSubmitError(result.message);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      form.reset(getDefaultValues(options));
      router.refresh();
      createDialog?.close();
    });
  }

  if (options.branches.length === 0 || options.accounts.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Create a location payment account before recording expenses.
        </p>
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => createDialog?.close()}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  const paymentMethod = form.watch("paymentMethod");
  const watchedAmount = Number(form.watch("amount") || 0);
  const { fields: paymentFields, append: appendPayment, remove: removePayment } = useFieldArray({
    control: form.control,
    name: "payments",
  });

  useEffect(() => {
    if (paymentMethod === "MIXED" && paymentFields.length === 0) {
      appendPayment({ method: "CASH", financeAccountId: "", amount: watchedAmount });
    }
  }, [paymentMethod, paymentFields.length, appendPayment, watchedAmount]);

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

      {/* Top Header Strip - Responsive */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1 rounded-xl border border-slate-200/60 bg-slate-50/50 p-2.5 md:p-3 dark:border-slate-800/60">
          <Label htmlFor="expense-branch" className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">Expense Location</Label>
          <Select id="expense-branch" {...form.register("branchId")} className="h-8 bg-white dark:bg-slate-950 text-xs font-bold border-slate-200">
            <option value="">Select location</option>
            {options.branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-1 rounded-xl border border-slate-200/60 bg-slate-50/50 p-2.5 md:p-3 dark:border-slate-800/60">
          <Label htmlFor="expense-date" className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">Date & Time</Label>
          <Input id="expense-date" type="datetime-local" {...form.register("expenseDate")} className="h-8 bg-white dark:bg-slate-950 text-xs font-bold border-slate-200" />
        </div>
      </div>

      <div className="flex flex-col gap-4 md:gap-5">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_480px] 3xl:grid-cols-[1fr_600px] 4xl:grid-cols-[1fr_800px] gap-4 md:gap-5">
          {/* Group 1: Details */}
          <Card className="overflow-hidden border-slate-200/60 shadow-sm dark:border-slate-800/60 rounded-xl md:rounded-2xl">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-4 md:px-5 py-2.5 md:py-3">
              <CardTitle className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-500">1. Expense Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-5 space-y-4 md:space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="expense-category" className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">Category</Label>
                <div className="flex gap-1.5">
                  <Select id="expense-category" {...form.register("categoryName")} className="h-9 font-medium text-xs bg-white dark:bg-slate-950">
                    <option value="">Select category</option>
                    {categoryNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </Select>
                  <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-lg border-dashed">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px]">
                       <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
                       <div className="py-4"><Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Category Name" autoFocus /></div>
                       <Button onClick={handleQuickAddCategory} disabled={isPending || !newCategoryName.trim()}>Add</Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expense-name" className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">Description</Label>
                <Input id="expense-name" placeholder="e.g., Office Supplies" {...form.register("name")} className="h-9 text-xs font-medium bg-white dark:bg-slate-950" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expense-note" className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">Note (Optional)</Label>
                <Textarea id="expense-note" rows={2} placeholder="Add details..." {...form.register("note")} className="resize-none text-xs bg-white dark:bg-slate-950" />
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
                <Label htmlFor="expense-amount" className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-blue-600">Total Amount</Label>
                <Controller
                  control={form.control}
                  name="amount"
                  render={({ field: { value, onChange, ref } }) => (
                    <CurrencyInput
                      id="expense-amount"
                      value={value as any}
                      onValueChange={(values) => onChange(values.floatValue ?? 0)}
                      getInputRef={ref}
                      className="h-10 text-base font-bold text-blue-600 bg-white dark:bg-slate-950 border-blue-200"
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentMethod" className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment Method</Label>
                <Select id="paymentMethod" {...form.register("paymentMethod")} className="h-9 text-xs font-bold bg-white dark:bg-slate-950">
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="MIXED">Mixed Payment</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment Account</Label>
                {paymentMethod !== "MIXED" ? (
                  <Select {...form.register("financeAccountId")} className="h-9 text-xs font-bold bg-white dark:bg-slate-950">
                    <option value="">Select account</option>
                    {availableAccounts
                      .filter(a => paymentMethod === "CASH" ? a.type === "CASH" : a.type === "BANK")
                      .map((account) => (
                        <option key={account.id} value={account.id}>{formatFinanceAccountLabel(account)}</option>
                      ))}
                  </Select>
                ) : (
                  <div className="flex h-9 items-center justify-between rounded-lg border border-dashed border-blue-200 px-3 text-[10px] font-bold text-blue-600 bg-blue-50/10">
                    Mixed Payment
                    <Button type="button" variant="ghost" size="sm" className="h-6 text-[9px] px-2" onClick={() => appendPayment({ method: "CASH", amount: 0, financeAccountId: "" })}>
                      + Add Method
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
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left px-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total Expense</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base md:text-lg font-black tracking-tight text-blue-600">
                {formatCurrency(watchedAmount)}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">ETB</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button type="button" variant="ghost" className="h-9 flex-1 sm:flex-none px-4 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900" onClick={handleCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" className="h-9 flex-1 sm:flex-none px-6 rounded-lg bg-blue-600 text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98]" disabled={isPending}>
              {isPending ? "POSTING..." : "POST EXPENSE"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}