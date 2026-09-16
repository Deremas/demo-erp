"use client";

import { useRouter } from "next/navigation";
import { ChequeClearDialog } from "./cheque-clear-dialog";
import { ChequeActionDialog } from "./cheque-actions-dialog";

interface ChequeDialogManagerProps {
  clearCheque: any;
  bounceCheque: any;
  cancelCheque: any;
  bankAccounts: any[];
  initialClearOpen: boolean;
  initialBounceOpen: boolean;
  initialCancelOpen: boolean;
}

export function ChequeDialogManager({
  clearCheque,
  bounceCheque,
  cancelCheque,
  bankAccounts,
  initialClearOpen,
  initialBounceOpen,
  initialCancelOpen,
}: ChequeDialogManagerProps) {
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Clear the query params when closing
      const params = new URLSearchParams(window.location.search);
      params.delete("clearChequeId");
      params.delete("bounceChequeId");
      params.delete("cancelChequeId");
      router.push(`?${params.toString()}`);
    }
  };

  return (
    <>
      <ChequeClearDialog
        open={initialClearOpen && !!clearCheque}
        onOpenChange={handleOpenChange}
        cheque={clearCheque}
        bankAccounts={bankAccounts}
      />

      <ChequeActionDialog
        open={initialBounceOpen && !!bounceCheque}
        onOpenChange={handleOpenChange}
        cheque={bounceCheque}
        mode="bounce"
      />

      <ChequeActionDialog
        open={initialCancelOpen && !!cancelCheque}
        onOpenChange={handleOpenChange}
        cheque={cancelCheque}
        mode="cancel"
      />
    </>
  );
}