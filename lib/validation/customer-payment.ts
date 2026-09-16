import { z } from "zod";

export const customerPaymentPaymentSchema = z.object({
  method: z.enum(["CASH", "BANK"]),
  financeAccountId: z.string().min(1, "Select a payment account."),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
});

export const customerPaymentSchema = z
  .object({
    customerId: z.string().min(1, "Select a customer."),
    settlementTarget: z.enum(["ALL", "SINGLE"]),
    saleId: z.string().optional().or(z.literal("")),
    paymentMethod: z.enum(["CASH", "BANK", "MIXED"]).default("CASH"),
    financeAccountId: z.string().optional().or(z.literal("")),
    payments: z.array(customerPaymentPaymentSchema).optional(),
    settlementMode: z.enum(["FULL", "PARTIAL"]),
    amount: z.coerce.number().positive("Amount must be greater than zero."),
    paymentDate: z.string().min(1, "Choose payment date."),
    note: z
      .string()
      .trim()
      .max(300, "Note must be 300 characters or fewer.")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    if (value.settlementTarget === "SINGLE" && !value.saleId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a credit sale.",
        path: ["saleId"],
      });
    }

    if (["CASH", "BANK"].includes(value.paymentMethod) && !value.financeAccountId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a payment account.",
        path: ["financeAccountId"],
      });
    }

    if (value.paymentMethod === "MIXED") {
      if (!value.payments || value.payments.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Add at least one payment split.",
          path: ["payments"],
        });
      } else {
        const totalPaid = value.payments.reduce((sum, p) => sum + p.amount, 0);
        if (Math.abs(totalPaid - value.amount) > 0.01) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Split amounts (${totalPaid.toLocaleString()}) must equal the total payment amount (${value.amount.toLocaleString()}).`,
            path: ["payments"],
          });
        }
      }
    }

    if (value.settlementMode === "PARTIAL" && value.amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a partial payment amount.",
        path: ["amount"],
      });
    }
  });

export type CustomerPaymentFormInput = z.input<typeof customerPaymentSchema>;
export type CustomerPaymentInput = z.output<typeof customerPaymentSchema>;