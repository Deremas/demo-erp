import type { FinanceAccountOption } from "@/lib/types";

type AccountShape = {
  id: string;
  name: string;
  type: "CASH" | "BANK";
  locationId: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  location?: {
    name: string;
  } | null;
};

export function dedupeCashAccountsPerLocation<T extends { type: "CASH" | "BANK"; locationId: string | null }>(
  accounts: T[],
) {
  const seenCashLocations = new Set<string>();

  return accounts.filter((account) => {
    if (account.type !== "CASH") {
      return true;
    }

    const locationKey = account.locationId ?? "__global_cash__";

    if (seenCashLocations.has(locationKey)) {
      return false;
    }

    seenCashLocations.add(locationKey);
    return true;
  });
}

/** @deprecated Use dedupeCashAccountsPerLocation instead */
export const dedupeCashAccountsPerBranch = dedupeCashAccountsPerLocation;

export function toFinanceAccountOption(account: AccountShape): FinanceAccountOption {
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    locationId: account.locationId,
    locationName: account.location?.name ?? null,
    branchId: account.locationId,
    branchName: account.location?.name ?? null,
    bankName: account.bankName ?? null,
    accountNumber: account.accountNumber ?? null,
  };
}

export function formatFinanceAccountLabel(
  account: {
    type: "CASH" | "BANK";
    name: string;
    locationName?: string | null;
    bankName?: string | null;
    accountNumber?: string | null;
  },
  options: {
    includeLocation?: boolean;
  } = {},
) {
  if (account.type === "CASH") {
    const label = account.name || "Cash";
    return options.includeLocation && account.locationName
      ? `${label} | ${account.locationName}`
      : label;
  }

  const parts = [account.bankName || "Bank", account.name];

  if (account.accountNumber) {
    parts.push(account.accountNumber);
  }

  if (options.includeLocation && account.locationName) {
    parts.push(account.locationName);
  }

  return parts.join(" | ");
}