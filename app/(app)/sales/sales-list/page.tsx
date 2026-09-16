export const dynamic = "force-dynamic";

import { DeliveryOrderDialog } from "@/components/sales/delivery-order-dialog";
import { ModalTablePage } from "@/components/tables/modal-table-page";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";

type SalesListPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: SalesListPageProps) {
  const params = await searchParams;
  const customerId = getSingleSearchParam(params, "customerId");
  const doOpen = getSingleSearchParam(params, "do") === "1";
  const saleId = getSingleSearchParam(params, "saleId");
  const saleNumber = getSingleSearchParam(params, "saleNumber");
  const filters = tableFiltersFromSearchParams(params);

  const config = await getTablePageConfig("salesList", {
    ...filters,
    ...(customerId ? { customerId } : {}),
  });

  return (
    <>
      <ModalTablePage
        config={config}
        actionLabel="New sale"
        dialogTitle="New sale"
        dialogDescription="Open the POS sale screen."
        actionHref="/sales/pos"
        maxWidth="max-w-5xl"
      />

      <DeliveryOrderDialog 
        saleId={saleId || null}
        saleNumber={saleNumber || null}
        open={doOpen}
      />
    </>
  );
}