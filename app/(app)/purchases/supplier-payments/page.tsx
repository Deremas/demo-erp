export const dynamic = "force-dynamic";

import { SupplierPaymentForm } from "@/components/forms/supplier-payment-form";
import { ModalTablePage } from "@/components/tables/modal-table-page";
import { getSupplierPaymentFormOptions } from "@/lib/form-options";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";

type SupplierPaymentsPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: SupplierPaymentsPageProps) {
  const params = await searchParams;
  const supplierId = getSingleSearchParam(params, "supplierId");
  const purchaseId = getSingleSearchParam(params, "purchaseId");
  const filters = tableFiltersFromSearchParams(params);
  const initialOpen = getSingleSearchParam(params, "open") === "1";

  const [config, options] = await Promise.all([
    getTablePageConfig("purchasesSupplierPayments", {
      ...filters,
      ...(supplierId ? { supplierId } : {}),
    }),
    getSupplierPaymentFormOptions(supplierId),
  ]);

  return (
    <ModalTablePage
      config={config}
      actionLabel="Record payment"
      dialogTitle="Pay supplier balance"
      dialogDescription="Post full or partial supplier payments without leaving this page."
      initialOpen={initialOpen}
      maxWidth="max-w-5xl"
    >
      <SupplierPaymentForm
        options={options}
        {...(supplierId ? { initialSupplierId: supplierId } : {})}
        {...(purchaseId ? { initialPurchaseId: purchaseId } : {})}
      />
    </ModalTablePage>
  );
}