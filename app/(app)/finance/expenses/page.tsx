export const dynamic = "force-dynamic";

import { ExpenseForm } from "@/components/forms/expense-form";
import { ModalTablePage } from "@/components/tables/modal-table-page";
import { getExpenseFormOptions } from "@/lib/form-options";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import type { RouteSearchParams } from "@/lib/query-params";

type ExpensesPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: ExpensesPageProps) {
  const params = await searchParams;
  const [config, options] = await Promise.all([
    getTablePageConfig("financeExpenses", tableFiltersFromSearchParams(params)),
    getExpenseFormOptions(),
  ]);

  return (
    <ModalTablePage
      config={config}
      actionLabel="New expense"
      dialogTitle="New expense"
      dialogDescription="Post an expense and deduct it from the selected location account."
      maxWidth="max-w-4xl"
    >
      <ExpenseForm options={options} />
    </ModalTablePage>
  );
}