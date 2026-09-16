"use client";

import { useRouter } from "next/navigation";

import { DeleteConfirmDialog } from "@/components/tables/delete-confirm-dialog";
import { deleteCustomerAction } from "@/lib/actions/customers";

type CustomerDeleteDialogProps = {
  customer: {
    id: string;
    name: string;
  } | null;
  open: boolean;
};

export function CustomerDeleteDialog({ customer, open }: CustomerDeleteDialogProps) {
  const router = useRouter();

  function closeDialog() {
    router.replace("/sales/customers");
    router.refresh();
  }

  return (
    <DeleteConfirmDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDialog();
      }}
      title="Delete customer?"
      description={
        customer
          ? `${customer.name} will be deleted only if it has no sales or payment history.`
          : "The selected customer could not be found."
      }
      onConfirm={() =>
        customer
          ? deleteCustomerAction(customer.id)
          : Promise.resolve({ success: false, message: "Customer was not found." })
      }
      onSuccess={closeDialog}
    />
  );
}