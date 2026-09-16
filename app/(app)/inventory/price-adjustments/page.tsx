export const dynamic = "force-dynamic";

import { applyPriceAdjustmentAction } from "@/lib/actions/price-adjustments";
import { PriceAdjustmentForm } from "@/components/inventory/price-adjustment-form";
import { prisma } from "@/lib/prisma";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";
import { formatCurrency, parseFilterList } from "@/lib/utils";

async function applyPriceAdjustmentFormAction(formData: FormData) {
  "use server";
  return applyPriceAdjustmentAction(formData);
}

type PageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

function dateRange(dateFrom?: string, dateTo?: string) {
  if (!dateFrom && !dateTo) return undefined;

  const range: { gte?: Date; lte?: Date } = {};
  if (dateFrom) {
    const start = new Date(dateFrom);
    if (!Number.isNaN(start.getTime())) range.gte = start;
  }
  if (dateTo) {
    const end = new Date(dateTo);
    if (!Number.isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999);
      range.lte = end;
    }
  }

  return Object.keys(range).length ? range : undefined;
}

function adjustmentLabel(mode: string) {
  if (mode === "PERCENTAGE_DECREASE") return "Decrease %";
  if (mode === "FIXED_INCREASE") return "Increase ETB";
  if (mode === "FIXED_DECREASE") return "Decrease ETB";
  if (mode === "SET_EXACT") return "Set exact";
  return "Increase %";
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const historyLocationId = getSingleSearchParam(params, "historyLocationId");
  const historyProductId = getSingleSearchParam(params, "historyProductId");
  const historyCategoryId = getSingleSearchParam(params, "historyCategoryId");
  const historyMode = getSingleSearchParam(params, "historyMode");
  const dateFrom = getSingleSearchParam(params, "dateFrom");
  const dateTo = getSingleSearchParam(params, "dateTo");

  const locationIds = parseFilterList(historyLocationId);
  const productIds = parseFilterList(historyProductId);
  const categoryIds = parseFilterList(historyCategoryId);

  const historyWhere: any = {};
  const createdAt = dateRange(dateFrom, dateTo);
  if (locationIds) historyWhere.locationId = locationIds.length === 1 ? locationIds[0] : { in: locationIds };
  if (productIds) historyWhere.productId = productIds.length === 1 ? productIds[0] : { in: productIds };
  if (createdAt) historyWhere.createdAt = createdAt;
  if (historyMode) historyWhere.batch = { mode: historyMode };
  if (categoryIds) {
    historyWhere.product = {
      categoryId: categoryIds.length === 1 ? categoryIds[0] : { in: categoryIds },
    };
  }

  const [locations, products, categories, existingPrices, historyRows] = await Promise.all([
    prisma.location.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, sku: true, categoryId: true, sellingPrice: true } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.productLocationPrice.findMany({
      select: { productId: true, locationId: true, sellingPrice: true },
    }),
    prisma.priceAdjustmentHistory.findMany({
      where: historyWhere,
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        batch: {
          include: {
            createdBy: { select: { name: true, username: true } },
          },
        },
        product: { select: { name: true, sku: true } },
        location: { select: { name: true } },
      },
    }) as any,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Inventory</p>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Price Adjustment</h1>
        <p className="mt-2 max-w-3xl text-sm font-medium text-muted-foreground">
          Update selling prices in bulk for selected locations using item and category filters.
        </p>
      </div>

      <PriceAdjustmentForm
        action={applyPriceAdjustmentFormAction}
        locations={locations}
        products={products.map((product) => ({
        ...product,
        sellingPrice: Number(product.sellingPrice),
      }))}
        categories={categories}
        existingPrices={existingPrices.map((price) => ({
        ...price,
        sellingPrice: Number(price.sellingPrice),
      }))}
      />

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Price Adjustment History</h2>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              Shows original and new prices for every adjustment.
            </p>
          </div>
          <a
            href="/inventory/price-adjustments"
            className="text-xs font-black uppercase tracking-wider text-primary hover:underline"
          >
            Clear history filters
          </a>
        </div>

        <form className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <select name="historyLocationId" defaultValue={historyLocationId ?? ""} className="h-10 rounded-xl border bg-background px-3 text-xs font-bold">
            <option value="">All locations</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>{location.name}</option>
            ))}
          </select>
          <select name="historyProductId" defaultValue={historyProductId ?? ""} className="h-10 rounded-xl border bg-background px-3 text-xs font-bold">
            <option value="">All items</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
          <select name="historyCategoryId" defaultValue={historyCategoryId ?? ""} className="h-10 rounded-xl border bg-background px-3 text-xs font-bold">
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <select name="historyMode" defaultValue={historyMode ?? ""} className="h-10 rounded-xl border bg-background px-3 text-xs font-bold">
            <option value="">All adjustment types</option>
            <option value="PERCENTAGE_INCREASE">Increase by percentage</option>
            <option value="PERCENTAGE_DECREASE">Decrease by percentage</option>
            <option value="FIXED_INCREASE">Increase by fixed ETB</option>
            <option value="FIXED_DECREASE">Decrease by fixed ETB</option>
            <option value="SET_EXACT">Set exact selling price</option>
          </select>
          <input name="dateFrom" type="date" defaultValue={dateFrom ?? ""} className="h-10 rounded-xl border bg-background px-3 text-xs font-bold" />
          <input name="dateTo" type="date" defaultValue={dateTo ?? ""} className="h-10 rounded-xl border bg-background px-3 text-xs font-bold" />
          <button className="h-10 rounded-xl bg-primary px-4 text-xs font-black uppercase tracking-wider text-primary-foreground xl:col-span-2">
            Filter history
          </button>
        </form>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b text-xs font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-2">Date</th>
                <th>User</th>
                <th className="py-2">Location</th>
                <th>Item</th>
                <th>Item Code / SKU</th>
                <th>Adjustment</th>
                <th>Amount</th>
                <th>Unit Before</th>
                <th>Unit After</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {historyRows.map((row: any) => (
                <tr key={row.id}>
                  <td className="py-3 text-xs font-semibold text-muted-foreground">{row.createdAt.toLocaleString()}</td>
                  <td className="text-xs font-bold">{row.batch.createdBy.name || row.batch.createdBy.username}</td>
                  <td className="font-bold">{row.location.name}</td>
                  <td>{row.product.name}</td>
                  <td>{row.product.sku}</td>
                  <td>{adjustmentLabel(row.batch.mode)}</td>
                  <td>{Number(row.batch.amount).toLocaleString()}</td>
                  <td>{formatCurrency(Number(row.sellingPriceBefore))}</td>
                  <td className="font-black text-primary">{formatCurrency(Number(row.sellingPriceAfter))}</td>
                </tr>
              ))}
              {historyRows.length === 0 ? (
                <tr>
                  <td className="py-6 text-center text-sm font-semibold text-muted-foreground" colSpan={9}>
                    No price adjustment history yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}