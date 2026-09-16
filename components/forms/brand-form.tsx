"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createBrandAction, updateBrandAction } from "@/lib/actions/inventory-master";
import { brandSchema, type BrandInput } from "@/lib/validation/inventory-master";
import { useCreateDialog } from "@/components/tables/modal-table-page";
import { FormFeedback } from "@/components/forms/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BrandFormProps = {
  initialValues?: BrandInput;
  intent?: "create" | "edit";
  onSuccess?: (brand: { id: string; name: string }) => void;
  onCancel?: () => void;
  closeCreateDialogOnSuccess?: boolean;
};

export function BrandForm({
  initialValues,
  intent = "create",
  onSuccess,
  onCancel,
  closeCreateDialogOnSuccess = false,
}: BrandFormProps) {
  const router = useRouter();
  const createDialog = useCreateDialog();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const form = useForm<BrandInput>({
    resolver: zodResolver(brandSchema),
    defaultValues: initialValues || {
      name: "",
      isActive: true,
    },
  });

  function onSubmit(values: BrandInput) {
    startTransition(async () => {
      setSubmitError(null);
      const result = intent === "create" 
        ? await createBrandAction(values)
        : await updateBrandAction(values);

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
        <Label htmlFor="brand-name">Brand Name</Label>
        <Input id="brand-name" placeholder="Johnnie Walker, Hennessy, etc." {...form.register("name")} />
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
            {isPending ? "Saving..." : intent === "create" ? "Create Brand" : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}