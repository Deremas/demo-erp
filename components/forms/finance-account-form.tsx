"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useCreateDialog } from "@/components/tables/modal-table-page";
import { FormFeedback } from "@/components/forms/form-feedback";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  createFinanceAccountAction,
  updateFinanceAccountAction,
} from "@/lib/actions/finance-accounts";
import type { FinanceAccountFormOptions } from "@/lib/types";
import {
  financeAccountSchema,
  type FinanceAccountFormInput,
  type FinanceAccountInput,
} from "@/lib/validation/finance-account";

type ExistingAccount = {
  id: string;
  type: "CASH" | "BANK";
  name: string;
  bankName?: string | null;
  accountNumber?: string | null;
  openingBalance?: number | null;
};

type FinanceAccountFormProps = {
  options: FinanceAccountFormOptions;
  account?: ExistingAccount;
};

function getDefaultValues(
  options: FinanceAccountFormOptions,
  account?: ExistingAccount,
): FinanceAccountFormInput {
  if (account) {
    return {
      branchId: "",
      type: account.type,
      name: account.name,
      bankName: account.bankName ?? "",
      accountNumber: account.accountNumber ?? "",
      initialBalance: account.openingBalance ?? 0,
    };
  }
  return {
    branchId: "",
    type: "BANK",
    name: "",
    bankName: "",
    accountNumber: "",
    initialBalance: 0,
  };
}

export function FinanceAccountForm({ options, account }: FinanceAccountFormProps) {
  const isEdit = Boolean(account);
  const createDialog = useCreateDialog();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const defaultValues = getDefaultValues(options, account);

  const form = useForm<FinanceAccountFormInput, undefined, FinanceAccountInput>({
    resolver: zodResolver(financeAccountSchema),
    defaultValues,
  });

  const type = form.watch("type");

  useEffect(() => {
    if (type === "CASH" && !isEdit) {
      form.setValue("name", "Cash", { shouldDirty: true, shouldValidate: true });
      form.setValue("bankName", "", { shouldDirty: true });
      form.setValue("accountNumber", "", { shouldDirty: true });
    } else if (type === "BANK" && !isEdit && form.getValues("name") === "Cash") {
      form.setValue("name", "", { shouldDirty: true, shouldValidate: true });
    }
  }, [form, type, isEdit]);

  function handleCancel() {
    setSubmitError(null);
    router.push("/finance/accounts");
    router.refresh();
    createDialog?.close();
  }

  function onSubmit(values: FinanceAccountInput) {
    startTransition(async () => {
      setSubmitError(null);
      const result = isEdit && account
        ? await updateFinanceAccountAction(account.id, values)
        : await createFinanceAccountAction(values);

      if (!result.success) {
        setSubmitError(result.message);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push("/finance/accounts");
      router.refresh();
      createDialog?.close();
    });
  }

  return (
    <form
      className="flex flex-col gap-4"
      onChangeCapture={() => {
        if (submitError) setSubmitError(null);
      }}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="space-y-4">
        <FormFeedback
          errors={form.formState.errors}
          submitError={submitError}
          showValidationSummary={form.formState.submitCount > 0}
        />

        {/* Core Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="finance-account-type" className="text-[11px] font-black uppercase tracking-widest text-slate-400">Account type</Label>
              <Select id="finance-account-type" {...form.register("type")} disabled={isEdit} className="h-11 rounded-xl border-slate-200">
                <option value="">Select type</option>
                <option value="BANK">Bank Account</option>
                <option value="CASH">Cash Account</option>
              </Select>
              {isEdit && (
                <p className="text-[10px] font-medium text-slate-400 pl-1 italic">Type cannot be changed after creation.</p>
              )}
            </div>

            {!isEdit && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm shadow-blue-500/5">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm">
                    <span className="text-[10px] font-black">i</span>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed text-blue-800">
                    Accounts are <span className="font-bold underline decoration-blue-300 underline-offset-2">central for all locations</span>. Create one bank account, then add each additional bank account once. All sales and expenses will post here.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {type === "BANK" ? (
              <div className="space-y-2">
                <Label htmlFor="finance-account-name" className="text-[11px] font-black uppercase tracking-widest text-slate-400">Account / Person Name</Label>
                <Input
                  id="finance-account-name"
                  placeholder="Enter account or person name"
                  className="h-11 rounded-xl border-slate-200"
                  {...form.register("name")}
                />
              </div>
            ) : (
              <input type="hidden" {...form.register("name")} />
            )}

            <div className="space-y-2">
              <Label htmlFor="finance-account-initial-balance" className="text-[11px] font-black uppercase tracking-widest text-slate-400">Opening Balance</Label>
              <Controller
                control={form.control}
                name="initialBalance"
                render={({ field: { value, onChange, ref } }) => (
                  <CurrencyInput
                    id="finance-account-initial-balance"
                    value={value as any}
                    onValueChange={(values) => onChange(values.floatValue ?? 0)}
                    getInputRef={ref}
                    className="h-11 rounded-xl border-slate-200 font-bold text-slate-900"
                  />
                )}
              />
              {isEdit ? (
                <p className="text-xs font-semibold text-slate-500">
                  Admin changes update this account's opening-balance ledger entry.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Bank Details (Conditional) */}
        {type === "BANK" && (
          <div className="rounded-2xl border border-slate-200/60 bg-slate-50/30 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-1 w-8 rounded-full bg-slate-200" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bank Information</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="finance-account-bank-name" className="text-[11px] font-black uppercase tracking-widest text-slate-400">Bank Name</Label>
                <Input
                  id="finance-account-bank-name"
                  placeholder="e.g. Commercial Bank of Ethiopia"
                  className="h-11 rounded-xl border-slate-200 bg-white"
                  {...form.register("bankName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="finance-account-number" className="text-[11px] font-black uppercase tracking-widest text-slate-400">Account Number</Label>
                <Input
                  id="finance-account-number"
                  placeholder="e.g. 1000123456789"
                  className="h-11 rounded-xl border-slate-200 bg-white"
                  {...form.register("accountNumber")}
                />
              </div>
            </div>
          </div>
        )}

        {/* Posting Rule Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
          <p className="text-[11px] font-semibold text-slate-500">
            {isEdit
              ? "Updating this account will reflect across all central reports. Historical ledger entries remain unchanged."
              : "Creating this account will initialize its balance in the central ledger. You can start posting transactions immediately."}
          </p>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="mt-2 flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          className="h-11 rounded-xl px-8 text-[13px] font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          disabled={isPending}
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button 
          className="h-11 rounded-xl bg-[linear-gradient(135deg,hsl(var(--brand-blue)),hsl(var(--brand-cyan)))] px-10 text-[13px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 transition-all hover:opacity-90 active:scale-[0.98]" 
          type="submit" 
          disabled={isPending}
        >
          {isPending ? "..." : isEdit ? "Save Changes" : "Create Account"}
        </Button>
      </div>
    </form>
  );
}