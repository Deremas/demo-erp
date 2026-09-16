export const dynamic = "force-dynamic";

import { TablePage } from "@/components/tables/table-page";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import type { RouteSearchParams } from "@/lib/query-params";

type ImportsPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: ImportsPageProps) {
  const params = await searchParams;
  const filters = tableFiltersFromSearchParams(params);

  return <TablePage config={await getTablePageConfig("purchasesImports", filters)} />;
}
