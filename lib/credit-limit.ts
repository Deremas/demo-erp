import type { Prisma } from "@/generated/prisma/client";

import { formatCurrency, formatCustomerName } from "@/lib/utils";

export type SalePartyOption = {
  id: string;
  name: string;
  businessName?: string | null;
  partyType?: "CUSTOMER" | "AGENT";
  creditLimit?: number;
  creditBalance?: number;
};

export function salePartyLabel(party: {
  name: string;
  businessName?: string | null;
  partyType?: string | null;
}) {
  const name = formatCustomerName(party);
  return party.partyType === "AGENT" ? `Agent · ${name}` : name;
}

export function partyRoleLabel(partyType?: string | null) {
  return partyType === "AGENT" ? "agent" : "customer";
}

export function evaluateCreditLimit(input: {
  creditLimit: number;
  outstanding: number;
  additionalDue: number;
}) {
  const creditLimit = Number(input.creditLimit || 0);
  const outstanding = Math.max(0, Number(input.outstanding || 0));
  const additionalDue = Math.max(0, Number(input.additionalDue || 0));
  const available = Number((creditLimit - outstanding).toFixed(2));
  const projected = Number((outstanding + additionalDue).toFixed(2));
  const allowed = additionalDue <= 0.01 || (creditLimit > 0 && additionalDue <= available + 0.01);

  return {
    creditLimit,
    outstanding,
    additionalDue,
    available: Math.max(0, available),
    projected,
    allowed,
    noLimitSet: creditLimit <= 0,
  };
}

export function assertCreditWithinLimit(input: {
  partyName: string;
  partyType?: string | null;
  creditLimit: number;
  outstanding: number;
  additionalDue: number;
}) {
  const status = evaluateCreditLimit(input);
  if (status.allowed) return status;

  const role = partyRoleLabel(input.partyType);
  const name = input.partyName;

  if (status.noLimitSet) {
    throw new Error(
      `${name} is a credit ${role} with no credit limit. Set a credit limit or collect this sale in full.`,
    );
  }

  throw new Error(
    `${name} exceeds the ${formatCurrency(status.creditLimit)} credit limit. Outstanding ${formatCurrency(status.outstanding)}, available ${formatCurrency(status.available)}. This sale needs ${formatCurrency(status.additionalDue)} on credit.`,
  );
}

export async function loadPartyCredit(
  tx: Prisma.TransactionClient,
  customerId: string,
  excludeSaleId?: string,
) {
  const customer = await tx.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      name: true,
      businessName: true,
      partyType: true,
      creditLimit: true,
    },
  });

  if (!customer) {
    throw new Error("Selected customer or agent was not found.");
  }

  const outstanding = await tx.sale.aggregate({
    where: {
      customerId,
      status: "COMPLETED",
      ...(excludeSaleId ? { id: { not: excludeSaleId } } : {}),
    },
    _sum: { amountDue: true },
  });

  return {
    id: customer.id,
    name: formatCustomerName(customer),
    partyType: customer.partyType === "AGENT" ? "AGENT" : "CUSTOMER",
    creditLimit: Number(customer.creditLimit || 0),
    outstanding: Number(outstanding._sum.amountDue || 0),
  };
}
