"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FormFeedback } from "@/components/forms/form-feedback";
import { useCreateDialog } from "@/components/tables/modal-table-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRoleAction, updateRoleAction } from "@/lib/actions/roles";
import { APP_PERMISSION_DEFINITIONS, type AppPermission } from "@/lib/rbac";
import { roleSchema, roleUpdateSchema } from "@/lib/validation/role";

type RoleFormValues = {
  id: string;
  name: string;
  code: string;
  description: string;
  permissionKeys: AppPermission[];
  isActive: boolean;
  isSystem: boolean;
};

type RoleFormProps = {
  intent?: "create" | "edit";
  initialValues?: Partial<RoleFormValues>;
};

const defaultValues: RoleFormValues = {
  id: "",
  name: "",
  code: "",
  description: "",
  permissionKeys: [],
  isActive: true,
  isSystem: false,
};

export function RoleForm({ intent = "create", initialValues }: RoleFormProps) {
  const createDialog = useCreateDialog();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = intent === "edit";
  const values = useMemo<RoleFormValues>(
    () => ({ ...defaultValues, ...(initialValues ?? {}) }),
    [initialValues],
  );
  const resolver = zodResolver(isEdit ? roleUpdateSchema : roleSchema) as unknown as Resolver<RoleFormValues>;
  const form = useForm<RoleFormValues>({
    resolver,
    defaultValues: values,
  });
  const selectedPermissions = form.watch("permissionKeys");
  const permissionGroups = useMemo(
    () =>
      APP_PERMISSION_DEFINITIONS.reduce<Record<string, typeof APP_PERMISSION_DEFINITIONS[number][]>>(
        (groups, permission) => {
          groups[permission.group] = [...(groups[permission.group] ?? []), permission];
          return groups;
        },
        {},
      ),
    [],
  );

  function togglePermission(permission: AppPermission, checked: boolean) {
    const next = checked
      ? [...new Set([...selectedPermissions, permission])]
      : selectedPermissions.filter((item) => item !== permission);

    form.setValue("permissionKeys", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function toggleGroup(permissions: AppPermission[], checked: boolean) {
    const permissionSet = new Set(selectedPermissions);

    for (const permission of permissions) {
      if (checked) {
        permissionSet.add(permission);
      } else {
        permissionSet.delete(permission);
      }
    }

    form.setValue("permissionKeys", [...permissionSet], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function setAllPermissions(checked: boolean) {
    form.setValue(
      "permissionKeys",
      checked ? APP_PERMISSION_DEFINITIONS.map((permission) => permission.key) : [],
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  function handleCancel() {
    form.reset(values);
    createDialog?.close();
  }

  function onSubmit(data: RoleFormValues) {
    startTransition(async () => {
      const result = isEdit
        ? await updateRoleAction({
            id: data.id,
            name: data.name,
            code: data.code,
            description: data.description,
            permissionKeys: data.permissionKeys,
            isActive: data.isActive,
          })
        : await createRoleAction({
            name: data.name,
            code: data.code,
            description: data.description,
            permissionKeys: data.permissionKeys,
          });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      form.reset(values);
      router.refresh();
      createDialog?.close();
    });
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FormFeedback
        errors={form.formState.errors}
        showValidationSummary={form.formState.submitCount > 0}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role-name">Role name</Label>
          <Input id="role-name" placeholder="Store Manager" {...form.register("name")} />
          <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="role-code">Role code</Label>
          <Input
            id="role-code"
            placeholder="STORE_MANAGER"
            disabled={isEdit}
            {...form.register("code")}
          />
          <p className="text-xs text-muted-foreground">
            Leave blank to generate from the role name.
          </p>
          <p className="text-xs text-destructive">{form.formState.errors.code?.message}</p>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="role-description">Description</Label>
          <Textarea
            id="role-description"
            placeholder="What this role is responsible for"
            {...form.register("description")}
          />
          <p className="text-xs text-destructive">{form.formState.errors.description?.message}</p>
        </div>
        {isEdit ? (
          <label className="flex items-center gap-3 rounded-xl border border-border px-3 py-3 md:col-span-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={form.watch("isActive")}
              disabled={values.code === "ADMIN"}
              onChange={(event) =>
                form.setValue("isActive", event.target.checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            <span className="text-sm font-medium">Role is active</span>
          </label>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Label>Permissions</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAllPermissions(true)}
            >
              Select all
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAllPermissions(false)}
            >
              Clear
            </Button>
            <span className="text-xs font-semibold text-muted-foreground">
              {selectedPermissions.length} selected
            </span>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border p-4">
          {Object.entries(permissionGroups).map(([groupName, permissions]) => {
            const keys = permissions.map((permission) => permission.key);
            const allChecked = keys.every((key) => selectedPermissions.includes(key));
            const someChecked = keys.some((key) => selectedPermissions.includes(key));

            return (
              <section key={groupName} className="space-y-3">
                <label className="flex items-center gap-3 border-b border-border/70 pb-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={allChecked}
                    ref={(node) => {
                      if (node) node.indeterminate = someChecked && !allChecked;
                    }}
                    onChange={(event) => toggleGroup(keys, event.target.checked)}
                  />
                  <span className="text-sm font-black uppercase tracking-widest text-slate-600">
                    {groupName}
                  </span>
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {permissions.map((permission) => {
                    const checked = selectedPermissions.includes(permission.key);

                    return (
                      <label
                        key={permission.key}
                        className="flex items-start gap-3 rounded-xl border border-border/70 px-3 py-3"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-border"
                          checked={checked}
                          onChange={(event) =>
                            togglePermission(permission.key, event.target.checked)
                          }
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">{permission.label}</span>
                          <span className="block text-xs text-muted-foreground">
                            {permission.description}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
        <p className="text-xs text-destructive">{form.formState.errors.permissionKeys?.message}</p>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={isPending} onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEdit ? "Save role" : "Create role"}
        </Button>
      </div>
    </form>
  );
}