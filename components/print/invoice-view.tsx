"use client";

import { format } from "date-fns";
import { numberToWords } from "@/lib/utils";
import { PrintLayout } from "./print-layout";

interface InvoiceViewProps {
  purchase: any;
  companySettings: any;
}

export function InvoiceView({ purchase, companySettings }: InvoiceViewProps) {
  const subtotal = Number(purchase.subtotal);
  const total = Number(purchase.total);
  const discountTotal = Number(purchase.discount ?? 0);
  const taxTotal = Number(purchase.taxTotal ?? 0);
  
  const metadataLeft = [
    { label: "Supplier", value: purchase.supplier?.name || "INTERNAL SOURCE" },
    { label: "Address", value: purchase.supplier?.address || "-" },
    { label: "Remark", value: purchase.note || "-" },
  ];

  const metadataRight = [
    { label: "Voucher No", value: purchase.purchaseNumber },
    { label: "Date", value: format(new Date(purchase.purchasedAt), "M/d/yy h:mm a") },
    { label: "Store", value: purchase.location?.name || "-" },
  ];

  return (
    <PrintLayout
      title="Procurement Voucher"
      companyInfo={{
        name: companySettings?.name || "Demo ERP",
        phone: companySettings?.phone || "-",
        tin: companySettings?.tin || "0042571273",
      }}
      metadataLeft={metadataLeft}
      metadataRight={metadataRight}
    >
      <div className="space-y-4">
        {/* Table Section */}
        <table className="w-full border-collapse border border-black text-[9px]">
          <thead>
            <tr className="bg-slate-100 border-b border-black uppercase font-black">
              <th className="border-r border-black p-1 text-left w-6">SN</th>
              <th className="border-r border-black p-1 text-left w-24">Item Id</th>
              <th className="border-r border-black p-1 text-left">Description</th>
              <th className="border-r border-black p-1 text-right w-12">Qty</th>
              <th className="border-r border-black p-1 text-center w-10">UOM</th>
              <th className="border-r border-black p-1 text-right w-20">Unit Cost</th>
              <th className="p-1 text-right w-20">Total</th>
            </tr>
          </thead>
          <tbody>
            {purchase.items.map((item: any, idx: number) => {
              const unitCost = Number(item.unitCost);
              const lineTotal = Number(item.lineTotal);
              const qty = Number(item.quantity);
              return (
                <tr key={item.id} className="border-b border-black/10">
                  <td className="border-r border-black p-1 font-bold">{idx + 1}</td>
                  <td className="border-r border-black p-1 uppercase">{item.product.sku || item.product.id.slice(-8)}</td>
                  <td className="border-r border-black p-1 font-black uppercase">{item.product.name}</td>
                  <td className="border-r border-black p-1 text-right font-black">
                    {qty.toFixed(2)}
                    {purchase.trackInUsd && (
                      <div className="text-[7px] text-slate-500 font-normal">
                        ${(unitCost / Number(purchase.exchangeRate)).toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="border-r border-black p-1 text-center uppercase font-bold">PCS</td>
                  <td className="border-r border-black p-1 text-right">{unitCost.toFixed(2)}</td>
                  <td className="p-1 text-right font-black">
                    {lineTotal.toFixed(2)}
                    {purchase.trackInUsd && (
                      <div className="text-[7px] text-slate-500 font-normal">
                        ${(lineTotal / Number(purchase.exchangeRate)).toFixed(2)}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
             <tr className="bg-slate-50 font-black border-t border-black text-[8px]">
                <td colSpan={3} className="border-r border-black p-0.5 text-right italic">Total Qty</td>
                <td className="border-r border-black p-0.5 text-right">{purchase.items.reduce((acc: number, item: any) => acc + Number(item.quantity), 0).toFixed(2)}</td>
                <td colSpan={3} />
             </tr>
          </tfoot>
        </table>

        {/* Bottom Section */}
        <div className="grid grid-cols-12 gap-0 border border-black text-[9px] font-bold">
           <div className="col-span-7 p-1.5 border-r border-black space-y-2">
              <div className="bg-slate-100 p-1 italic leading-tight">{numberToWords(total)}</div>
           </div>
           <div className="col-span-5">
              <div className="flex justify-between border-b border-black/5 p-1 px-2"><span>Sub Total</span> <span>{subtotal.toFixed(2)}</span></div>
              {discountTotal > 0 && (
                <div className="flex justify-between border-b border-black/5 p-1 px-2 text-rose-600"><span>Discount</span> <span>-{discountTotal.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between p-1 px-2 font-black text-xs bg-slate-50">
                <div className="flex flex-col">
                  <span>Grand Total</span>
                  {purchase.trackInUsd && <span className="text-[8px] font-normal italic">Rate: {Number(purchase.exchangeRate).toFixed(2)}</span>}
                </div>
                <div className="text-right">
                  <span>{total.toFixed(2)}</span>
                  {purchase.trackInUsd && <div className="text-[9px] text-indigo-700">${Number(purchase.usdTotal).toFixed(2)}</div>}
                </div>
              </div>
           </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-6 py-6">
           <div className="space-y-4 text-center">
             <div className="border-b border-black mx-4" />
             <p className="text-[8px] font-black uppercase">Prepared By</p>
           </div>
           <div className="space-y-4 text-center">
             <div className="border-b border-black mx-4" />
             <p className="text-[8px] font-black uppercase">Approved By</p>
           </div>
           <div className="space-y-4 text-center">
             <div className="border-b border-black mx-4" />
             <p className="text-[8px] font-black uppercase">Supplier Sign</p>
           </div>
        </div>
      </div>
    </PrintLayout>
  );
}