import { z } from "zod";

export const transferItemSchema = z.object({
  productId: z.string().min(1, "Select an item."),
  unitId: z.string().min(1, "Select unit (Case/Bottle)"),
  quantity: z.coerce.number().positive("Quantity must be greater than zero."),
});

export const transferSchema = z
  .object({
    sourceLocationId: z.string().min(1, "Select a source location."),
    destinationLocationId: z.string().min(1, "Select a destination location."),
    transferAt: z.string().min(1, "Choose transfer date."),
    note: z.string().max(500).optional(),
    items: z.array(transferItemSchema).min(1, "Add at least one transfer line."),
  })
  .refine(
    (value) => value.sourceLocationId !== value.destinationLocationId,
    {
      message: "Source and destination locations must be different.",
      path: ["destinationLocationId"],
    },
  );

export type TransferFormInput = z.input<typeof transferSchema>;
export type TransferInput = z.output<typeof transferSchema>;