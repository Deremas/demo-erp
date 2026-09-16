"use client";

import { useRouter } from "next/navigation";
import { DeleteConfirmDialog } from "@/components/tables/delete-confirm-dialog";
import { deleteExpenseCategoryAction } from "@/lib/actions/expense-categories";

type ExpenseCategoryDeleteProps = {
  id: string;
  name: string;
};

export function ExpenseCategoryDelete({ id, name }: ExpenseCategoryDeleteProps) {
  const router = useRouter();

  function handleClose() {
    const params = new URLSearchParams(window.location.search);
    params.delete("delete");
    router.push(`?${params.toString()}`);
  }

  return (
    <DeleteConfirmDialog
      open={true}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      title="Delete Category?"
      description={`Are you sure you want to delete "${name}"? This only works if it has no expenses.`}
      onConfirm={() => deleteExpenseCategoryAction({ id })}
      onSuccess={() => {
        handleClose();
        router.refresh();
      }}
    />
  );
}