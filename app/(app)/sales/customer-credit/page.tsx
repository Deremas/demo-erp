export const dynamic = "force-dynamic";

import { TablePage } from "@/components/tables/table-page";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";

type CustomerCreditPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: CustomerCreditPageProps) {
  const params = await searchParams;
  const customerId = getSingleSearchParam(params, "customerId");
  const filters = tableFiltersFromSearchParams(params);

  return (
    <TablePage
      config={await getTablePageConfig("salesCustomerCredit", {
        ...filters,
        ...(customerId ? { customerId } : {}),
      })}
    />
  );
}