import { z } from "zod";

import { APP_PERMISSIONS, type AppPermission } from "@/lib/rbac";

const permissionSchema = z.string().refine(
  (value): value is AppPermission => APP_PERMISSIONS.includes(value as AppPermission),
  "Select a valid permission.",
);

const roleBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Role name must be at least 2 characters.")
    .max(80, "Role name must be 80 characters or fewer."),
  code: z
    .string()
    .trim()
    .max(40, "Role code must be 40 characters or fewer.")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(240, "Description must be 240 characters or fewer.")
    .optional()
    .or(z.literal("")),
  permissionKeys: z
    .array(permissionSchema)
    .min(1, "Select at least one permission."),
});

export const roleSchema = roleBaseSchema;

export const roleUpdateSchema = roleBaseSchema.extend({
  id: z.string().trim().min(1, "Role id is required."),
  isActive: z.boolean(),
});

export type RoleInput = z.output<typeof roleSchema>;
export type RoleUpdateInput = z.output<typeof roleUpdateSchema>;