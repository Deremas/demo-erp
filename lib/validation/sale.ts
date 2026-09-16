import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  unitId: z.string().min(1, "Select unit"),
  quantity: z.coerce.number().positive("Quantity must be greater than zero"),
  unitPrice: z.coerce.number().nonnegative("Price must be zero or more"),
  discount: z.coerce.number().nonnegative("Discount must be zero or more"),
  discountType: z.enum(["PER_QTY", "FIXED", "PERCENTAGE", ""]).optional().or(z.literal("")),
  discountRate: z.coerce.number().nonnegative().optional(),
}).refine((value) => {
  return value.discount <= value.unitPrice * value.quantity;
}, {
  message: "Discount cannot exceed line total",
  path: ["discount"],
});

export const salePaymentSchema = z.object({
  method: z.enum(["CASH", "BANK", "CHEQUE", "CREDIT"]),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  financeAccountId: z.string().optional().or(z.literal("")),
  chequeNumber: z.string().optional(),
  bankName: z.string().optional(),
  chequeDate: z.string().optional(),
  depositableDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

export const saleSchema = z.object({
  id: z.string().optional(),
  locationId: z.string().min(1, "Select the selling shop or store"),
  customerId: z.string().optional().or(z.literal("")),
  paymentMethod: z.enum(["CASH", "BANK", "CHEQUE", "CREDIT", "MIXED", ""]).refine((v) => v !== "", "Select a payment method"),
  financeAccountId: z.string().optional().or(z.literal("")),
  chequeNumber: z.string().optional(),
  bankName: z.string().optional(),
  chequeDate: z.string().optional(),
  depositableDate: z.string().optional(),
  expiryDate: z.string().optional(),
  settlementMode: z.enum(["FULL", "PARTIAL", "UNPAID", ""]).refine((v) => v !== "", "Select a settlement mode"),
  amountPaid: z.coerce.number().nonnegative("Paid amount must be zero or more"),
  payments: z.array(salePaymentSchema).optional(),
  soldAt: z.string().min(1, "Choose sale date"),
  note: z.string().max(500).optional(),
  discountType: z.enum(["FIXED", "PERCENTAGE", ""]).optional().or(z.literal("")),
  discountRate: z.coerce.number().nonnegative().optional(),
  items: z.array(saleItemSchema).min(1, "Add at least one item"),
}).superRefine((value, ctx) => {
  const grossSubtotal = value.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const lineDiscountTotal = value.items.reduce((sum, item) => sum + item.quantity * item.discount, 0);
  const subtotalBeforeGlobalDiscount = grossSubtotal - lineDiscountTotal;
  const globalDiscountTotal =
    value.discountType === "PERCENTAGE" && value.discountRate
      ? subtotalBeforeGlobalDiscount * (value.discountRate / 100)
      : value.discountType === "FIXED" && value.discountRate
        ? value.discountRate
        : 0;
  const netTotal = subtotalBeforeGlobalDiscount - globalDiscountTotal;

  if (["CASH", "BANK"].includes(value.paymentMethod) && !value.financeAccountId?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Select the ${value.paymentMethod.toLowerCase()} account.`,
      path: ["financeAccountId"],
    });
  }

  if (value.paymentMethod === "CHEQUE") {
    if (!value.chequeNumber?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cheque number is required.", path: ["chequeNumber"] });
    if (!value.bankName?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bank name is required.", path: ["bankName"] });
    if (!value.chequeDate?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cheque date is required.", path: ["chequeDate"] });
    if (!value.depositableDate?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Depositable date is required.", path: ["depositableDate"] });
    if (!value.customerId?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Select a customer for cheque sales.", path: ["customerId"] });
  }

  if (value.paymentMethod === "CREDIT" && !value.customerId?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select a customer for credit sales.",
      path: ["customerId"],
    });
  }

  if (value.paymentMethod === "MIXED") {
    if (!value.payments || value.payments.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one payment method for mixed payment.",
        path: ["payments"],
      });
    } else if (value.settlementMode === "FULL") {
      const totalPaid = value.payments.reduce((sum, p) => sum + p.amount, 0);
      if (Math.abs(totalPaid - netTotal) > 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Total payments (${totalPaid.toLocaleString()}) must equal the sale total (${netTotal.toLocaleString()}) for full settlement.`,
          path: ["payments"],
        });
      }
    }

    const chequePaymentCount = (value.payments ?? []).filter((payment) => payment.method === "CHEQUE").length;
    if (chequePaymentCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use one cheque row per sale.",
        path: ["payments"],
      });
    }

    value.payments?.forEach((payment, index) => {
      if (["CASH", "BANK"].includes(payment.method) && !payment.financeAccountId?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Select the ${payment.method.toLowerCase()} account.`,
          path: ["payments", index, "financeAccountId"],
        });
      }

      if (payment.method === "CHEQUE") {
        if (!value.customerId?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Select a customer for cheque sales.",
            path: ["customerId"],
          });
        }
        if (!payment.chequeNumber?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cheque number is required.", path: ["payments", index, "chequeNumber"] });
        if (!payment.bankName?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bank name is required.", path: ["payments", index, "bankName"] });
        if (!payment.chequeDate?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cheque date is required.", path: ["payments", index, "chequeDate"] });
        if (!payment.depositableDate?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Depositable date is required.", path: ["payments", index, "depositableDate"] });
      }
    });
  }

  if (value.settlementMode === "PARTIAL") {
    const totalPaid = value.paymentMethod === "MIXED"
      ? (value.payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0)
      : 0; // In simple modes, the UI handles amountPaid? Wait, SaleSchema doesn't have amountPaid?
      
    // Actually, SaleSchema seems to rely on financeAccountId for full payment in CASH/BANK mode.
  }
});

export type SaleFormInput = z.input<typeof saleSchema>;
export type SaleInput = z.output<typeof saleSchema>;