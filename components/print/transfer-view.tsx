"use client";

import { format } from "date-fns";
import { PrintLayout } from "./print-layout";

interface TransferViewProps {
  transfer: any;
  companySettings: any;
}

export function TransferView({ transfer, companySettings }: TransferViewProps) {
  const metadataLeft = [
    { label: "From", value: transfer.sourceLocation.name },
    { label: "To", value: transfer.destinationLocation.name },
    { label: "Dispatcher", value: transfer.sentBy?.name || "System" },
    { label: "Receiver", value: transfer.receivedBy?.name || "Pending..." },
    { label: "Remark", value: transfer.note || "-" },
  ];

  const metadataRight = [
    { label: "Transfer No", value: transfer.transferNumber },
    { label: "Status", value: transfer.status },
    { label: "Date", value: format(new Date(transfer.createdAt), "M/d/yy h:mm a") },
    { label: "Total Qty", value: transfer.items.reduce((acc: number, item: any) => acc + Number(item.quantity), 0).toString() }
  ];

  return (
    <PrintLayout
      title="Stock Transfer Note"
      subtitle="Inventory Movement Document"
      companyInfo={{
        name: companySettings?.name || "Demo ERP",
        phone: companySettings?.phone || transfer.sourceLocation.phone || "-",
        tin: companySettings?.tin || "0042571273",
      }}
      metadataLeft={metadataLeft}
      metadataRight={metadataRight}
    >

      <table className="w-full border-collapse border border-black text-[9px]">
        <thead>
          <tr className="bg-slate-100 border-b border-black uppercase font-black">
            <th className="border-r border-black p-1 text-left w-10">SN</th>
            <th className="border-r border-black p-1 text-left">Product / SKU</th>
            <th className="border-r border-black p-1 text-left">Category</th>
            <th className="p-1 text-right w-24">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {transfer.items.map((item: any, idx: number) => (
            <tr key={item.id} className="border-b border-black/10">
              <td className="border-r border-black p-1 font-bold">{idx + 1}</td>
              <td className="border-r border-black p-1">
                <p className="font-black uppercase">{item.product.name}</p>
                <p className="text-[8px] text-slate-500">SKU: {item.productId.slice(-8).toUpperCase()}</p>
              </td>
              <td className="border-r border-black p-1 uppercase">{item.product.category?.name || "General"}</td>
              <td className="p-1 text-right font-black text-sm">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {transfer.note && (
        <div className="mt-4 p-2 border border-dashed border-black/20 text-[9px] italic">
          <span className="font-bold not-italic uppercase text-[8px] block mb-1">Internal Note:</span>
          "{transfer.note}"
        </div>
      )}

      <div className="grid grid-cols-2 gap-12 mt-12 mb-8">
        <div className="space-y-8 text-center">
          <div className="border-b border-black mx-8" />
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Dispatcher Signature</p>
        </div>
        <div className="space-y-8 text-center">
          <div className="border-b border-black mx-8" />
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Receiver Signature</p>
        </div>
      </div>
    </PrintLayout>
  );
}