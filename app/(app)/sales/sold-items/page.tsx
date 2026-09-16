export const dynamic = "force-dynamic";

import { TablePage } from "@/components/tables/table-page";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import { type RouteSearchParams } from "@/lib/query-params";

type SoldItemsPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: SoldItemsPageProps) {
  const params = await searchParams;
  const filters = tableFiltersFromSearchParams(params);

  const config = await getTablePageConfig("salesSoldItems", filters);

  return <TablePage config={config} />;
}