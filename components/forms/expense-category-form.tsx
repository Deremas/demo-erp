"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FormFeedback } from "@/components/forms/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  createExpenseCategoryAction,
  updateExpenseCategoryAction,
} from "@/lib/actions/expense-categories";
import {
  expenseCategorySchema,
  type ExpenseCategoryFormInput,
} from "@/lib/validation/expense-category";

type ExpenseCategoryFormProps = {
  initialData?: (ExpenseCategoryFormInput & { id: string }) | undefined;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ExpenseCategoryForm({
  initialData,
  onSuccess,
  onCancel,
}: ExpenseCategoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!initialData;

  const form = useForm<ExpenseCategoryFormInput>({
    resolver: zodResolver(expenseCategorySchema),
    defaultValues: initialData || {
      name: "",
      isActive: true,
    },
  });

  async function handleSave(data: ExpenseCategoryFormInput) {
    setError(null);

    startTransition(async () => {
      const result = isEditMode
        ? await updateExpenseCategoryAction({ ...data, id: initialData!.id })
        : await createExpenseCategoryAction(data);

      if (result.success) {
        toast.success(result.message);
        onSuccess?.();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSave)}
      className="space-y-5 py-2"
    >
      <FormFeedback
        errors={form.formState.errors}
        submitError={error}
        showValidationSummary={form.formState.submitCount > 0}
      />

      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          placeholder="e.g. Rent, Utilities, Transport"
          {...form.register("name")}
          disabled={isPending}
        />
        {form.formState.errors.name && (
          <p className="text-xs text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="isActive">Status</Label>
        <Select
          id="isActive"
          value={form.watch("isActive") ? "true" : "false"}
          onChange={(e) => form.setValue("isActive", e.target.value === "true")}
          disabled={isPending}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEditMode ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}