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
import { updateDeliveryOrderStatusAction } from "@/lib/actions/delivery-orders";
import { toast } from "sonner";

interface DeliveryOrderActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    orderNumber: string;
  } | null;
  status: string | null;
}

export function DeliveryOrderActionDialog({ open, onOpenChange, order, status }: DeliveryOrderActionDialogProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  if (!order || !status) return null;

  const actionLabel = 
    status === "SENT" ? "Mark as Sent" : 
    status === "DELIVERED" ? "Mark as Delivered" : 
    status === "CANCELLED" ? "Cancel Order" : "Update Status";

  const isDestructive = status === "CANCELLED";

  async function handleAction() {
    if (!order || !status) return;
    setIsPending(true);
    try {
      const result = await updateDeliveryOrderStatusAction(order.id, status as any);
        
      if (result.success) {
        toast.success("Delivery order status updated.");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to update delivery order status.");
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
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900">
            {actionLabel}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500">
            Are you sure you want to change the status of order <strong>{order.orderNumber}</strong> to <strong>{status}</strong>?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isPending}
            className="h-11 rounded-xl border-slate-200 text-slate-600"
          >
            Go Back
          </Button>
          <Button 
            variant={isDestructive ? "destructive" : "default"}
            onClick={handleAction} 
            disabled={isPending}
            className={`h-11 rounded-xl font-bold ${!isDestructive ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" : ""}`}
          >
            {isPending ? "Updating..." : `Confirm ${status}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}