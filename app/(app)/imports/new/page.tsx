export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { PageHeader } from "@/components/app-shell/page-header";
import { PurchaseForm } from "@/components/forms/purchase-form";
import { getPurchaseFormOptions, getPurchaseInitialValues } from "@/lib/form-options";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";

type NewImportPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function NewImportPage({ searchParams }: NewImportPageProps) {
  const params = await searchParams;
  const initialLocationId = getSingleSearchParam(params, "locationId") || getSingleSearchParam(params, "branchId");
  const initialProductId = getSingleSearchParam(params, "productId");
  const purchaseId = getSingleSearchParam(params, "purchaseId");
  const mode = getSingleSearchParam(params, "mode");

  const options = await getPurchaseFormOptions();
  const initialValues = purchaseId ? await getPurchaseInitialValues(purchaseId) : undefined;
  const isEdit = mode === "edit" && !!initialValues;

  if (isEdit && !initialValues.isUsd) {
    redirect(`/purchases/new?purchaseId=${purchaseId}&mode=edit`);
  }

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden">
      <PageHeader
        eyebrow="Imports"
        title={isEdit ? `Edit Import: ${initialValues.purchaseNumber || initialValues.id?.slice(-8).toUpperCase()}` : "New Import"}
        description={
          isEdit
            ? "Modify the USD import invoice and exchange rate used for ETB stock value."
            : "Receive a USD supplier invoice into a warehouse or store. Stock is valued in ETB using the exchange rate. Pay later unless you choose to settle now."
        }
      />
      <PurchaseForm
        variant="import"
        defaultIsUsd
        options={options}
        initialData={initialValues ?? undefined}
        initialLocationId={initialLocationId ?? undefined}
        initialProductId={initialProductId ?? undefined}
        cancelHref="/imports"
      />
    </div>
  );
}
