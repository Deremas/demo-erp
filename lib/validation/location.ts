import { z } from "zod";

export const locationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Location name must be at least 2 characters.")
    .max(60, "Location name must be 60 characters or fewer."),
  type: z.enum(["STORE", "SHOP", "WAREHOUSE"], {
    message: "Select whether this location is a warehouse, store, or shop.",
  }),
  location: z
    .string()
    .trim()
    .max(120, "Location must be 120 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export const locationUpdateSchema = locationSchema.extend({
  id: z.string().trim().min(1, "Location id is required."),
});

export type LocationFormInput = z.infer<typeof locationSchema>;
export type LocationUpdateFormInput = z.infer<typeof locationUpdateSchema>;