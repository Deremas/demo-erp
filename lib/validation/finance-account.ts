import { z } from "zod";

export const financeAccountSchema = z
  .object({
    locationId: z.string().optional().or(z.literal("")),
    branchId: z.string().optional().or(z.literal("")),
    type: z.enum(["CASH", "BANK"]),
    name: z
      .string()
      .trim()
      .max(120, "Account or person name is too long.")
      .optional()
      .or(z.literal("")),
    bankName: z
      .string()
      .trim()
      .max(120, "Bank name is too long.")
      .optional()
      .or(z.literal("")),
    accountNumber: z
      .string()
      .trim()
      .max(80, "Account number is too long.")
      .optional()
      .or(z.literal("")),
    initialBalance: z.coerce
      .number()
      .min(0, "Initial balance must be zero or more."),
  })
  .superRefine((value, ctx) => {
    if (value.type === "BANK") {
      if (!value.name?.trim() || value.name.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter the account or person name.",
          path: ["name"],
        });
      }

      if (!value.bankName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter the bank name.",
          path: ["bankName"],
        });
      }

      if (!value.accountNumber?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter the account number.",
          path: ["accountNumber"],
        });
      }
    }
  });

export type FinanceAccountFormInput = z.input<typeof financeAccountSchema>;
export type FinanceAccountInput = z.output<typeof financeAccountSchema>;