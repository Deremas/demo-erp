"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FinanceAccountForm } from "@/components/forms/finance-account-form";
import type { FinanceAccountFormOptions } from "@/lib/types";

type ExistingAccount = {
  id: string;
  type: "CASH" | "BANK";
  name: string;
  bankName?: string | null;
  accountNumber?: string | null;
  openingBalance?: number | null;
};

type FinanceAccountEditDialogProps = {
  open: boolean;
  options: FinanceAccountFormOptions;
  account: ExistingAccount;
};

export function FinanceAccountEditDialog({
  open,
  options,
  account,
}: FinanceAccountEditDialogProps) {
  const router = useRouter();

  function closeDialog() {
    router.replace("/finance/accounts");
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDialog();
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit account</DialogTitle>
          <DialogDescription>
            Update the name, bank details, and opening balance for this account.
          </DialogDescription>
        </DialogHeader>
        <FinanceAccountForm options={options} account={account} />
      </DialogContent>
    </Dialog>
  );
}