export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { ReportDetail } from "@/components/reports/report-detail";
import { getReportConfig, getReportFilterOptions, type ReportFilters } from "@/lib/reports";
import type { RouteSearchParams } from "@/lib/query-params";

type ReportDetailPageProps = {
  params: Promise<{ reportId: string }>;
  searchParams?: Promise<RouteSearchParams>;
};

function readFilters(params: RouteSearchParams | undefined): ReportFilters {
  const get = (key: string) => {
    const value = params?.[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const filters: ReportFilters = {};
  for (const key of [
    "locationId",
    "dateFrom",
    "dateTo",
    "search",
    "status",
    "paymentMethod",
    "paymentStatus",
    "productId",
    "categoryId",
    "brandId",
    "companyId",
    "customerId",
    "supplierId",
    "userId",
    "movementType",
    "accountType",
    "financeAccountId",
    "sortBy",
    "lowStockOnly",
    "range1Month",
    "range1From",
    "range1To",
    "range2Month",
    "range2From",
    "range2To",
    "range3Month",
    "range3From",
    "range3To",
  ] as const) {
    const value = get(key);
    if (value) {
      filters[key] = value;
    }
  }

  return filters;
}

export default async function ReportDetailPage({ params, searchParams }: ReportDetailPageProps) {
  const [{ reportId }, query] = await Promise.all([params, searchParams]);
  const filters = readFilters(query);
  const [report, options] = await Promise.all([
    getReportConfig(reportId, filters),
    getReportFilterOptions(),
  ]);

  if (!report) {
    notFound();
  }

  return (
    <ReportDetail
      definition={{
        id: report.definition.id,
        title: report.definition.title,
        description: report.definition.description,
        category: report.definition.category,
        filters: report.definition.filters,
      }}
      config={report.config}
      filters={filters}
      summaries={report.summaries.length ? report.summaries : [{ label: "Rows", value: report.config.rows.length, type: "number" as const }]}
      options={options}
    />
  );
}