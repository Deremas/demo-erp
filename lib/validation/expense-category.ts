import { z } from "zod";

export const expenseCategorySchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters.")
    .max(80, "Category name is too long."),
  isActive: z.boolean().default(true),
});

export type ExpenseCategoryFormInput = z.input<typeof expenseCategorySchema>;