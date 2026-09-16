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
import { Textarea } from "@/components/ui/textarea";
import { bounceChequeAction, cancelChequeAction } from "@/lib/actions/cheques";
import { toast } from "sonner";

interface ChequeActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cheque: {
    id: string;
    chequeNumber: string;
  } | null;
  mode: "bounce" | "cancel";
}

export function ChequeActionDialog({ open, onOpenChange, cheque, mode }: ChequeActionDialogProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [notes, setNotes] = useState("");

  if (!cheque) return null;

  async function handleAction() {
    if (!cheque) return;
    const chequeId = cheque.id;
    setIsPending(true);
    try {
      const result = mode === "bounce" 
        ? await bounceChequeAction(chequeId, notes)
        : await cancelChequeAction(chequeId);
        
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "bounce" ? "Reject Cheque" : "Cancel Cheque"}</DialogTitle>
          <DialogDescription>
            Are you sure you want to {mode === "bounce" ? "reject cheque" : "cancel cheque"}{" "}
            <strong>{cheque.chequeNumber}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {mode === "bounce" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Reason for Rejection</Label>
              <Textarea
                id="notes"
                placeholder="e.g. Insufficient funds, signature mismatch..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            No, Keep it
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleAction} 
            disabled={isPending}
          >
            {isPending ? "Updating..." : mode === "bounce" ? "Confirm Rejection" : "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}