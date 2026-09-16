export const dynamic = "force-dynamic";

import type { RowActionConfig, SimpleRow } from "@/lib/table";

import { RoleForm } from "@/components/forms/role-form";
import { RoleDeleteDialog } from "@/components/admin/role-delete-dialog";
import { ModalTablePage } from "@/components/tables/modal-table-page";
import { getTablePageConfig } from "@/lib/page-data";
import { prisma } from "@/lib/prisma";
import { ensureDefaultRolesAndPermissions } from "@/lib/rbac-db";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";

type RolesPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

function createEditRoleHref(roleId: string) {
  const params = new URLSearchParams({
    roleId,
    mode: "edit",
    open: "1",
  });

  return `/admin/roles?${params.toString()}`;
}

function createDeleteRoleHref(roleId: string) {
  const params = new URLSearchParams({
    deleteRoleId: roleId,
    delete: "1",
  });

  return `/admin/roles?${params.toString()}`;
}

export default async function Page({ searchParams }: RolesPageProps) {
  const hasRoleTables = await ensureDefaultRolesAndPermissions();

  const params = await searchParams;
  const initialOpen = getSingleSearchParam(params, "open") === "1";
  const roleId = getSingleSearchParam(params, "roleId");
  const deleteRoleId = getSingleSearchParam(params, "deleteRoleId");
  const isEdit = getSingleSearchParam(params, "mode") === "edit" && Boolean(roleId);
  const initialDeleteOpen = getSingleSearchParam(params, "delete") === "1";

  const [config, selectedRole, deleteRole] = await Promise.all([
    getTablePageConfig("adminRoles"),
    hasRoleTables && isEdit && roleId
      ? prisma.role.findUnique({
          where: { id: roleId },
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            isActive: true,
            isSystem: true,
            permissions: {
              select: {
                permission: { select: { key: true } },
              },
            },
          },
        })
      : null,
    hasRoleTables && initialDeleteOpen && deleteRoleId
      ? prisma.role.findUnique({
          where: { id: deleteRoleId },
          select: {
            id: true,
            name: true,
            code: true,
            isSystem: true,
          },
        })
      : null,
  ]);

  const configWithActions = {
    ...config,
    rows: config.rows.map(
      (row) =>
        ({
          ...row,
          __actions: [
            ...((row.__actions ?? []) as RowActionConfig[]),
            {
              key: "edit",
              label: "Edit",
              href: createEditRoleHref(row.id),
              icon: "edit",
            },
            ...(row.id
              ? [
                  {
                    key: "delete",
                    label: "Delete",
                    href: createDeleteRoleHref(row.id),
                    icon: "trash" as const,
                    variant: "destructive" as const,
                  },
                ]
              : []),
          ],
        }) satisfies SimpleRow,
    ),
  };

  return (
    <>
      <ModalTablePage
        config={configWithActions}
        actionLabel="New role"
        dialogTitle={selectedRole ? "Edit role" : "New role"}
        dialogDescription={
          selectedRole
            ? "Update the role name, status, and permission checklist."
            : "Create a role by selecting exactly the permissions this team needs."
        }
        initialOpen={initialOpen && !initialDeleteOpen}
        maxWidth="max-w-5xl"
      >
        <RoleForm
          intent={selectedRole ? "edit" : "create"}
          {...(selectedRole
            ? {
                initialValues: {
                  id: selectedRole.id,
                  code: selectedRole.code,
                  name: selectedRole.name,
                  description: selectedRole.description ?? "",
                  isActive: selectedRole.isActive,
                  isSystem: selectedRole.isSystem,
                  permissionKeys: selectedRole.permissions.map((row) => row.permission.key as any),
                },
              }
            : {})}
        />
      </ModalTablePage>
      <RoleDeleteDialog role={deleteRole} open={initialDeleteOpen} />
    </>
  );
}