export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { toNumber } from "@/lib/data-runtime-utils";

type DeliveryOrderPrintPageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: DeliveryOrderPrintPageProps) {
  const { id } = await params;
  
  const deliveryOrder = await prisma.deliveryOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      location: true,
      sale: true,
      items: {
        include: {
          product: {
            include: {
              unit: true,
            },
          },
        },
      },
    },
  });

  if (!deliveryOrder) notFound();

  const settings = await prisma.companySettings.findFirst();

  return (
    <div className="p-8 max-w-[800px] mx-auto bg-white text-black min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase">{settings?.name || "Demo ERP"}</h1>
          <p className="text-sm">{settings?.address}</p>
          <p className="text-sm">TIN: {settings?.tin}</p>
          <p className="text-sm">Phone: {settings?.phone}</p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-black text-gray-400">DELIVERY ORDER</h2>
          <p className="text-lg font-bold">#{deliveryOrder.orderNumber}</p>
          <p className="text-sm text-gray-600">Ref Sale: {deliveryOrder.sale.saleNumber}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Customer Info</h3>
          <p className="font-bold">{deliveryOrder.customer.name}</p>
          <p className="text-sm">{deliveryOrder.customer.businessName}</p>
          <p className="text-sm">{deliveryOrder.customer.phone}</p>
          <p className="text-sm">{deliveryOrder.customer.address}</p>
        </div>
        <div className="border-l pl-8">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Delivery Details</h3>
          <p className="text-sm"><span className="font-semibold">Person:</span> {deliveryOrder.deliveryPerson}</p>
          <p className="text-sm"><span className="font-semibold">Phone:</span> {deliveryOrder.phone}</p>
          <p className="text-sm"><span className="font-semibold">Date:</span> {deliveryOrder.deliveryDate ? format(deliveryOrder.deliveryDate, "PPP") : "N/A"}</p>
          <p className="text-sm mt-2"><span className="font-semibold">Address:</span> {deliveryOrder.deliveryAddress}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="border-y-2 border-black bg-gray-50">
            <th className="py-3 px-2 text-left text-xs font-bold uppercase tracking-wider">Item</th>
            <th className="py-3 text-center text-xs font-bold uppercase tracking-wider w-24 border-l border-gray-300">PCS</th>
          </tr>
        </thead>
        <tbody>
          {deliveryOrder.items.map((item) => {
            return (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-3 px-2">
                  <p className="font-bold">{item.product.name}</p>
                </td>
                <td className="py-3 text-center font-mono font-bold text-lg border-l border-gray-200">{item.quantity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      {deliveryOrder.notes && (
        <div className="mb-8 p-4 bg-gray-50 rounded">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Delivery Notes</h3>
          <p className="text-sm">{deliveryOrder.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-gray-200 text-center">
        <div>
          <div className="border-b border-black mb-2"></div>
          <p className="text-xs font-bold uppercase">Authorized By</p>
        </div>
        <div>
          <div className="border-b border-black mb-2"></div>
          <p className="text-xs font-bold uppercase">Delivery Person</p>
        </div>
        <div>
          <div className="border-b border-black mb-2"></div>
          <p className="text-xs font-bold uppercase">Customer Signature</p>
        </div>
      </div>

      <div className="mt-12 text-center text-[10px] text-gray-400">
        Printed on {format(new Date(), "PPpp")} | System Generated Delivery Order
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { padding: 0; margin: 0; }
          .no-print { display: none; }
        }
      `}} />
    </div>
  );
}