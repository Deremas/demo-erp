"use client";

import { useRouter } from "next/navigation";
import { DeliveryOrderActionDialog } from "@/components/sales/delivery-order-action-dialog";

interface DeliveryOrderManagerProps {
  order: any;
  status: string | null;
  initialOpen: boolean;
}

export function DeliveryOrderManager({ order, status, initialOpen }: DeliveryOrderManagerProps) {
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      const params = new URLSearchParams(window.location.search);
      params.delete("dispatchId");
      params.delete("status");
      router.push(`?${params.toString()}`);
    }
  };

  return (
    <DeliveryOrderActionDialog
      open={initialOpen}
      onOpenChange={handleOpenChange}
      order={order}
      status={status}
    />
  );
}