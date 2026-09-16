import type { LocationOption } from "@/lib/types";

import { prisma } from "@/lib/prisma";

export async function getUserAssignedLocationOptions(
  userId: string,
  role?: string,
  canViewAllLocations = false,
  canUseMultipleLocations = false,
): Promise<LocationOption[]> {
  if (role === "ADMIN" || canViewAllLocations) {
    return prisma.location.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });
  }

  const rows = await prisma.$queryRaw<
    { id: string; code: string; name: string; isActive: boolean }[]
  >`
    SELECT 
      l.id,
      l.code,
      l.name,
      l."isActive" as "isActive"
    FROM user_branches ub
    JOIN branches l ON ub."locationId" = l.id
    WHERE ub."userId" = ${userId}
    AND ub."isActive" = true
    ORDER BY ub."isDefault" DESC
  `;

  const activeRows = rows.filter((row) => row.isActive);
  const assignedLocations = activeRows
    .map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!canUseMultipleLocations && assignedLocations.length > 1) {
    const preferredRow = activeRows[0];
    return preferredRow
      ? [{ id: preferredRow.id, code: preferredRow.code, name: preferredRow.name }]
      : assignedLocations.slice(0, 1);
  }

  return assignedLocations;
}

export function resolveActiveLocationId(input: {
  locations: LocationOption[];
  defaultLocationId?: string | null | undefined;
  sessionActiveLocationId?: string | null | undefined;
}) {
  const locationIds = new Set(input.locations.map((location) => location.id));

  if (
    input.sessionActiveLocationId &&
    locationIds.has(input.sessionActiveLocationId)
  ) {
    return input.sessionActiveLocationId;
  }

  if (input.defaultLocationId && locationIds.has(input.defaultLocationId)) {
    return input.defaultLocationId;
  }

  return input.locations[0]?.id ?? "";
}

export function sortLocationsByActive(
  locations: LocationOption[],
  activeLocationId: string,
) {
  if (!activeLocationId) {
    return locations;
  }

  return [...locations].sort((left, right) => {
    if (left.id === activeLocationId) {
      return -1;
    }

    if (right.id === activeLocationId) {
      return 1;
    }

    return left.name.localeCompare(right.name);
  });
}