export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/app-shell/page-header";
import { SaleForm } from "@/components/forms/sale-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getSaleFormOptions } from "@/lib/form-options";

type WholesalePageProps = {
  searchParams?: Promise<{
    productId?: string;
    locationId?: string;
    branchId?: string;
  }>;
};

export default async function WholesalePage({ searchParams }: WholesalePageProps) {
  const params = (await searchParams) ?? {};
  const [user, options] = await Promise.all([
    getCurrentUser(),
    getSaleFormOptions(),
  ]);
  const initialProductId =
    typeof params.productId === "string" ? params.productId : undefined;
  const initialLocationId =
    typeof params.locationId === "string"
      ? params.locationId
      : typeof params.branchId === "string"
        ? params.branchId
        : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales"
        title="Wholesale Entry"
        description="Table-style sale entry for recording multiple liquor items in one transaction."
      />
      <SaleForm
        options={options}
        {...(user?.role ? { userRole: user.role } : {})}
        {...(initialProductId ? { initialProductId } : {})}
        {...(initialLocationId ? { initialLocationId } : {})}
        cancelHref="/sales/sales-list"
      />
    </div>
  );
}