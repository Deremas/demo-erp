import { z } from "zod";

export const salesReturnItemInputSchema = z.object({
  originalSaleItemId: z.string().min(1, "Select the sold item."),
  quantity: z.coerce.number().int().positive("Return quantity must be greater than zero."),
});

export const salesExchangeItemInputSchema = z.object({
  productId: z.string().min(1, "Select the exchange item."),
  quantity: z.coerce.number().int().positive("Exchange quantity must be greater than zero."),
  unitPrice: z.coerce.number().nonnegative("Unit price must be zero or more."),
  discount: z.coerce.number().nonnegative("Discount must be zero or more.").default(0),
}).superRefine((value, ctx) => {
  if (value.discount > value.unitPrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Discount cannot exceed the unit selling price.",
      path: ["discount"],
    });
  }
});

export const salesReturnSchema = z.object({
  saleId: z.string().min(1, "Sale is required."),
  returnType: z.enum(["FULL_RETURN", "PARTIAL_RETURN", "EXCHANGE"]),
  refundMethod: z.enum(["CASH", "BANK", "CREDIT", "EXCHANGE", "MIXED"]).optional(),
  financeAccountId: z.string().optional().or(z.literal("")),
  reason: z.string().trim().min(3, "Enter a short reason for this return or exchange.").max(500),
  returnItems: z.array(salesReturnItemInputSchema).default([]),
  exchangeItems: z.array(salesExchangeItemInputSchema).default([]),
}).superRefine((value, ctx) => {
  if (value.returnType !== "FULL_RETURN" && value.returnItems.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Choose at least one item to return.",
      path: ["returnItems"],
    });
  }

  if (value.returnType === "EXCHANGE" && value.exchangeItems.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Choose at least one exchange item.",
      path: ["exchangeItems"],
    });
  }
});

export type SalesReturnInput = z.input<typeof salesReturnSchema>;
export type ParsedSalesReturnInput = z.output<typeof salesReturnSchema>;