"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createCompanyAction, updateCompanyAction } from "@/lib/actions/inventory-master";
import { companySchema, type CompanyInput } from "@/lib/validation/inventory-master";
import { useCreateDialog } from "@/components/tables/modal-table-page";
import { FormFeedback } from "@/components/forms/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CompanyFormProps = {
  initialValues?: CompanyInput;
  intent?: "create" | "edit";
  onSuccess?: (company: { id: string; name: string }) => void;
  onCancel?: () => void;
  closeCreateDialogOnSuccess?: boolean;
};

export function CompanyForm({
  initialValues,
  intent = "create",
  onSuccess,
  onCancel,
  closeCreateDialogOnSuccess = false,
}: CompanyFormProps) {
  const router = useRouter();
  const createDialog = useCreateDialog();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: initialValues || {
      name: "",
      isActive: true,
    },
  });

  function onSubmit(values: CompanyInput) {
    startTransition(async () => {
      setSubmitError(null);
      const result = intent === "create"
        ? await createCompanyAction(values)
        : await updateCompanyAction(values);

      if (!result.success) {
        setSubmitError(result.message);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
      onSuccess?.({ id: values.id || "", name: values.name });
      if (closeCreateDialogOnSuccess) {
        createDialog?.close();
      }
    });
  }

  return (
    <form
      className="space-y-4"
      onChangeCapture={() => submitError && setSubmitError(null)}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormFeedback
        errors={form.formState.errors}
        submitError={submitError}
        showValidationSummary={form.formState.submitCount > 0}
      />

      <div className="space-y-2">
        <Label htmlFor="company-name">Brand Owner Name</Label>
        <Input id="company-name" placeholder="Diageo, Heineken, Moet Hennessy, etc." {...form.register("name")} />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is-active"
          checked={form.watch("isActive")}
          onChange={(e) => form.setValue("isActive", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[hsl(var(--brand-cyan))] focus:ring-[hsl(var(--brand-cyan))]"
        />
        <Label htmlFor="is-active">Active</Label>
      </div>

      <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              if (closeCreateDialogOnSuccess) createDialog?.close();
              onCancel?.();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : intent === "create" ? "Create Brand Owner" : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}