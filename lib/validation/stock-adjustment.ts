import { z } from "zod";

export const stockAdjustmentSchema = z.object({
  locationId: z.string().min(1, "Select a location."),
  productId: z.string().min(1, "Select an item."),
  quantity: z.coerce
    .number()
    .int("Base quantity must be a whole number.")
    .min(0, "Base quantity cannot be negative."),
  reason: z.string().trim().min(5, "Enter a reason for the stock edit.").max(500, "Reason is too long."),
});

export type StockAdjustmentFormInput = z.input<typeof stockAdjustmentSchema>;
export type StockAdjustmentInput = z.output<typeof stockAdjustmentSchema>;