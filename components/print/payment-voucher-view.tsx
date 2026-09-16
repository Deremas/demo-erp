"use client";

import { format } from "date-fns";
import { formatCurrency, numberToWords } from "@/lib/utils";
import { PrintLayout } from "./print-layout";

interface PaymentVoucherProps {
  payment: any;
  companySettings: any;
  type: "CUSTOMER" | "SUPPLIER";
}

export function PaymentVoucher({ payment, companySettings, type }: PaymentVoucherProps) {
  const counterparty = type === "CUSTOMER" ? payment.customer : payment.supplier;
  const total = Number(payment.amount);
  const usdAmount = payment.isUsd && Number(payment.exchangeRate || 0) > 0
    ? total / Number(payment.exchangeRate)
    : null;
  
  const metadataLeft = [
    { label: type === "CUSTOMER" ? "Customer" : "Supplier", value: counterparty.name },
    { label: "Address", value: counterparty.address || "-" },
    { label: "Remark", value: payment.note || "-" },
  ];

  const metadataRight = [
    { label: "Voucher No", value: payment.paymentNumber },
    { label: "Date", value: format(new Date(payment.paymentDate), "M/d/yy h:mm a") },
    { label: "Store", value: payment.location?.name || "-" },
  ];

  return (
    <PrintLayout
      title={type === "CUSTOMER" ? "Receipt Voucher" : "Payment Voucher"}
      companyInfo={{
        name: companySettings?.name || "Demo ERP",
        phone: companySettings?.phone || "-",
        tin: companySettings?.tin || "0042571273",
      }}
      metadataLeft={metadataLeft}
      metadataRight={metadataRight}
    >
      <div className="space-y-4">
        {/* Payment Detail Section */}
        <div className="border border-black p-3 space-y-4 min-h-[200px]">
           <div className="bg-slate-100 p-2 italic leading-relaxed text-[11px] font-black border border-black/5">
              {numberToWords(total)}
           </div>
           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1 text-[9px] font-bold">
                 <p className="text-black/50 uppercase text-[8px]">Account / Method</p>
                 <p className="text-black uppercase font-black text-xs">{payment.financeAccount.name}</p>
              </div>
              <div className="space-y-0 text-right text-[9px] font-bold">
                 <p className="text-black/50 uppercase text-[8px]">Total Amount Paid</p>
                 <p className="text-3xl font-black text-black tracking-tighter">{formatCurrency(total)}</p>
                 {usdAmount !== null ? (
                   <p className="text-[9px] font-black text-black/50">
                     USD {usdAmount.toFixed(2)} @ {Number(payment.exchangeRate).toFixed(2)}
                   </p>
                 ) : null}
              </div>
           </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-6 py-12">
           <div className="space-y-6 text-center">
             <div className="border-b border-black mx-4" />
             <p className="text-[9px] font-black uppercase">Prepared By</p>
             <p className="text-[8px] font-bold text-black/40 italic">{payment.recordedBy.name}</p>
           </div>
           <div className="space-y-6 text-center">
             <div className="border-b border-black mx-4" />
             <p className="text-[9px] font-black uppercase">Verified By</p>
           </div>
           <div className="space-y-6 text-center">
             <div className="border-b border-black mx-4" />
             <p className="text-[9px] font-black uppercase">{type === "CUSTOMER" ? "Customer Sign" : "Receiver Sign"}</p>
           </div>
        </div>
      </div>
    </PrintLayout>
  );
}