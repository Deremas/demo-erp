"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PrintLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  companyInfo: {
    name: string;
    phone?: string;
    tin?: string;
  };
  metadataLeft?: { label: string; value: string }[];
  metadataRight?: { label: string; value: string }[];
  locationName?: string;
}

export function PrintLayout({ 
  children, 
  title, 
  subtitle, 
  companyInfo, 
  metadataLeft,
  metadataRight,
  locationName 
}: PrintLayoutProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn("min-h-screen bg-white p-2 text-black print:p-0 relative selection:bg-transparent")}>
      {/* Suppress browser headers/footers */}
      <style jsx global>{`
        @media print {
          @page { margin: 0.5cm; size: portrait; }
          body { margin: 0; }
          header, footer { display: none !important; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; }
        }
      `}</style>

      {/* High Contrast Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] rotate-[-45deg] select-none z-0">
        <span className="text-[140px] font-black tracking-tighter uppercase whitespace-nowrap text-slate-900">
          Attachment
        </span>
      </div>

      {/* Navigation Controls (Hidden during print) */}
      <div className="fixed top-4 left-4 z-50 print:hidden flex gap-2">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to System
        </button>
      </div>

      <div className="max-w-[950px] mx-auto relative z-10 min-h-[calc(100vh-1cm)] flex flex-col">
        {/* Universal Header */}
        <div className="space-y-1 mb-2">
          <div className="flex justify-between items-start">
            <div className="pt-8 flex-1 text-center">
              <h1 className="text-2xl font-black uppercase tracking-tight">{companyInfo.name}</h1>
              {subtitle && <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{subtitle}</p>}
            </div>
            
            <div className="w-[280px] border border-black p-1.5 text-[9px] font-bold leading-tight">
              <p className="border-b border-black mb-1 uppercase text-[10px]">{companyInfo.name}</p>
              <div className="space-y-0">
                <div className="flex justify-between"><span>Tel:</span><span>{companyInfo.phone || "-"}</span></div>
                <div className="flex justify-between"><span>Fax:</span><span>-</span></div>
                <div className="flex justify-between"><span>Web:</span><span>-</span></div>
                <div className="flex justify-between"><span>Email:</span><span>-</span></div>
                <div className="flex justify-between font-black"><span>TIN:</span><span>{companyInfo.tin || "0042571273"}</span></div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
             <h2 className="text-lg font-black uppercase tracking-tight border-b-2 border-black/10 pb-0.5">{title}</h2>
          </div>

          {/* Metadata Boxes */}
          <div className="grid grid-cols-12 gap-3 pt-1">
             <div className="col-span-8 border border-black/40 p-2 min-h-[80px] text-[10px] font-medium space-y-1">
                {metadataLeft?.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="w-20 text-black shrink-0 font-bold">{item.label}</span>
                    <span className="font-bold uppercase flex-1">{item.value}</span>
                  </div>
                ))}
             </div>
             <div className="col-span-4 border border-black/40 p-2 min-h-[80px] text-[10px] font-medium space-y-1">
                {metadataRight?.map((item, idx) => (
                  <div key={idx} className="flex justify-between gap-2">
                    <span className="text-black shrink-0 font-bold">{item.label}</span>
                    <span className="font-bold uppercase text-right">{item.value}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow py-1">
          {children}
        </div>

        {/* Standard Footer */}
        <div className="pt-8 space-y-1 mt-auto">
          <div className="border-t border-black pt-1 text-center text-[10px] font-black uppercase">
            INVALID WITHOUT FISCAL OR Refund ATTACHED
          </div>
          <div className="flex justify-between items-end text-[8px] font-black text-slate-400 uppercase">
             <p>SYSTEM MADE BY <a href="https://blueoceancreatives.com" target="_blank" rel="noreferrer" className="text-blue-900 hover:underline">BLUE OCEAN CREATIVES</a></p>
             <div className="flex gap-4">
               <span>Printed: {format(new Date(), "PPpp")}</span>
               <span className="text-black uppercase font-black">Official Document</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}