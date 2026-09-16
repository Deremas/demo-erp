export const dynamic = "force-dynamic";

import { TablePage } from "@/components/tables/table-page";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import { type RouteSearchParams } from "@/lib/query-params";

type PurchasedItemsPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: PurchasedItemsPageProps) {
  const params = await searchParams;
  const filters = tableFiltersFromSearchParams(params);

  const config = await getTablePageConfig("purchasesPurchasedItems", filters);

  return <TablePage config={config} />;
}