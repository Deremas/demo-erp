"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useCreateDialog } from "@/components/tables/modal-table-page";
import { FormFeedback } from "@/components/forms/form-feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createCashTransferAction } from "@/lib/actions/cash-transfers";
import { formatFinanceAccountLabel } from "@/lib/finance-account-utils";
import type { CashTransferFormOptions } from "@/lib/types";
import { formatCurrency, formatDateForInput } from "@/lib/utils";
import {
  cashTransferSchema,
  type CashTransferFormInput,
  type CashTransferInput,
} from "@/lib/validation/cash-transfer";

type CashTransferFormProps = {
  options: CashTransferFormOptions;
  initialCashAccountId?: string;
};

function getDefaultValues(
  options: CashTransferFormOptions,
  initialCashAccountId?: string,
): CashTransferFormInput {
  const selectedCashAccount = options.cashAccounts.find((account) => account.id === initialCashAccountId);
  const branchId = selectedCashAccount?.branchId ?? "";
  const branchBankAccount = options.bankAccounts.find((account) => account.branchId === branchId);

  return {
    branchId,
    fromAccountId: selectedCashAccount?.id ?? "",
    toAccountId: branchBankAccount?.id ?? "",
    amount: 0,
    transferDate: formatDateForInput(),
    note: "",
  };
}

export function CashTransferForm({
  options,
  initialCashAccountId,
}: CashTransferFormProps) {
  const createDialog = useCreateDialog();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const defaultValues = getDefaultValues(options, initialCashAccountId);

  const form = useForm<CashTransferFormInput, undefined, CashTransferInput>({
    resolver: zodResolver(cashTransferSchema),
    defaultValues,
  });

  const branchId = form.watch("branchId");
  const fromAccountId = form.watch("fromAccountId");

  const cashAccounts = useMemo(
    () =>
      options.cashAccounts.filter(
        (account) => !account.branchId || account.branchId === branchId,
      ),
    [branchId, options.cashAccounts],
  );
  const bankAccounts = useMemo(
    () =>
      options.bankAccounts.filter(
        (account) => !account.branchId || account.branchId === branchId,
      ),
    [branchId, options.bankAccounts],
  );
  const selectedCashAccount =
    cashAccounts.find((account) => account.id === fromAccountId) ?? cashAccounts[0];

  useEffect(() => {
    const newValue = cashAccounts[0]?.id ?? "";
    if (fromAccountId !== newValue && !cashAccounts.some((account) => account.id === fromAccountId)) {
      form.setValue("fromAccountId", newValue, {
        shouldDirty: true,
      });
    }
  }, [cashAccounts, form, fromAccountId]);

  useEffect(() => {
    const toAccountId = form.getValues("toAccountId");

    const newValue = bankAccounts[0]?.id ?? "";
    if (toAccountId !== newValue && !bankAccounts.some((account) => account.id === toAccountId)) {
      form.setValue("toAccountId", newValue, {
        shouldDirty: true,
      });
    }
  }, [bankAccounts, form]);

  useEffect(() => {
    const amount = Number(form.getValues("amount") || 0);
    const maxAmount = selectedCashAccount?.balance ?? 0;

    if (amount > maxAmount) {
      form.setValue("amount", maxAmount, { shouldDirty: true });
    }
  }, [form, selectedCashAccount]);

  function handleCancel() {
    setSubmitError(null);
    form.reset(getDefaultValues(options, initialCashAccountId));
    createDialog?.close();
  }

  function onSubmit(values: CashTransferInput) {
    startTransition(async () => {
      setSubmitError(null);
      const result = await createCashTransferAction(values);

      if (!result.success) {
        setSubmitError(result.message);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      form.reset(getDefaultValues(options, initialCashAccountId));
      router.refresh();
      createDialog?.close();
    });
  }

  if (options.cashAccounts.length === 0 || options.bankAccounts.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Create at least one cash account and one bank account before posting a deposit.
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
      className="min-w-0 space-y-6"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormFeedback
        errors={form.formState.errors}
        submitError={submitError}
        showValidationSummary={form.formState.submitCount > 0}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_480px] 3xl:grid-cols-[1fr_600px] 4xl:grid-cols-[1fr_800px]">
        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border">
            <CardHeader className="border-b border-border/50 bg-muted/20 py-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Location</Label>
                <Select {...form.register("branchId")} className="h-9 text-xs">
                  {options.branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Deposit Date</Label>
                <Input type="datetime-local" {...form.register("transferDate")} className="h-9 text-xs" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-border">
            <CardHeader className="border-b border-border/50 bg-muted/20 py-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Account Settlement
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">From (Cash Account)</Label>
                <Select {...form.register("fromAccountId")} className="h-9 text-xs font-bold">
                  {cashAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {formatFinanceAccountLabel(account)} — {formatCurrency(account.balance)}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">To (Bank Account)</Label>
                <Select {...form.register("toAccountId")} className="h-9 text-xs font-bold">
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {formatFinanceAccountLabel(account)}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-blue-600">Amount to Deposit</Label>
                <Controller
                  control={form.control}
                  name="amount"
                  render={({ field: { value, onChange, ref } }) => (
                    <CurrencyInput
                      value={value as any}
                      onValueChange={(values) => onChange(values.floatValue ?? 0)}
                      getInputRef={ref}
                      className="h-10 text-base font-black text-blue-600"
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Note / Reference</Label>
                <Input {...form.register("note")} placeholder="Optional note..." className="h-10 text-xs" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border">
            <CardHeader className="border-b border-border/50 bg-muted/20 py-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Available Cash
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Balance</p>
                <p className="mt-1 text-2xl font-black tracking-tight text-primary">
                  {formatCurrency(selectedCashAccount?.balance ?? 0)}
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-slate-100 p-3 text-[10px] text-muted-foreground leading-relaxed dark:border-slate-800">
                <p>Depositing cash into a bank account creates two ledger entries:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li><span className="font-bold text-slate-600 dark:text-slate-400">Credit</span> the source cash account.</li>
                  <li><span className="font-bold text-slate-600 dark:text-slate-400">Debit</span> the destination bank account.</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="h-10 rounded-xl font-bold uppercase tracking-wider text-[10px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !form.watch("amount")}
                  className="h-10 rounded-xl font-bold uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20"
                >
                  {isPending ? "Posting..." : "Post Deposit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}