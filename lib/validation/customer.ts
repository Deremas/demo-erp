import { z } from "zod";

const optionalTrimmedString = (max: number, message: string) =>
  z.string().trim().max(max, message).optional().or(z.literal(""));

export const customerCreateSchema = z.object({
  name: z.string().trim().min(2, "Enter customer name.").max(120, "Customer name is too long."),
  businessName: optionalTrimmedString(120, "Business name is too long."),
  tinNumber: optionalTrimmedString(40, "TIN number is too long."),
  contactPerson: optionalTrimmedString(120, "Contact person name is too long."),
  contactPhone: optionalTrimmedString(40, "Contact phone is too long."),
  phone: optionalTrimmedString(40, "Phone number is too long."),
  address: optionalTrimmedString(160, "Address is too long."),
  partyType: z.enum(["CUSTOMER", "AGENT"]).default("CUSTOMER"),
  creditLimit: z.coerce.number().min(0, "Credit limit cannot be negative.").default(0),
});

export type CustomerCreateFormInput = z.input<typeof customerCreateSchema>;
export type CustomerCreateInput = z.output<typeof customerCreateSchema>;