"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { clearChequeAction } from "@/lib/actions/cheques";
import { toast } from "sonner";

interface ChequeClearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cheque: {
    id: string;
    chequeNumber: string;
    bankName: string;
    amount: number;
  } | null;
  bankAccounts: {
    id: string;
    name: string;
    bankName: string | null;
  }[];
}

export function ChequeClearDialog({ open, onOpenChange, cheque, bankAccounts }: ChequeClearDialogProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [financeAccountId, setFinanceAccountId] = useState<string>("");
  const [clearedDate, setClearedDate] = useState<string>(new Date().toISOString().split("T")[0] || "");

  if (!cheque) return null;

  async function handleClear() {
    if (!financeAccountId) {
      toast.error("Please select a bank account.");
      return;
    }

    if (!cheque) return;
    const chequeId = cheque.id;

    setIsPending(true);
    try {
      const result = await clearChequeAction(chequeId, financeAccountId, new Date(clearedDate));
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">
            Deposit & Settlement
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500">
            Record the final settlement and bank deposit for this cheque.
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 rounded-2xl bg-slate-50 p-6 border border-slate-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cheque No.</p>
              <p className="text-sm font-bold text-slate-900">{cheque.chequeNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issuing Bank</p>
              <p className="text-sm font-bold text-slate-900">{cheque.bankName}</p>
            </div>
            <div className="col-span-2 space-y-1 pt-2 border-t border-slate-200/50">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Settlement Amount</p>
              <p className="text-2xl font-black text-blue-600">
                <span className="text-xs font-bold mr-1">ETB</span>
                {cheque.amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 pb-4">
          <div className="space-y-2">
            <Label htmlFor="bankAccount" className="text-xs font-black uppercase tracking-widest text-slate-500">
              Deposit to Bank Account
            </Label>
            <Select 
              id="bankAccount" 
              value={financeAccountId} 
              onChange={(e) => setFinanceAccountId(e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select destination bank...</option>
              {bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} {account.bankName ? `(${account.bankName})` : ""}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clearedDate" className="text-xs font-black uppercase tracking-widest text-slate-500">
              Settlement Date
            </Label>
            <Input
              id="clearedDate"
              type="date"
              value={clearedDate}
              onChange={(e) => setClearedDate(e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isPending}
            className="h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleClear} 
            disabled={isPending || !financeAccountId}
            className="h-11 rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Processing..." : "Confirm Deposit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}