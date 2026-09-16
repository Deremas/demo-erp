import { getCurrentUser } from "@/lib/auth/session";
import type { CurrentUser } from "@/lib/types";
import { hasPermission, type AppPermission, type AppRole } from "@/lib/rbac";

export {
  createDocumentNumber,
  getActionErrorMessage,
  normalizeOptionalString,
  parseInputDate,
  toDecimal,
} from "./helpers";

export type ActionResult = {
  success: boolean;
  message: string;
};

export async function getActionActor(
  allowedRoles: AppRole[],
): Promise<CurrentUser | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  if (allowedRoles.includes(user.role)) {
    return user;
  }

  if (allowedRoles.includes("ADMIN") && hasPermission(user.role, "admin:manage", user.permissions)) {
    return user;
  }

  if (allowedRoles.includes("SALES") && hasPermission(user.role, "dashboard:view", user.permissions)) {
    return user;
  }

  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  return user;
}

export async function getActionActorByPermission(
  requiredPermission: AppPermission,
): Promise<CurrentUser | null> {
  const user = await getCurrentUser();

  if (!user || !hasPermission(user.role, requiredPermission, user.permissions)) {
    return null;
  }

  return user;
}