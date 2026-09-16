import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { CurrentUser } from "@/lib/types";

import { auth } from "@/lib/auth/auth";
import { sanitizeReturnToPath } from "@/lib/auth/return-to";
import {
  getUserAssignedLocationOptions,
  resolveActiveLocationId,
  sortLocationsByActive,
} from "@/lib/location-access";
import { hasPermission, type AppPermission, type AppRole } from "@/lib/rbac";
import { getRolePermissionKeys } from "@/lib/rbac-db";
import { getUserLoginLabel } from "@/lib/user-login";

type SessionUser = {
  id: string;
  name: string;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  displayUsername?: string | null;
  displayName?: string | null;
  role?: string | null;
  isActive?: boolean | null;
  defaultLocationId?: string | null | undefined;
};

type SessionRecord = {
  id: string;
  activeLocationId?: string | null;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    return null;
  }

  const user = session.user as SessionUser;
  const currentSession = session.session as SessionRecord | undefined;
  const role = (user.role ?? "SALES") as AppRole;
  const permissions = await getRolePermissionKeys(role);

  let assignedLocations: Awaited<
    ReturnType<typeof getUserAssignedLocationOptions>
  > = [];

  try {
    assignedLocations = await getUserAssignedLocationOptions(
      user.id,
      role,
      hasPermission(role, "location:view-all", permissions),
      hasPermission(role, "location:multi", permissions),
    );
  } catch (error) {
    console.error("Unable to load assigned locations for signed-in user.", {
      userId: user.id,
      error,
    });
  }

  const activeLocationId = resolveActiveLocationId({
    locations: assignedLocations,
    defaultLocationId: user.defaultLocationId,
    sessionActiveLocationId: currentSession?.activeLocationId,
  });

  const locations = sortLocationsByActive(assignedLocations, activeLocationId);

  return {
    id: user.id,
    name: user.displayName ?? user.name,
    username: getUserLoginLabel(user),
    role,
    permissions,
    activeLocationId,
    activeBranchId: activeLocationId,
    locations,
    branches: locations,
  };
});

export async function requireSession() {
  const user = await getCurrentUser();

  if (!user) {
    const requestHeaders = await headers();
    const next = sanitizeReturnToPath(requestHeaders.get("x-return-to"));
    const params = new URLSearchParams({ next });
    redirect(`/login?${params.toString()}`);
  }

  return user;
}

export async function requireRole(roles: AppRole[]) {
  const user = await requireSession();

  if (!roles.includes(user.role)) {
    redirect("/dashboard");
  }

  return user;
}

export async function requirePermission(permission: AppPermission) {
  const user = await requireSession();

  if (!hasPermission(user.role, permission, user.permissions)) {
    redirect("/dashboard");
  }

  return user;
}