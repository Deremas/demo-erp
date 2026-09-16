"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createDeliveryOrderAction } from "@/lib/actions/delivery-orders";
import type { Route } from "next";

const formSchema = z.object({
  deliveryPerson: z.string().min(2, "Name is required"),
  deliveryAddress: z.string().min(5, "Address is required"),
  phone: z.string().min(9, "Valid phone is required"),
  deliveryDate: z.string().min(1, "A delivery date is required."),
  notes: z.string().optional(),
});

interface DeliveryOrderDialogProps {
  saleId: string | null | undefined;
  saleNumber: string | null | undefined;
  open: boolean;
}

export function DeliveryOrderDialog({
  saleId,
  saleNumber,
  open,
}: DeliveryOrderDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = React.useState(false);

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("do");
      params.delete("saleId");
      params.delete("saleNumber");
      const query = params.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as Route);
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deliveryPerson: "",
      deliveryAddress: "",
      phone: "",
      deliveryDate: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!saleId) return;
    
    setIsPending(true);
    try {
      const { notes, ...rest } = values;
      const result = await createDeliveryOrderAction(saleId, {
        ...rest,
        deliveryDate: new Date(values.deliveryDate),
        ...(notes ? { notes } : {}),
      });
      if (result.success) {
        toast.success("Delivery order created successfully");
        handleOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create delivery order");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Create Delivery Order</DialogTitle>
            <DialogDescription>
              Dispatch details for Sale #{saleNumber}. This record tracks delivery status without affecting inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Delivery Person / Driver</label>
              <Input placeholder="John Doe" {...form.register("deliveryPerson")} />
              {form.formState.errors.deliveryPerson && <p className="text-sm text-destructive">{form.formState.errors.deliveryPerson.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Phone Number</label>
                <Input placeholder="+251..." {...form.register("phone")} />
                {form.formState.errors.phone && <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Delivery Date</label>
                <Input type="date" {...form.register("deliveryDate")} />
                {form.formState.errors.deliveryDate && <p className="text-sm text-destructive">{form.formState.errors.deliveryDate.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Delivery Address</label>
              <Input placeholder="123 Street, City" {...form.register("deliveryAddress")} />
              {form.formState.errors.deliveryAddress && <p className="text-sm text-destructive">{form.formState.errors.deliveryAddress.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Notes (Optional)</label>
              <Textarea
                placeholder="Gate code, landmark, etc."
                className="resize-none"
                {...form.register("notes")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}