"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FormFeedback } from "@/components/forms/form-feedback";
import { useCreateDialog } from "@/components/tables/modal-table-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createUserAction, updateUserAction } from "@/lib/actions/users";
import type { UserFormOptions } from "@/lib/types";
import {
  userSchema,
  userUpdateSchema,
} from "@/lib/validation/user";

type UserEditorFormValues = {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  password: string;
  role: string;
  locationIds: string[];
  defaultLocationId: string;
};

type UserFormProps = {
  options: UserFormOptions;
  intent?: "create" | "edit";
  initialValues?: Partial<UserEditorFormValues>;
};

const createDefaultValues: UserEditorFormValues = {
  id: "",
  name: "",
  email: "",
  username: "",
  phone: "",
  password: "",
  role: "",
  locationIds: [],
  defaultLocationId: "",
};

export function UserForm({
  options,
  intent = "create",
  initialValues,
}: UserFormProps) {
  const createDialog = useCreateDialog();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = intent === "edit";
  const defaultValues = useMemo<UserEditorFormValues>(() => {
    const initialLocationIds = initialValues?.locationIds?.length ? initialValues.locationIds : [];
    const initialDefaultLocationId =
      initialValues?.defaultLocationId && initialLocationIds.includes(initialValues.defaultLocationId)
        ? initialValues.defaultLocationId
        : "";

    return {
      ...createDefaultValues,
      locationIds: initialLocationIds,
      defaultLocationId: initialDefaultLocationId,
      ...(initialValues ?? {}),
    };
  }, [initialValues, options.locations]);

  const resolver = zodResolver(
    isEdit ? userUpdateSchema : userSchema,
  ) as unknown as Resolver<UserEditorFormValues>;

  const form = useForm<UserEditorFormValues>({
    resolver,
    defaultValues,
  });
  const selectedLocationIds = form.watch("locationIds");
  const selectedRoleCode = form.watch("role");
  const selectedRole = options.roles.find((role) => role.code === selectedRoleCode);
  const roleAllowsAllLocations = Boolean(selectedRole?.permissionKeys.includes("location:view-all"));
  const roleAllowsMultipleLocations = Boolean(
    roleAllowsAllLocations || selectedRole?.permissionKeys.includes("location:multi"),
  );
  const availableDefaultLocations = useMemo(
    () => options.locations.filter((location) => selectedLocationIds.includes(location.id)),
    [options.locations, selectedLocationIds],
  );

  useEffect(() => {
    const currentDefaultLocationId = form.getValues("defaultLocationId");

    if (
      availableDefaultLocations.length > 0 &&
      currentDefaultLocationId &&
      !availableDefaultLocations.some((location) => location.id === currentDefaultLocationId)
    ) {
      form.setValue("defaultLocationId", "", {
        shouldDirty: true,
      });
    }

    if (availableDefaultLocations.length === 0 && currentDefaultLocationId) {
      form.setValue("defaultLocationId", "", {
        shouldDirty: true,
      });
    }
  }, [availableDefaultLocations, form]);

  useEffect(() => {
    if (roleAllowsMultipleLocations || selectedLocationIds.length <= 1) {
      return;
    }

    const preferredLocationId = form.getValues("defaultLocationId") || selectedLocationIds[0] || "";
    const nextLocationIds = preferredLocationId ? [preferredLocationId] : [];

    form.setValue("locationIds", nextLocationIds, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("defaultLocationId", preferredLocationId, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [form, roleAllowsMultipleLocations, selectedLocationIds]);

  function handleCancel() {
    setSubmitError(null);
    form.reset(defaultValues);
    createDialog?.close();
  }

  function handleBranchToggle(locationId: string, checked: boolean) {
    const nextLocationIds = checked
      ? roleAllowsMultipleLocations
        ? [...selectedLocationIds, locationId]
        : [locationId]
      : selectedLocationIds.filter((value) => value !== locationId);

    form.setValue("locationIds", nextLocationIds, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (checked && !roleAllowsMultipleLocations) {
      form.setValue("defaultLocationId", locationId, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  function onSubmit(values: UserEditorFormValues) {
    startTransition(async () => {
      setSubmitError(null);
      const result = isEdit
        ? await updateUserAction({
            id: values.id,
            name: values.name,
            email: values.email,
            username: values.username,
            phone: values.phone,
            password: values.password,
            role: values.role as any,
            locationIds: values.locationIds,
            defaultLocationId: values.defaultLocationId,
          })
        : await createUserAction({
            name: values.name,
            email: values.email,
            username: values.username,
            phone: values.phone,
            password: values.password,
            role: values.role as any,
            locationIds: values.locationIds,
            defaultLocationId: values.defaultLocationId,
          });

      if (!result.success) {
        setSubmitError(result.message);
        toast.error(result.message);
        return;
      }

      setSubmitError(null);
      toast.success(result.message);
      form.reset(defaultValues);
      router.refresh();
      createDialog?.close();
    });
  }

  if (options.locations.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Create at least one active store or shop before adding users.
        </p>
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => createDialog?.close()}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
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
      <p className="text-sm text-muted-foreground">
        Name is required. Add at least one login ID: email, username, or phone.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="user-role">Role</Label>
          <Select id="user-role" {...form.register("role")}>
            <option value="">Select role</option>
            {options.roles.map((role) => (
              <option key={role.code} value={role.code}>
                {role.name}
              </option>
            ))}
          </Select>
          <p className="text-xs text-destructive">{form.formState.errors.role?.message}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-default-branch">Default location</Label>
          <Select
            id="user-default-branch"
            {...form.register("defaultLocationId")}
            disabled={availableDefaultLocations.length === 0}
          >
            <option value="">Select location</option>
            {availableDefaultLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
          <p className="text-xs text-destructive">
            {form.formState.errors.defaultLocationId?.message}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-name">Name</Label>
          <Input id="user-name" placeholder="Jane Doe" {...form.register("name")} />
          <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-email">Email (optional)</Label>
          <Input
            id="user-email"
            type="email"
            placeholder="jane@example.com"
            {...form.register("email")}
          />
          <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-username">Username (optional)</Label>
          <Input id="user-username" placeholder="jane.doe" {...form.register("username")} />
          <p className="text-xs text-destructive">
            {form.formState.errors.username?.message}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-phone">Phone (optional)</Label>
          <Input id="user-phone" placeholder="+254700000000" {...form.register("phone")} />
          <p className="text-xs text-destructive">{form.formState.errors.phone?.message}</p>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="user-password">
            {isEdit ? "Password (optional)" : "Password"}
          </Label>
          <Input
            id="user-password"
            type="password"
            placeholder={isEdit ? "Leave blank to keep current password" : "Create a password"}
            {...form.register("password")}
          />
          <p className="text-xs text-destructive">
            {form.formState.errors.password?.message}
          </p>
        </div>
        <div className="space-y-3 md:col-span-2">
          <Label>Assigned locations</Label>
          <div className="grid gap-3 rounded-2xl border border-border p-4 sm:grid-cols-2">
            {options.locations.map((branch) => {
              const checked = selectedLocationIds.includes(branch.id);

              return (
                <label
                  key={branch.id}
                  className="flex items-start gap-3 rounded-xl border border-border/70 px-3 py-3"
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-border"
                    checked={checked}
                    onChange={(event) => handleBranchToggle(branch.id, event.target.checked)}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{branch.name}</span>
                  </span>
                </label>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {roleAllowsAllLocations
              ? "This role can view all locations; choose a preferred default location for daily work."
              : roleAllowsMultipleLocations
                ? "This role can switch only between the locations you select here; choose a default for daily work."
                : "This role is limited to one preferred assigned location."}
          </p>
          <p className="text-xs text-destructive">
            {form.formState.errors.locationIds?.message}
          </p>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={isPending} onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEdit ? "Save changes" : "Save user"}
        </Button>
      </div>
    </form>
  );
}