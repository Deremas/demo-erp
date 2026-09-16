import { prisma } from "@/lib/prisma";
import {
  APP_PERMISSION_DEFINITIONS,
  permissionsByRole,
  type AppPermission,
} from "@/lib/rbac";

let ensuredDefaults = false;
let rolePermissionSchemaMissing = false;
let ensurePromise: Promise<boolean> | null = null;

function roleNameFromCode(code: string) {
  return code
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

export function normalizeRoleCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function isRolePermissionSchemaMissing() {
  return rolePermissionSchemaMissing;
}

function isMissingRolePermissionTableError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2021"
  );
}

async function rolePermissionTablesExist() {
  const rows = await prisma.$queryRaw<{ roles: string | null; permissions: string | null; role_permissions: string | null }[]>`
    SELECT
      to_regclass('public.roles')::text AS roles,
      to_regclass('public.permissions')::text AS permissions,
      to_regclass('public.role_permissions')::text AS role_permissions
  `;
  const row = rows[0];

  return Boolean(row?.roles && row.permissions && row.role_permissions);
}

function uniqueRolePermissions(rows: { roleId: string; permissionId: string }[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.roleId}:${row.permissionId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function seedDefaultRolesAndPermissions() {
  if (!(await rolePermissionTablesExist())) {
    rolePermissionSchemaMissing = true;
    return false;
  }

  const [dbPermissions, dbRoles] = await Promise.all([
    prisma.permission.findMany({ select: { id: true, key: true, label: true, group: true, description: true, sortOrder: true } }),
    prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: { select: { key: true } },
          },
        },
      },
    }),
  ]);

  const permissionKeyToIdMap = new Map(dbPermissions.map((permission) => [permission.key, permission.id]));
  const permissionsToCreate: { key: string; label: string; group: string; description: string; sortOrder: number }[] = [];
  const permissionsToUpdate: { key: string; label: string; group: string; description: string; sortOrder: number }[] = [];

  for (const [index, permission] of APP_PERMISSION_DEFINITIONS.entries()) {
    const existing = dbPermissions.find((row) => row.key === permission.key);
    const expectedSortOrder = index + 1;
    const next = {
      key: permission.key,
      label: permission.label,
      group: permission.group,
      description: permission.description,
      sortOrder: expectedSortOrder,
    };

    if (!existing) {
      permissionsToCreate.push(next);
      continue;
    }

    if (
      existing.label !== next.label ||
      existing.group !== next.group ||
      existing.description !== next.description ||
      existing.sortOrder !== next.sortOrder
    ) {
      permissionsToUpdate.push(next);
    }
  }

  if (permissionsToCreate.length > 0) {
    await prisma.permission.createMany({
      data: permissionsToCreate,
      skipDuplicates: true,
    });
    const created = await prisma.permission.findMany({
      where: { key: { in: permissionsToCreate.map((item) => item.key) } },
      select: { id: true, key: true },
    });
    for (const row of created) {
      permissionKeyToIdMap.set(row.key, row.id);
    }
  }

  if (permissionsToUpdate.length > 0) {
    await Promise.all(
      permissionsToUpdate.map((item) =>
        prisma.permission.update({
          where: { key: item.key },
          data: {
            label: item.label,
            group: item.group,
            description: item.description,
            sortOrder: item.sortOrder,
          },
        }),
      ),
    );
  }

  const rolesToCreate: { code: string; name: string; isSystem: boolean; isActive: boolean }[] = [];
  const rolesToUpdate: { code: string; name: string }[] = [];
  const rolePermissionsToAdd: { roleId: string; permissionId: string }[] = [];

  for (const [code, permissionKeys] of Object.entries(permissionsByRole)) {
    const existingRole = dbRoles.find((role) => role.code === code);
    const expectedName = roleNameFromCode(code);

    if (!existingRole) {
      rolesToCreate.push({
        code,
        name: expectedName,
        isSystem: true,
        isActive: true,
      });
      continue;
    }

    if (existingRole.name !== expectedName || !existingRole.isSystem || !existingRole.isActive) {
      rolesToUpdate.push({ code, name: expectedName });
    }

    const existingAssignedKeys = new Set(existingRole.permissions.map((row) => row.permission.key));
    for (const expectedKey of permissionKeys) {
      if (existingAssignedKeys.has(expectedKey)) continue;
      const permissionId = permissionKeyToIdMap.get(expectedKey);
      if (permissionId) {
        rolePermissionsToAdd.push({ roleId: existingRole.id, permissionId });
      }
    }
  }

  if (rolesToCreate.length > 0) {
    await prisma.role.createMany({
      data: rolesToCreate,
      skipDuplicates: true,
    });
  }

  if (rolesToUpdate.length > 0) {
    await Promise.all(
      rolesToUpdate.map((item) =>
        prisma.role.update({
          where: { code: item.code },
          data: {
            name: item.name,
            isSystem: true,
            isActive: true,
          },
        }),
      ),
    );
  }

  if (rolesToCreate.length > 0 || rolesToUpdate.length > 0) {
    const seededRoles = await prisma.role.findMany({
      where: { code: { in: [...rolesToCreate, ...rolesToUpdate].map((item) => item.code) } },
      select: { id: true, code: true },
    });

    for (const role of seededRoles) {
      const expectedKeys = permissionsByRole[role.code] ?? [];
      for (const key of expectedKeys) {
        const permissionId = permissionKeyToIdMap.get(key);
        if (permissionId) {
          rolePermissionsToAdd.push({ roleId: role.id, permissionId });
        }
      }
    }
  }

  const uniqueAssociations = uniqueRolePermissions(rolePermissionsToAdd);
  if (uniqueAssociations.length > 0) {
    await prisma.rolePermission.createMany({
      data: uniqueAssociations,
      skipDuplicates: true,
    });
  }

  ensuredDefaults = true;
  return true;
}

export async function ensureDefaultRolesAndPermissions() {
  if (ensuredDefaults || rolePermissionSchemaMissing) return !rolePermissionSchemaMissing;

  if (!ensurePromise) {
    ensurePromise = seedDefaultRolesAndPermissions().catch((error) => {
      ensurePromise = null;

      if (isMissingRolePermissionTableError(error)) {
        rolePermissionSchemaMissing = true;
        return false;
      }

      throw error;
    });
  }

  return ensurePromise;
}

export async function getRolePermissionKeys(roleCode: string): Promise<AppPermission[]> {
  const hasRoleTables = await ensureDefaultRolesAndPermissions();

  if (!hasRoleTables) {
    return [...(permissionsByRole[roleCode] ?? [])];
  }

  if (roleCode === "ADMIN") {
    return [...(permissionsByRole.ADMIN ?? [])];
  }

  const role = await prisma.role.findUnique({
    where: { code: roleCode },
    select: {
      permissions: {
        select: {
          permission: {
            select: { key: true },
          },
        },
      },
    },
  });

  if (!role) {
    return [...(permissionsByRole[roleCode] ?? [])];
  }

  return role.permissions
    .map((row) => row.permission.key)
    .filter((key): key is AppPermission =>
      APP_PERMISSION_DEFINITIONS.some((permission) => permission.key === key),
    );
}

export async function getAssignableRoleOptions() {
  const hasRoleTables = await ensureDefaultRolesAndPermissions();

  if (!hasRoleTables) {
    return Object.entries(permissionsByRole).map(([code, permissionKeys]) => ({
      code,
      name: roleNameFromCode(code),
      description: null,
      isSystem: true,
      permissionKeys: [...permissionKeys],
    }));
  }

  const roles = await prisma.role.findMany({
    where: { isActive: true },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    select: {
      code: true,
      name: true,
      description: true,
      isSystem: true,
      permissions: {
        select: {
          permission: { select: { key: true } },
        },
      },
    },
  });

  return roles.map((role) => ({
    code: role.code,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    permissionKeys: role.permissions.map((row) => row.permission.key),
  }));
}
