import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Category name must be at least 2 characters."),
  isActive: z.boolean().default(true),
});

export type CategoryInput = z.input<typeof categorySchema>;

export const unitSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Unit name is required."),
  isActive: z.boolean().default(true),
});

export type UnitInput = z.input<typeof unitSchema>;