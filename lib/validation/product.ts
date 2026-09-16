import { z } from "zod";

export const productSchema = z.object({
  sku: z
    .string()
    .trim()
    .max(60, "Item code / SKU must be 60 characters or fewer.")
    .optional()
    .or(z.literal("")),
  name: z
    .string()
    .trim()
    .min(2, "Item name must be at least 2 characters.")
    .max(120, "Item name must be 120 characters or fewer."),
  minimumStockAlert: z.coerce
    .number()
    .int("Low stock alert must be a whole number.")
    .min(0, "Low stock alert must be zero or more."),
  categoryId: z.string().min(1, "Category is required."),
  unitId: z.string().min(1, "Unit is required."),
  buyingPrice: z.coerce.number().min(0, "Buying price must be zero or more.").optional().catch(0),
  sellingPrice: z.coerce.number().min(0, "Selling price must be zero or more.").optional().catch(0),
  unit: z
    .string()
    .trim()
    .max(20, "Unit must be 20 characters or fewer.")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(300, "Description must be 300 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export const productEditorSchema = productSchema.extend({
  id: z.string().optional(),
});

export const productUpdateSchema = productSchema.extend({
  id: z.string().min(1, "Item id is required."),
});

export const productDeleteSchema = z.object({
  id: z.string().min(1, "Item id is required."),
});

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductInput = z.output<typeof productSchema>;
export type ProductEditorFormInput = z.input<typeof productEditorSchema>;
export type ProductEditorInput = z.output<typeof productEditorSchema>;
export type ProductUpdateInput = z.output<typeof productUpdateSchema>;
export type ProductDeleteInput = z.output<typeof productDeleteSchema>;