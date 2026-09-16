export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/app-shell/page-header";
import { PosSaleForm } from "@/components/forms/pos-sale-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getSaleFormOptions } from "@/lib/form-options";

import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";

type PosSalePageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function PosSalePage({ searchParams }: PosSalePageProps) {
  const params = (await searchParams) ?? {};
  const [user, options] = await Promise.all([
    getCurrentUser(),
    getSaleFormOptions(),
  ]);
  const initialProductId = getSingleSearchParam(params, "productId");
  const initialLocationId = getSingleSearchParam(params, "locationId") || getSingleSearchParam(params, "branchId");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales"
        title="POS Sale"
        description="Fast checkout for shop sales with customer credit, discounts, and receipt totals."
      />
      <PosSaleForm
        options={options}
        userRole={user?.role}
        initialProductId={initialProductId}
        initialLocationId={initialLocationId ?? undefined}
      />
    </div>
  );
}