"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/actions/common";
import { getActionActorByPermission, getActionErrorMessage } from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { ensureDefaultRolesAndPermissions, normalizeRoleCode } from "@/lib/rbac-db";
import { createAuditLog } from "@/lib/services/inventory-ledger";
import {
  roleSchema,
  roleUpdateSchema,
  type RoleInput,
  type RoleUpdateInput,
} from "@/lib/validation/role";

function normalizeDescription(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

function codeFromInput(inputCode: string | null | undefined, name: string) {
  const code = normalizeRoleCode(inputCode?.trim() || name);

  if (!code) {
    throw new Error("Role code could not be generated. Use letters or numbers in the role name.");
  }

  return code;
}

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function resolvePermissionIds(tx: TransactionClient, permissionKeys: string[]) {
  const permissions = await tx.permission.findMany({
    where: { key: { in: permissionKeys } },
    select: { id: true, key: true },
  });

  if (permissions.length !== permissionKeys.length) {
    throw new Error("One or more selected permissions are no longer available.");
  }

  return permissions;
}

export async function createRoleAction(input: RoleInput): Promise<ActionResult> {
  const actor = await getActionActorByPermission("roles:create");

  if (!actor) {
    return { success: false, message: "You are not allowed to create roles." };
  }

  await ensureDefaultRolesAndPermissions();
  const parsed = roleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Role details are invalid.",
    };
  }

  const name = parsed.data.name.trim();
  const code = codeFromInput(parsed.data.code, name);
  const description = normalizeDescription(parsed.data.description);
  const permissionKeys = [...new Set(parsed.data.permissionKeys)];

  try {
    const createdRole = await prisma.$transaction(async (tx) => {
      const existing = await tx.role.findFirst({
        where: {
          OR: [
            { code },
            { name: { equals: name, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      });

      if (existing) {
        throw new Error("A role with that name or code already exists.");
      }

      const permissions = await resolvePermissionIds(tx, permissionKeys);
      const role = await tx.role.create({
        data: {
          code,
          name,
          description,
          isSystem: false,
          isActive: true,
          permissions: {
            create: permissions.map((permission) => ({
              permissionId: permission.id,
            })),
          },
        },
        select: { id: true, name: true, code: true },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "ROLE_CREATE",
        entityType: "Role",
        entityId: role.id,
        after: {
          code,
          name,
          description,
          permissionKeys,
          isActive: true,
        },
      });

      return role;
    });

    revalidatePath("/admin/roles");
    revalidatePath("/admin/users");

    return {
      success: true,
      message: `${createdRole.name} role created successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to create the role right now."),
    };
  }
}

export async function updateRoleAction(input: RoleUpdateInput): Promise<ActionResult> {
  const actor = await getActionActorByPermission("roles:edit");

  if (!actor) {
    return { success: false, message: "You are not allowed to update roles." };
  }

  await ensureDefaultRolesAndPermissions();
  const parsed = roleUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Role details are invalid.",
    };
  }

  const name = parsed.data.name.trim();
  const description = normalizeDescription(parsed.data.description);
  const permissionKeys = [...new Set(parsed.data.permissionKeys)];

  try {
    const updatedRole = await prisma.$transaction(async (tx) => {
      const existingRole = await tx.role.findUnique({
        where: { id: parsed.data.id },
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          isSystem: true,
          isActive: true,
          permissions: {
            select: {
              permission: { select: { key: true } },
            },
          },
        },
      });

      if (!existingRole) {
        throw new Error("Selected role was not found.");
      }

      const duplicate = await tx.role.findFirst({
        where: {
          id: { not: existingRole.id },
          name: { equals: name, mode: "insensitive" },
        },
        select: { id: true },
      });

      if (duplicate) {
        throw new Error("Another role already uses that name.");
      }

      const permissions = await resolvePermissionIds(tx, permissionKeys);

      await tx.rolePermission.deleteMany({
        where: { roleId: existingRole.id },
      });

      const role = await tx.role.update({
        where: { id: existingRole.id },
        data: {
          name,
          description,
          isActive: parsed.data.isActive,
          permissions: {
            create: permissions.map((permission) => ({
              permissionId: permission.id,
            })),
          },
        },
        select: { id: true, name: true, code: true },
      });

      if (!parsed.data.isActive) {
        const usersWithRole = await tx.user.count({
          where: { role: existingRole.code, isActive: true },
        });

        if (usersWithRole > 0) {
          throw new Error("Deactivate or move users from this role before disabling it.");
        }
      }

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "ROLE_UPDATE",
        entityType: "Role",
        entityId: role.id,
        before: {
          name: existingRole.name,
          description: existingRole.description,
          isActive: existingRole.isActive,
          permissionKeys: existingRole.permissions.map((row) => row.permission.key),
        },
        after: {
          name,
          description,
          isActive: parsed.data.isActive,
          permissionKeys,
        },
      });

      return role;
    });

    revalidatePath("/admin/roles");
    revalidatePath("/admin/users");

    return {
      success: true,
      message: `${updatedRole.name} role updated successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to update the role right now."),
    };
  }
}

export async function deleteRoleAction(input: { roleId: string }): Promise<ActionResult> {
  const actor = await getActionActorByPermission("roles:delete");

  if (!actor) {
    return { success: false, message: "You are not allowed to delete roles." };
  }

  try {
    const deletedRole = await prisma.$transaction(async (tx) => {
      const existingRole = await tx.role.findUnique({
        where: { id: input.roleId },
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          isSystem: true,
          isActive: true,
        },
      });

      if (!existingRole) {
        throw new Error("Selected role was not found.");
      }

      const usersWithRole = await tx.user.count({
        where: { role: existingRole.code },
      });

      if (usersWithRole > 0) {
        throw new Error("Cannot delete this role because one or more users are currently assigned to it.");
      }

      // Delete associations first
      await tx.rolePermission.deleteMany({
        where: { roleId: existingRole.id },
      });

      // Delete the role
      await tx.role.delete({
        where: { id: existingRole.id },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "ROLE_DELETE",
        entityType: "Role",
        entityId: existingRole.id,
        before: {
          code: existingRole.code,
          name: existingRole.name,
          description: existingRole.description,
          isActive: existingRole.isActive,
        },
      });

      return existingRole;
    });

    revalidatePath("/admin/roles");
    revalidatePath("/admin/users");

    return {
      success: true,
      message: `${deletedRole.name} role deleted successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to delete the role right now."),
    };
  }
}