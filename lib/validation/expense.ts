import { z } from "zod";

export const expensePaymentSchema = z.object({
  method: z.enum(["CASH", "BANK"]),
  financeAccountId: z.string().min(1, "Select a payment account."),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
});

export const expenseSchema = z
  .object({
    locationId: z.string().optional().or(z.literal("")),
    branchId: z.string().optional().or(z.literal("")),
    paymentMethod: z.enum(["CASH", "BANK", "MIXED"]).default("CASH"),
    financeAccountId: z.string().optional().or(z.literal("")),
    payments: z.array(expensePaymentSchema).optional(),
    categoryName: z
      .string()
      .trim()
      .min(2, "Enter an expense category.")
      .max(80, "Expense category is too long."),
    name: z
      .string()
      .trim()
      .min(2, "Enter the expense name.")
      .max(120, "Expense name is too long."),
    amount: z.coerce.number().positive("Amount must be greater than zero."),
    expenseDate: z.string().min(1, "Choose expense date."),
    note: z
      .string()
      .trim()
      .max(300, "Note must be 300 characters or fewer.")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((value, ctx) => {
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
            message: `Split amounts (${totalPaid.toLocaleString()}) must equal the total expense amount (${value.amount.toLocaleString()}).`,
            path: ["payments"],
          });
        }
      }
    }
  });

export type ExpenseFormInput = z.input<typeof expenseSchema>;
export type ExpenseInput = z.output<typeof expenseSchema>;