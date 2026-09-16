export const dynamic = "force-dynamic";

import { TablePage } from "@/components/tables/table-page";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";
import { prisma } from "@/lib/prisma";
import { ChequeDialogManager } from "@/components/finance/cheque-dialog-manager";

type ChequesPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: ChequesPageProps) {
  const params = await searchParams;
  
  const clearChequeId = getSingleSearchParam(params, "clearChequeId");
  const bounceChequeId = getSingleSearchParam(params, "bounceChequeId");
  const cancelChequeId = getSingleSearchParam(params, "cancelChequeId");
  
  const initialClearOpen = Boolean(clearChequeId);
  const initialBounceOpen = Boolean(bounceChequeId);
  const initialCancelOpen = Boolean(cancelChequeId);

  const [config, bankAccounts, clearCheque, bounceCheque, cancelCheque] = await Promise.all([
    getTablePageConfig("financeCheques", tableFiltersFromSearchParams(params)),
    prisma.financeAccount.findMany({
      where: { type: "BANK", isActive: true },
      select: { id: true, name: true, bankName: true },
    }),
    clearChequeId
      ? prisma.cheque.findUnique({
          where: { id: clearChequeId },
          select: { id: true, chequeNumber: true, bankName: true, amount: true },
        })
      : null,
    bounceChequeId
      ? prisma.cheque.findUnique({
          where: { id: bounceChequeId },
          select: { id: true, chequeNumber: true },
        })
      : null,
    cancelChequeId
      ? prisma.cheque.findUnique({
          where: { id: cancelChequeId },
          select: { id: true, chequeNumber: true },
        })
      : null,
  ]);

  const serializedClearCheque = clearCheque ? {
    ...clearCheque,
    amount: Number(clearCheque.amount)
  } : null;

  return (
    <>
      <TablePage config={config} />

      <ChequeDialogManager
        clearCheque={serializedClearCheque}
        bounceCheque={bounceCheque ? { id: bounceCheque.id, chequeNumber: bounceCheque.chequeNumber } : null}
        cancelCheque={cancelCheque ? { id: cancelCheque.id, chequeNumber: cancelCheque.chequeNumber } : null}
        bankAccounts={bankAccounts.map(a => ({ id: a.id, name: a.name, bankName: a.bankName }))}
        initialClearOpen={initialClearOpen}
        initialBounceOpen={initialBounceOpen}
        initialCancelOpen={initialCancelOpen}
      />
    </>
  );
}