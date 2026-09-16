"use client";

import { useRouter } from "next/navigation";

import { DeleteConfirmDialog } from "@/components/tables/delete-confirm-dialog";
import { deleteFinanceAccountAction } from "@/lib/actions/finance-accounts";

type FinanceAccountDeleteDialogProps = {
  account: {
    id: string;
    code: string;
    name: string;
    type: "CASH" | "BANK";
  } | null;
  open: boolean;
};

export function FinanceAccountDeleteDialog({
  account,
  open,
}: FinanceAccountDeleteDialogProps) {
  const router = useRouter();

  function closeDialog() {
    router.replace("/finance/accounts");
    router.refresh();
  }

  return (
    <DeleteConfirmDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDialog();
      }}
      title="Delete account?"
      description={
        account
          ? `${account.name} (${account.code}) will be deleted only if it has no ledger entries.`
          : "The selected account could not be found."
      }
      onConfirm={() =>
        account
          ? deleteFinanceAccountAction(account.id)
          : Promise.resolve({ success: false, message: "Finance account was not found." })
      }
      onSuccess={closeDialog}
    />
  );
}