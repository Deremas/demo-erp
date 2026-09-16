export const dynamic = "force-dynamic";

import { PurchaseForm } from "@/components/forms/purchase-form";
import { ModalTablePage } from "@/components/tables/modal-table-page";
import { getPurchaseFormOptions } from "@/lib/form-options";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";

type PurchasesListPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: PurchasesListPageProps) {
  const params = await searchParams;
  const supplierId = getSingleSearchParam(params, "supplierId");
  const filters = tableFiltersFromSearchParams(params);
  const initialLocationId = getSingleSearchParam(params, "locationId") || getSingleSearchParam(params, "branchId");
  const initialProductId = getSingleSearchParam(params, "productId");
  const initialOpen = getSingleSearchParam(params, "open") === "1";

  const [config, options] = await Promise.all([
    getTablePageConfig("purchasesList", {
      ...filters,
      ...(supplierId ? { supplierId } : {}),
    }),
    getPurchaseFormOptions(),
  ]);

  return (
      <ModalTablePage
      config={config}
      actionLabel="New purchase"
      dialogTitle="New purchase"
      dialogDescription="Capture a purchase without leaving the list. Supplier is optional for fully paid direct purchases."
      initialOpen={initialOpen}
      maxWidth="max-w-5xl"
    >
      <PurchaseForm
        options={options}
        mode="modal"
        initialLocationId={initialLocationId ?? undefined}
        initialProductId={initialProductId ?? undefined}
      />
    </ModalTablePage>
  );
}