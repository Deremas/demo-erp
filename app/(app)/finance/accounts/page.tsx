export const dynamic = "force-dynamic";

import { FinanceAccountDeleteDialog } from "@/components/finance/finance-account-delete-dialog";
import { FinanceAccountEditDialog } from "@/components/finance/finance-account-edit-dialog";
import { getFinanceAccountFormOptions } from "@/lib/form-options";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";
import { prisma } from "@/lib/prisma";
import { LedgerDirection, LedgerEntryType } from "@/generated/prisma/enums";
import { FinanceAccountCards } from "@/components/finance/finance-account-cards";
import { FinanceMovementList } from "@/components/finance/finance-movement-list";
import { PageHeader } from "@/components/app-shell/page-header";
import { TableFilters } from "@/components/tables/table-filters";
import { 
  AccountModalProvider, 
  AccountModalTrigger, 
  AccountCreationModal 
} from "./account-modal-provider";
import { getFinanceAccountRows, getLedgerRows } from "@/lib/page-data-purchases-finance-admin";

type FinanceAccountsPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: FinanceAccountsPageProps) {
  const params = await searchParams;
  const deleteAccountId = getSingleSearchParam(params, "deleteAccountId");
  const editAccountId = getSingleSearchParam(params, "editAccountId");
  const initialDeleteOpen = Boolean(deleteAccountId);
  const initialEditOpen = Boolean(editAccountId);
  const initialCreateOpen = getSingleSearchParam(params, "open") === "1";

  const filters = tableFiltersFromSearchParams(params);
  
  const [
    accountRows, 
    ledgerRows, 
    ledgerConfig, 
    options, 
    deleteAccount, 
    editAccount
  ] = await Promise.all([
    getFinanceAccountRows(filters),
    getLedgerRows(filters),
    getTablePageConfig("financeLedger", filters),
    getFinanceAccountFormOptions(),
    deleteAccountId
      ? prisma.financeAccount.findUnique({
          where: { id: deleteAccountId },
          select: { id: true, code: true, name: true, type: true },
        })
      : null,
    editAccountId
      ? prisma.financeAccount.findUnique({
          where: { id: editAccountId },
          select: {
            id: true,
            type: true,
            name: true,
            bankName: true,
            accountNumber: true,
            ledgerEntries: {
              where: {
                entryType: LedgerEntryType.OPENING_BALANCE,
                referenceType: "FinanceAccount",
              },
              select: {
                amount: true,
                direction: true,
              },
            },
          },
        })
      : null,
  ]);

  return (
    <AccountModalProvider initialOpen={initialCreateOpen}>
      <div className="flex flex-col gap-8 p-6 lg:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <PageHeader 
            title="Finance Accounts" 
            description="Manage your bank and cash accounts and track Birr movements." 
          />
          <AccountModalTrigger />
        </div>

        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Account Overview</h3>
          <FinanceAccountCards accounts={accountRows as any} />
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Birr Movements (In/Out)</h3>
            <TableFilters fields={ledgerConfig.filters || []} />
          </div>
          <FinanceMovementList movements={ledgerRows as any} />
        </section>
      </div>

      <AccountCreationModal options={options} />

      {editAccount && (
        <FinanceAccountEditDialog
          open={initialEditOpen}
          options={options}
          account={{
            id: editAccount.id,
            type: editAccount.type as "CASH" | "BANK",
            name: editAccount.name,
            bankName: editAccount.bankName,
            accountNumber: editAccount.accountNumber,
            openingBalance: editAccount.ledgerEntries.reduce((sum, entry) => {
              const amount = Number(entry.amount ?? 0);
              return entry.direction === LedgerDirection.DEBIT ? sum + amount : sum - amount;
            }, 0),
          }}
        />
      )}

      <FinanceAccountDeleteDialog account={deleteAccount} open={initialDeleteOpen && !!deleteAccount} />
    </AccountModalProvider>
  );
}