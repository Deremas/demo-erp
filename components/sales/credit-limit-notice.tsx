import { evaluateCreditLimit, salePartyLabel, type SalePartyOption } from "@/lib/credit-limit";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function CreditLimitNotice({
  party,
  additionalDue,
}: {
  party: SalePartyOption | null | undefined;
  additionalDue: number;
}) {
  if (!party || additionalDue <= 0.01) return null;

  const status = evaluateCreditLimit({
    creditLimit: Number(party.creditLimit || 0),
    outstanding: Number(party.creditBalance || 0),
    additionalDue,
  });
  const role = party.partyType === "AGENT" ? "Agent" : "Customer";

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2 text-[11px] font-medium",
        status.allowed
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-destructive/40 bg-destructive/10 text-destructive",
      )}
    >
      <p className="font-bold">
        {role}: {salePartyLabel(party)}
      </p>
      <p className="mt-1">
        Limit {formatCurrency(status.creditLimit)} · Outstanding {formatCurrency(status.outstanding)} · Available{" "}
        {formatCurrency(status.available)} · This sale {formatCurrency(status.additionalDue)}
      </p>
      {status.allowed ? null : (
        <p className="mt-1 font-semibold">
          {status.noLimitSet
            ? "Set a credit limit before posting on credit, or collect this sale in full."
            : "This sale exceeds the remaining credit. Reduce the credit amount or collect more now."}
        </p>
      )}
    </div>
  );
}
