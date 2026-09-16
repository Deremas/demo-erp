"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteRoleAction } from "@/lib/actions/roles";

type RoleDeleteDialogProps = {
  role: {
    id: string;
    name: string;
    code: string;
    isSystem: boolean;
  } | null;
  open: boolean;
};

export function RoleDeleteDialog({ role, open }: RoleDeleteDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function closeDialog() {
    router.replace("/admin/roles");
    router.refresh();
  }

  function handleDelete() {
    if (!role) {
      return;
    }

    startTransition(async () => {
      const result = await deleteRoleAction({ roleId: role.id });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      closeDialog();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? closeDialog() : null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete role?</AlertDialogTitle>
          <AlertDialogDescription>
            {role
              ? `Are you sure you want to delete the role "${role.name}"? This action cannot be undone. This role can only be deleted if no users are currently assigned to it.`
              : "The selected role could not be found."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending || !role} onClick={handleDelete}>
            {isPending ? "Deleting..." : "Delete role"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}