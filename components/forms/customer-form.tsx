"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createCustomerAction, updateCustomerAction } from "@/lib/actions/customers";
import { customerCreateSchema, type CustomerCreateFormInput } from "@/lib/validation/customer";
import { useCreateDialog } from "@/components/tables/modal-table-page";
import { FormFeedback } from "@/components/forms/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CustomerFormProps = {
  onSuccess?: (customer: { id: string; name: string; businessName?: string | null }) => void;
  onCancel?: () => void;
  submitLabel?: string;
  refreshAfterSuccess?: boolean;
  closeCreateDialogOnSuccess?: boolean;
  defaultPartyType?: "CUSTOMER" | "AGENT";
  initialValues?: CustomerCreateFormInput & { id: string };
};

export function CustomerForm({
  onSuccess,
  onCancel,
  submitLabel = "Save customer",
  refreshAfterSuccess = true,
  closeCreateDialogOnSuccess = false,
  defaultPartyType = "CUSTOMER",
  initialValues,
}: CustomerFormProps) {
  const router = useRouter();
  const createDialog = useCreateDialog();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<CustomerCreateFormInput>({
    resolver: zodResolver(customerCreateSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      businessName: (initialValues as any)?.businessName ?? "",
      tinNumber: (initialValues as any)?.tinNumber ?? "",
      contactPerson: (initialValues as any)?.contactPerson ?? "",
      contactPhone: (initialValues as any)?.contactPhone ?? "",
      phone: initialValues?.phone ?? "",
      address: initialValues?.address ?? "",
      partyType: initialValues?.partyType ?? defaultPartyType,
      creditLimit: initialValues?.creditLimit ?? 0,
    },
  });

  function handleReset() {
    setSubmitError(null);
    form.reset({
      name: initialValues?.name ?? "",
      businessName: (initialValues as any)?.businessName ?? "",
      tinNumber: (initialValues as any)?.tinNumber ?? "",
      contactPerson: (initialValues as any)?.contactPerson ?? "",
      contactPhone: (initialValues as any)?.contactPhone ?? "",
      phone: initialValues?.phone ?? "",
      address: initialValues?.address ?? "",
      partyType: initialValues?.partyType ?? defaultPartyType,
      creditLimit: initialValues?.creditLimit ?? 0,
    });
  }

  function onSubmit(values: CustomerCreateFormInput) {
    startTransition(async () => {
      setSubmitError(null);
      const result = initialValues?.id
        ? await updateCustomerAction(initialValues.id, values)
        : await createCustomerAction(values);

      if (!result.success || !result.customer) {
        setSubmitError(result.message);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      handleReset();
      if (refreshAfterSuccess) {
        router.refresh();
      }
      onSuccess?.(result.customer);
      if (closeCreateDialogOnSuccess) {
        createDialog?.close();
      }
    });
  }

  return (
    <form
      className="space-y-4"
      onChangeCapture={() => {
        if (submitError) {
          setSubmitError(null);
        }
      }}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormFeedback
        errors={form.formState.errors}
        submitError={submitError}
        showValidationSummary={form.formState.submitCount > 0}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-name">Customer Name</Label>
          <Input id="customer-name" placeholder="Full name" {...form.register("name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-party-type">Account type</Label>
          <select
            id="customer-party-type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...form.register("partyType")}
          >
            <option value="CUSTOMER">Customer</option>
            <option value="AGENT">Agent</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-business">Business Name</Label>
          <Input id="customer-business" placeholder="Company PLC" {...form.register("businessName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-credit-limit">Credit limit (ETB)</Label>
          <Input
            id="customer-credit-limit"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            {...form.register("creditLimit", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-tin">TIN Number</Label>
          <Input id="customer-tin" placeholder="0012..." {...form.register("tinNumber")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-contact">Contact Person</Label>
          <Input id="customer-contact" placeholder="Main contact name" {...form.register("contactPerson")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-contact-phone">Contact Phone</Label>
          <Input id="customer-contact-phone" placeholder="+251..." {...form.register("contactPhone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-phone">Personal Phone</Label>
          <Input id="customer-phone" placeholder="+251..." {...form.register("phone")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-location">Address</Label>
        <Input
          id="customer-location"
          placeholder="Store, area, or address"
          {...form.register("address")}
        />
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => {
            handleReset();
            if (closeCreateDialogOnSuccess) {
              createDialog?.close();
            }
            onCancel?.();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}