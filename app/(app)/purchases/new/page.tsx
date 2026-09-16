export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/app-shell/page-header";
import { PurchaseForm } from "@/components/forms/purchase-form";
import { getPurchaseFormOptions, getPurchaseInitialValues } from "@/lib/form-options";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";

type NewPurchasePageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function NewPurchasePage({ searchParams }: NewPurchasePageProps) {
  const params = await searchParams;
  const initialLocationId = getSingleSearchParam(params, "locationId") || getSingleSearchParam(params, "branchId");
  const initialProductId = getSingleSearchParam(params, "productId");
  const purchaseId = getSingleSearchParam(params, "purchaseId");
  const mode = getSingleSearchParam(params, "mode");

  const options = await getPurchaseFormOptions();
  const initialValues = purchaseId ? await getPurchaseInitialValues(purchaseId) : undefined;

  const isEdit = mode === "edit" && !!initialValues;

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden space-y-6">
      <PageHeader
        eyebrow="Purchases"
        title={isEdit ? `Edit Purchase: ${initialValues.purchaseNumber || initialValues.id?.slice(-8).toUpperCase()}` : "New Purchase"}
        description={isEdit ? "Modify purchase record details." : "Capture purchases that increase owned stock. Supplier is optional for fully paid direct purchases, and required for payable tracking."}
      />
      <PurchaseForm
        options={options}
        initialData={initialValues ?? undefined}
        initialLocationId={initialLocationId ?? undefined}
        initialProductId={initialProductId ?? undefined}
        cancelHref="/purchases/list"
      />
    </div>
  );
}