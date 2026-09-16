export const dynamic = "force-dynamic";

import { CustomerForm } from "@/components/forms/customer-form";
import { ModalTablePage } from "@/components/tables/modal-table-page";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import type { RouteSearchParams } from "@/lib/query-params";

type AgentsPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: AgentsPageProps) {
  const params = await searchParams;
  const filters = tableFiltersFromSearchParams(params);
  const config = await getTablePageConfig("salesAgents", filters);

  return (
    <ModalTablePage
      config={config}
      actionLabel="New agent"
      dialogTitle="New agent"
      dialogDescription="Create an agent account with a credit limit and outstanding balance tracking."
    >
      <CustomerForm
        closeCreateDialogOnSuccess
        submitLabel="Save agent"
        defaultPartyType="AGENT"
      />
    </ModalTablePage>
  );
}
