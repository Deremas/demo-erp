export const dynamic = "force-dynamic";

import { CustomerPaymentForm } from "@/components/forms/customer-payment-form";
import { ModalTablePage } from "@/components/tables/modal-table-page";
import { getCustomerPaymentFormOptions } from "@/lib/form-options";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";

type CustomerPaymentsPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: CustomerPaymentsPageProps) {
  const params = await searchParams;
  const customerId = getSingleSearchParam(params, "customerId");
  const saleId = getSingleSearchParam(params, "saleId");
  const filters = tableFiltersFromSearchParams(params);
  const initialOpen = getSingleSearchParam(params, "open") === "1";
  const initialSettlementMode =
    getSingleSearchParam(params, "settlementMode") === "PARTIAL"
      ? "PARTIAL"
      : "FULL";

  const [config, options] = await Promise.all([
    getTablePageConfig("salesCustomerPayments", {
      ...filters,
      ...(customerId ? { customerId } : {}),
    }),
    getCustomerPaymentFormOptions(customerId),
  ]);

  return (
    <ModalTablePage
      config={config}
      actionLabel="Record payment"
      dialogTitle="Receive customer payment"
      dialogDescription="Post full or partial payments for outstanding customer balances."
      initialOpen={initialOpen}
      maxWidth="max-w-5xl"
    >
      <CustomerPaymentForm
        options={options}
        {...(customerId ? { initialCustomerId: customerId } : {})}
        {...(saleId ? { initialSaleId: saleId } : {})}
        initialSettlementMode={initialSettlementMode}
      />
    </ModalTablePage>
  );
}