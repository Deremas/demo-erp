"use client";

import { useRouter } from "next/navigation";

import { DeleteConfirmDialog } from "@/components/tables/delete-confirm-dialog";
import {
  deleteCategoryAction,
  deleteUnitAction,
} from "@/lib/actions/inventory-master";

type MasterDeleteType = "category" | "unit";

type InventoryMasterDeleteDialogProps = {
  id: string;
  name: string;
  type: MasterDeleteType;
  returnTo: string;
};

const deleteConfig = {
  category: {
    title: "Delete category?",
    label: "category",
    blockedReason: "products",
    action: deleteCategoryAction,
  },
  unit: {
    title: "Delete unit?",
    label: "unit",
    blockedReason: "items or stock movement history",
    action: deleteUnitAction,
  },
} satisfies Record<
  MasterDeleteType,
  {
    title: string;
    label: string;
    blockedReason: string;
    action: (id: string) => Promise<{ success: boolean; message: string }>;
  }
>;

export function InventoryMasterDeleteDialog({
  id,
  name,
  type,
  returnTo,
}: InventoryMasterDeleteDialogProps) {
  const router = useRouter();
  const config = deleteConfig[type];

  function closeDialog() {
    router.replace(returnTo as any);
    router.refresh();
  }

  return (
    <DeleteConfirmDialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          closeDialog();
        }
      }}
      title={config.title}
      description={`Are you sure you want to delete "${name}"? This only works if the ${config.label} is not used by ${config.blockedReason}.`}
      onConfirm={() => config.action(id)}
      onSuccess={closeDialog}
    />
  );
}