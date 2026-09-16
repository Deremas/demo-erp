export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/app-shell/page-header";
import { SaleForm } from "@/components/forms/sale-form";
import { getSaleFormOptions, getSaleInitialValues } from "@/lib/form-options";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";

type NewSalePageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function NewSalePage({ searchParams }: NewSalePageProps) {
  const params = await searchParams;
  const initialLocationId = getSingleSearchParam(params, "locationId") || getSingleSearchParam(params, "branchId");
  const initialProductId = getSingleSearchParam(params, "productId");
  const saleId = getSingleSearchParam(params, "saleId");
  const mode = getSingleSearchParam(params, "mode");

  const options = await getSaleFormOptions();
  const initialValues = saleId ? await getSaleInitialValues(saleId) : undefined;
  
  const isEdit = mode === "edit" && !!initialValues;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales"
        title={isEdit ? `Edit Sale: ${initialValues.saleNumber || initialValues.id?.slice(-8).toUpperCase()}` : "New Sale"}
        description={isEdit ? "Modify sale record details." : "Capture retail or wholesale transactions. Choose a customer for credit sales."}
      />
      <SaleForm
        options={options}
        initialData={initialValues ?? undefined}
        initialLocationId={initialLocationId ?? undefined}
        initialProductId={initialProductId ?? undefined}
        cancelHref="/sales/sales-list"
      />
    </div>
  );
}