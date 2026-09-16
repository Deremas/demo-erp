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
import { deleteUserAction } from "@/lib/actions/users";

type UserDeleteDialogProps = {
  user: {
    id: string;
    name: string;
    role?: string;
  } | null;
  open: boolean;
};

export function UserDeleteDialog({ user, open }: UserDeleteDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isAdmin = user?.role === "ADMIN";

  function closeDialog() {
    router.replace("/admin/users");
    router.refresh();
  }

  function handleDelete() {
    if (!user) {
      return;
    }

    startTransition(async () => {
      const result = await deleteUserAction({ userId: user.id });

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
          <AlertDialogTitle>{isAdmin ? "Deactivate admin user?" : "Delete user?"}</AlertDialogTitle>
          <AlertDialogDescription>
            {user
              ? isAdmin
                ? `Admin user "${user.name}" cannot be deleted. Confirming will deactivate their account (removing their active sessions and login access), but preserves their profile, locations assignments, and records.`
                : `${user.name} will lose login access, sessions, and location assignments. Their past sales, purchases, expenses, and audit history will stay in the system.`
              : "The selected user could not be found."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending || !user} onClick={handleDelete}>
            {isPending
              ? isAdmin
                ? "Deactivating..."
                : "Deleting..."
              : isAdmin
                ? "Deactivate user"
                : "Delete user"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}