import { z } from "zod";

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  unitId: z.string().min(1, "Select unit"),
  quantity: z.coerce.number().positive("Quantity must be greater than zero"),
  unitCost: z.number().min(0),
  sellingPrice: z.number().min(0),
});

export const purchasePaymentSchema = z.object({
  method: z.enum(["CASH", "BANK"]),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  financeAccountId: z.string().min(1, "Select an account"),
});

export const purchaseSchema = z.object({
  id: z.string().optional(),
  locationId: z.string().min(1, "Select a location"),
  supplierId: z.string().optional().or(z.literal("")),
  // Kept for backend compatibility — UI no longer exposes this field directly
  paymentMethod: z.enum(["CASH", "BANK", "CREDIT", "MIXED", ""]).optional().default("MIXED"),
  paymentAccountId: z.string().optional().or(z.literal("")),
  settlementMode: z.enum(["UNPAID", "FULL", "PARTIAL", ""]).refine((v) => v !== "", "Select a settlement option"),
  amountPaid: z.coerce.number().nonnegative().optional().default(0),
  payments: z.array(purchasePaymentSchema).optional(),
  purchasedAt: z.string().min(1, "Choose purchase date"),
  note: z.string().max(500).optional(),
  isUsd: z.boolean().optional().default(false),
  exchangeRate: z.coerce.number().nonnegative().optional(),
  items: z.array(purchaseItemSchema).min(1, "Add at least one line item"),
}).superRefine((value, ctx) => {
  const subtotal = value.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const seenProductIds = new Set<string>();

  value.items.forEach((item, index) => {
    if (!item.productId) return;
    const itemKey = item.productId;
    if (seenProductIds.has(itemKey)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "This product is already added. Increase its quantity on the existing line instead.",
        path: ["items", index, "productId"],
      });
      return;
    }
    seenProductIds.add(itemKey);
  });

  // Supplier requirement for non-full-settlement
  if (!value.supplierId?.trim() && value.settlementMode !== "FULL") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Choose a supplier for unpaid or partial purchases so the balance can be settled later.",
      path: ["supplierId"],
    });
  }

  // Payments validation for FULL and PARTIAL modes
  if (value.settlementMode !== "UNPAID") {
    const paymentRows = value.payments ?? [];

    if (paymentRows.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one payment method.",
        path: ["payments"],
      });
      return;
    }

    const totalPaid = paymentRows.reduce((sum, p) => sum + p.amount, 0);

    if (value.settlementMode === "FULL" && subtotal > 0 && Math.abs(totalPaid - subtotal) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Total payments (${totalPaid.toLocaleString()}) must equal the purchase total (${subtotal.toLocaleString()}) for full settlement.`,
        path: ["payments"],
      });
    }

    if (value.settlementMode === "PARTIAL") {
      if (totalPaid <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter the amount paid now.",
          path: ["payments"],
        });
      } else if (subtotal > 0 && totalPaid >= subtotal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Partial payment must be less than the purchase total. Use Full Settlement if paying in full.",
          path: ["payments"],
        });
      }
    }
  }

  // USD Exchange Rate Validation
  if (value.isUsd && (!value.exchangeRate || value.exchangeRate <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please provide a valid exchange rate for USD tracking.",
      path: ["exchangeRate"],
    });
  }
});

export type PurchaseFormInput = z.input<typeof purchaseSchema>;
export type PurchaseInput = z.output<typeof purchaseSchema>;