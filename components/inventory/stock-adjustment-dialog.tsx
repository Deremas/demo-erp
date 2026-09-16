"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adjustStockLevelAction } from "@/lib/actions/stock-adjustments";

type StockAdjustmentDialogProps = {
  open: boolean;
  stock:
    | {
        locationId: string;
        locationName: string;
        productId: string;
        productName: string;
        currentQuantity: number;
        unitName: string;
      }
    | null;
};

export function StockAdjustmentDialog({ open, stock }: StockAdjustmentDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(stock?.currentQuantity ?? 0);
  const [reason, setReason] = useState("");

  useEffect(() => {
    setQuantity(stock?.currentQuantity ?? 0);
    setReason("");
  }, [stock?.locationId, stock?.productId, stock?.currentQuantity]);

  function closeDialog() {
    router.push("/inventory/stock");
  }

  function handleSubmit() {
    if (!stock) return;

    startTransition(async () => {
      const result = await adjustStockLevelAction({
        locationId: stock.locationId,
        productId: stock.productId,
        quantity,
        reason,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      closeDialog();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? closeDialog() : null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit stock level</DialogTitle>
          <DialogDescription>
            Admin correction for {stock?.productName ?? "selected item"} at {stock?.locationName ?? "selected location"}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Current stock</Label>
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm font-semibold">
              {stock ? `${stock.currentQuantity} ${stock.unitName}` : "-"}
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="newQuantity">New base quantity</Label>
            <Input
              id="newQuantity"
              type="number"
              min={0}
              step={1}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              disabled={!stock || isPending}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Example: physical count correction after warehouse recount"
              disabled={!stock || isPending}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={closeDialog} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!stock || isPending}>
            Save adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
