"use client";

import { format } from "date-fns";
import { numberToWords } from "@/lib/utils";
import { PrintLayout } from "./print-layout";

interface ReceiptViewProps {
  sale: any;
  companySettings: any;
}

export function ReceiptView({ sale, companySettings }: ReceiptViewProps) {
  const total = Number(sale.total);
  
  const metadataLeft = [
    { label: "Customer", value: sale.customer?.name || "Walk-in Customer" },
    { label: "Tin No.", value: sale.customer?.tinNumber || sale.customer?.tin || "-" },
    { label: "Address", value: sale.customer?.address || "-" },
    { label: "FS No.", value: `${sale.fsNumber || "00006472"}, MRC No. ${sale.mrcNumber || "FGK0006971"}` },
    { label: "Remark", value: sale.note || "-" },
  ];

  const metadataRight = [
    { label: "Voucher No", value: sale.saleNumber },
    { label: "Date", value: format(new Date(sale.soldAt), "M/d/yy h:mm: a") },
    { label: "Store", value: sale.location?.name || "-" },
  ];

  return (
    <PrintLayout
      title={sale.type === "CREDIT" ? "Credit Sales Voucher" : "Cash Sales Voucher"}
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
              <th className="border-r border-black p-1 text-right w-20">Unit Amt</th>
              <th className="border-r border-black p-1 text-right w-16">Discount</th>
              <th className="p-1 text-right w-20">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item: any, idx: number) => {
              const unitPrice = Number(item.unitPrice);
              const lineTotal = Number(item.lineTotal);
              const qty = Number(item.quantity);
              return (
                <tr key={item.id} className="border-b border-black/10">
                  <td className="border-r border-black p-1 font-bold">{idx + 1}</td>
                  <td className="border-r border-black p-1 uppercase">{item.product.sku || item.product.id.slice(-8)}</td>
                  <td className="border-r border-black p-1 font-black uppercase">{item.product.name}</td>
                  <td className="border-r border-black p-1 text-right font-black">{qty.toFixed(2)}</td>
                  <td className="border-r border-black p-1 text-center uppercase font-bold">{item.unitName || item.product.unit?.name}</td>
                  <td className="border-r border-black p-1 text-right">{unitPrice.toFixed(2)}</td>
                  <td className="border-r border-black p-1 text-right">
                    <div>{Number(item.discountAmount || 0).toFixed(2)}</div>
                    {item.discountType ? (
                      <div className="text-[7px] font-bold uppercase">
                        {item.discountType === "PER_QTY"
                          ? `${Number(item.discountRate || item.discount || 0).toFixed(2)}/qty`
                          : item.discountType === "FIXED"
                            ? `${Number(item.discountRate || 0).toFixed(2)} fixed`
                            : `${Number(item.discountRate || 0).toFixed(2)}%`}
                      </div>
                    ) : null}
                  </td>
                  <td className="p-1 text-right font-black">{lineTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
             <tr className="bg-slate-50 font-black border-t border-black text-[8px]">
                <td colSpan={3} className="border-r border-black p-0.5 text-right italic">Total Qty</td>
                <td className="border-r border-black p-0.5 text-right">{sale.items.reduce((acc: number, item: any) => acc + Number(item.quantity), 0).toFixed(2)}</td>
                <td colSpan={4} />
             </tr>
          </tfoot>
        </table>

        {/* Bottom Section */}
        <div className="grid grid-cols-12 gap-0 border border-black text-[9px] font-bold">
           <div className="col-span-7 p-1.5 space-y-2 border-r border-black">
              <div className="bg-slate-100 p-1 italic leading-tight">{numberToWords(total)}</div>
              <p className="flex items-center gap-2">
                <span className="text-black/50 uppercase">Payment Method:</span>{" "}
                <span className="underline font-black">{sale.paymentMethod || "Cash"}</span>
              </p>
              {sale.cheques && sale.cheques.length > 0 && (
                <div className="pt-1 space-y-1 border-t border-black/10 mt-1">
                  <span className="text-black/50 text-[8px] uppercase">Cheque Details:</span>
                  {sale.cheques.map((cq: any, i: number) => (
                    <p key={i} className="text-[8px] leading-tight">
                      Cheque No: <span className="font-black">{cq.chequeNumber}</span> | 
                      Bank: <span className="font-black">{cq.bankName}</span> | 
                      Depositable Date: <span className="font-black">{format(new Date(cq.depositableDate), "M/d/yy")}</span> |
                      Amount: <span className="font-black">{Number(cq.amount).toLocaleString()}</span>
                    </p>
                  ))}
                </div>
              )}
           </div>
            <div className="col-span-5">
              <div className="flex justify-between border-b border-black/5 p-1 px-2 bg-slate-50/50 font-black text-xs">
                <span>Grand Total</span> 
                <span>{Number(sale.total).toFixed(2)}</span>
              </div>
            </div>
        </div>
      </div>
    </PrintLayout>
  );
}