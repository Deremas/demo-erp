export const dynamic = "force-dynamic";

import { PurchaseForm } from "@/components/forms/purchase-form";
import { ModalTablePage } from "@/components/tables/modal-table-page";
import { getPurchaseFormOptions } from "@/lib/form-options";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import type { RouteSearchParams } from "@/lib/query-params";

type ImportsPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: ImportsPageProps) {
  const params = await searchParams;
  const filters = tableFiltersFromSearchParams(params);
  const [config, options] = await Promise.all([
    getTablePageConfig("purchasesImports", filters),
    getPurchaseFormOptions(),
  ]);

  return (
    <ModalTablePage
      config={config}
      actionLabel="New import"
      dialogTitle="New import purchase"
      dialogDescription="Receive an import into a warehouse or store. Use USD tracking for foreign supplier invoices."
      maxWidth="max-w-5xl"
    >
      <PurchaseForm options={options} mode="modal" defaultIsUsd />
    </ModalTablePage>
  );
}
