"use client";

import { useRouter } from "next/navigation";

import { DeleteConfirmDialog } from "@/components/tables/delete-confirm-dialog";
import { deleteSupplierAction } from "@/lib/actions/suppliers";

type SupplierDeleteDialogProps = {
  supplier: {
    id: string;
    name: string;
  } | null;
  open: boolean;
};

export function SupplierDeleteDialog({ supplier, open }: SupplierDeleteDialogProps) {
  const router = useRouter();

  function closeDialog() {
    router.replace("/purchases/suppliers");
    router.refresh();
  }

  return (
    <DeleteConfirmDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDialog();
      }}
      title="Delete supplier?"
      description={
        supplier
          ? `${supplier.name} will be deleted only if it has no purchase or payment history.`
          : "The selected supplier could not be found."
      }
      onConfirm={() =>
        supplier
          ? deleteSupplierAction(supplier.id)
          : Promise.resolve({ success: false, message: "Supplier was not found." })
      }
      onSuccess={closeDialog}
    />
  );
}