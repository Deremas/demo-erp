export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/app-shell/page-header";
import { PurchaseForm } from "@/components/forms/purchase-form";
import { getPurchaseFormOptions } from "@/lib/form-options";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";

type NewImportPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function NewImportPage({ searchParams }: NewImportPageProps) {
  const params = await searchParams;
  const initialLocationId = getSingleSearchParam(params, "locationId") || getSingleSearchParam(params, "branchId");
  const initialProductId = getSingleSearchParam(params, "productId");
  const options = await getPurchaseFormOptions();

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden">
      <PageHeader
        eyebrow="Imports"
        title="New Import"
        description="Receive a USD supplier invoice into a warehouse or store. Stock is valued in ETB using the exchange rate. Pay later unless you choose to settle now."
      />
      <PurchaseForm
        variant="import"
        defaultIsUsd
        options={options}
        initialLocationId={initialLocationId ?? undefined}
        initialProductId={initialProductId ?? undefined}
        cancelHref="/imports"
      />
    </div>
  );
}
