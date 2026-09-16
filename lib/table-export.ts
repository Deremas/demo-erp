"use client";

import { utils, writeFileXLSX } from "xlsx";

import type { SimpleColumn, SimpleRow } from "@/lib/table";
import { formatCurrency, formatDateTime, toTitleCase } from "@/lib/utils";

function escapeHtml(value: string) {
  if (!value) return "";
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function slugifyExportName(value: string) {
  const dateStr = new Date().toISOString().split("T")[0];
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "table-export";
  
  return `${slug}_${dateStr}`;
}

export function formatTableExportValue(column: SimpleColumn, row: SimpleRow) {
  const rawValue = row[column.key];

  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return "-";
  }

  if (column.type === "currency") {
    return formatCurrency(
      typeof rawValue === "number" || typeof rawValue === "string"
        ? rawValue
        : 0,
    );
  }

  if (column.type === "dateTime") {
    return formatDateTime(String(rawValue));
  }

  if (column.type === "status") {
    return toTitleCase(String(rawValue));
  }

  if (column.type === "multiline") {
    return String(rawValue).replaceAll("\n", " | ");
  }

  return String(rawValue);
}

function buildExportRows(columns: SimpleColumn[], rows: SimpleRow[]) {
  return rows.map((row) =>
    Object.fromEntries(
      columns.map((column) => [column.header, formatTableExportValue(column, row)]),
    ),
  );
}

export function exportRowsToExcel(args: {
  columns: SimpleColumn[];
  rows: SimpleRow[];
  fileName: string;
  sheetName?: string;
  filters?: Record<string, any>;
  generatedBy?: string;
}) {
  const exportRows = buildExportRows(args.columns, args.rows);
  const worksheet = utils.json_to_sheet(exportRows);
  const workbook = utils.book_new();

  utils.book_append_sheet(
    workbook,
    worksheet,
    args.sheetName?.trim() || "Data",
  );

  writeFileXLSX(workbook, `${slugifyExportName(args.fileName)}.xlsx`);
}

export function exportRowsToCsv(args: {
  columns: SimpleColumn[];
  rows: SimpleRow[];
  fileName: string;
  filters?: Record<string, any>;
  generatedBy?: string;
}) {
  const exportRows = buildExportRows(args.columns, args.rows);
  const worksheet = utils.json_to_sheet(exportRows);
  const csv = utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${slugifyExportName(args.fileName)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportRowsToPdf(args: {
  title: string;
  columns: SimpleColumn[];
  rows: SimpleRow[];
  fileName: string;
  filters?: Record<string, any>;
  generatedBy?: string;
}) {
  if (typeof window === "undefined") {
    return false;
  }

  const heading = escapeHtml(args.title);
  const exportedAt = escapeHtml(formatDateTime(new Date().toISOString()));
  const generatedBy = escapeHtml(args.generatedBy || "System");

  const headerRow = args.columns
    .map(
      (column) =>
        `<th>${escapeHtml(column.header)}</th>`,
    )
    .join("");
  const bodyRows =
    args.rows.length > 0
      ? args.rows
          .map((row) => {
            const cells = args.columns
              .map(
                (column) =>
                  `<td>${escapeHtml(formatTableExportValue(column, row))}</td>`,
              )
              .join("");

            return `<tr>${cells}</tr>`;
          })
          .join("")
      : `<tr><td colspan="${Math.max(args.columns.length, 1)}" style="text-align:center;color:#64748b;">No rows available.</td></tr>`;

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(slugifyExportName(args.fileName))}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
      body { 
        margin: 0; 
        font-family: 'Inter', -apple-system, sans-serif; 
        color: #000; 
        line-height: 1.2;
      }
      @media print {
        @page { margin: 0.5cm; size: portrait; }
        body { margin: 0; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
      }
      .watermark { 
        position: fixed; 
        inset: 0; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        pointer-events: none; 
        opacity: 0.1; 
        transform: rotate(-45deg); 
        z-index: 0; 
      }
      .watermark-text { 
        font-size: 140px; 
        font-weight: 900; 
        text-transform: uppercase; 
        color: #0f172a; 
        border: 15px solid #0f172a; 
        padding: 32px 64px; 
        border-radius: 80px; 
        white-space: nowrap; 
      }
      .content { 
        position: relative; 
        z-index: 10; 
        max-width: 950px; 
        margin: 0 auto; 
        padding: 8px; 
      }
      .header { 
        display: flex; 
        justify-content: space-between; 
        align-items: flex-start; 
        margin-bottom: 10px; 
      }
      .brand { 
        font-size: 20px; 
        font-weight: 900; 
        color: #1e3a8a; 
        text-transform: uppercase; 
        margin: 8px 0 0; 
      }
      .meta-box { 
        width: 240px; 
        border: 1px solid #000; 
        padding: 4px; 
        font-size: 9px; 
        font-weight: bold; 
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        border-bottom: 2px solid #000;
        padding-bottom: 4px;
        margin-bottom: 8px;
      }
      .doc-title {
        font-size: 18px;
        font-weight: 900;
        text-transform: uppercase;
        margin: 0;
      }
      .filters-strip {
        margin-bottom: 10px;
        font-size: 8px;
        font-weight: bold;
      }
      .filter-badge {
        display: inline-block;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        padding: 2px 6px;
        border-radius: 4px;
        margin-right: 4px;
        margin-bottom: 4px;
        text-transform: uppercase;
      }
      @page {
        size: A4;
        margin: 1.5cm;
      }
      @media print {
        body { margin: 0; padding: 0; counter-reset: page; }
        .page-footer {
          position: fixed;
          bottom: 0;
          width: 100%;
          text-align: center;
          font-size: 9px;
          border-top: 1px solid #000;
          padding-top: 4px;
        }
        .page-number:after {
          counter-increment: page;
          content: "Page " counter(page);
        }
        tr { page-break-inside: avoid; }
        thead { display: table-header-group; }
        .no-print { display: none; }
      }
      body {
        background: #fff;
        color: #000;
        margin: 0;
        padding: 0;
        font-family: Inter, system-ui, sans-serif;
      }
      .content { width: 100%; box-sizing: border-box; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
      th, td { border: 1px solid #000; padding: 6px 4px; font-size: 9px; text-align: left; word-wrap: break-word; overflow: hidden; }
      th { background: #f1f5f9 !important; font-weight: 900; text-transform: uppercase; }
      .brand { font-family: system-ui, sans-serif; }
      .watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 80px;
        font-weight: 900;
        color: rgba(0,0,0,0.03);
        z-index: -1;
        text-transform: uppercase;
        white-space: nowrap;
        pointer-events: none;
      }
    </style>
  </head>
  <body>
    <div class="watermark">Attachment</div>
    
    <div class="content">
      <div class="header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; width: 100%;">
        <div style="flex: 1; text-align: left; padding-top: 10px;">
           <h1 class="brand" style="font-size: 24px; font-weight: 900; color: #000; text-transform: uppercase; margin: 0; letter-spacing: -0.5px;">Demo ERP</h1>
           <p style="font-size: 12px; font-weight: bold; color: #555; text-transform: uppercase; letter-spacing: 2px; margin: 2px 0 0;">Operational System</p>
        </div>
        <div class="meta-box" style="width: 250px; border: 1.5px solid #000; padding: 10px; font-size: 10px; font-weight: bold; line-height: 1.4;">
          <div style="border-bottom: 2px solid #000; margin-bottom: 8px; padding-bottom: 2px; text-transform: uppercase; font-size: 11px; font-weight: 900;">DEMO ERP</div>
          <div style="display: flex; justify-content: space-between;"><span>Tel:</span><span>-</span></div>
          <div style="display: flex; justify-content: space-between;"><span>Fax:</span><span>-</span></div>
          <div style="display: flex; justify-content: space-between;"><span>Web:</span><span>-</span></div>
          <div style="display: flex; justify-content: space-between;"><span>Email:</span><span>-</span></div>
          <div style="display: flex; justify-content: space-between; font-weight: 900; color: #000;"><span>TIN:</span><span>0042571273</span></div>

        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-bottom: 15px; width: 100%;">
        <h2 class="doc-title" style="font-size: 18px; font-weight: 900; text-transform: uppercase; border-bottom: 4px solid #000; padding-bottom: 2px; margin: 0; background: #000; color: #fff; padding-left: 10px; padding-right: 10px;">${heading}</h2>
      </div>
      
      <div class="metadata-grid" style="display: flex; gap: 15px; margin-bottom: 15px; width: 100%;">
        <div class="meta-left" style="flex: 2; border: 1.5px solid #000; padding: 10px; min-height: 90px; font-size: 11px;">
           <p style="margin: 0 0 8px; font-weight: 900; text-transform: uppercase; font-size: 9px; border-bottom: 1px solid #000; padding-bottom: 2px; color: #000;">Report Filters:</p>
           ${args.filters && Object.entries(args.filters).filter(([_, v]) => v && v !== 'all').length > 0 ? `
             <div style="display: flex; flex-direction: column; gap: 4px;">
               ${Object.entries(args.filters).filter(([_, v]) => v && v !== 'all').map(([k, v]) => `
                 <div style="display: flex; gap: 20px;">
                   <span style="width: 100px; font-weight: 900; color: #000; text-transform: uppercase;">${k.replace(/([A-Z])/g, ' $1').trim()}</span>
                   <span style="font-weight: 900; text-transform: uppercase; color: #000;">${v}</span>
                 </div>
               `).join('')}
             </div>
           ` : '<span style="color: #000; font-weight: 900; text-transform: uppercase; font-size: 9px;">No active filters applied</span>'}
        </div>
        <div class="meta-right" style="flex: 1; border: 1.5px solid #000; padding: 10px; min-height: 90px; font-size: 11px;">
           <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
             <span style="font-weight: 900; color: #000;">BY</span>
             <span style="font-weight: 900; text-transform: uppercase; color: #000;">${generatedBy}</span>
           </div>
           <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
             <span style="font-weight: 900; color: #000;">DATE</span>
             <span style="font-weight: 900; text-transform: uppercase; color: #000;">${exportedAt}</span>
           </div>
           <div style="display: flex; justify-content: space-between;">
             <span style="font-weight: 900; color: #000;">REF</span>
             <span style="font-weight: 900; text-transform: uppercase; color: #000;">REP-${Math.random().toString(36).substring(7).toUpperCase()}</span>
           </div>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <thead><tr style="background: #f1f5f9;">${headerRow}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>

      <div class="footer" style="text-align: center; margin-top: 40px; width: 100%;">
        <div style="border-top: 2px solid #000; padding-top: 6px; font-size: 11px; font-weight: 900; text-transform: uppercase; color: #000; letter-spacing: 1px;">
          INVALID WITHOUT FISCAL OR Refund ATTACHED
        </div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 6px; font-size: 9px; font-weight: 900; color: #000; text-transform: uppercase;">
          <p style="margin: 0;">SYSTEM MADE BY <a href="https://blueoceancreatives.com" target="_blank" rel="noreferrer" style="color: #1e3a8a; text-decoration: none; border-bottom: 1px solid #1e3a8a;">BLUE OCEAN CREATIVES</a></p>
          <div style="text-align: right;">
            <span>Printed: ${exportedAt}</span>
            <span style="margin-left: 15px; padding-left: 15px; border-left: 1px solid #000;" class="page-number"></span>
          </div>
        </div>
      </div>
    </div>
    <script>
      window.onload = function() {
        setTimeout(function() {
          window.focus();
          window.print();
        }, 500);
      };
    </script>
  </body>
</html>`;

  const newWindow = window.open("", "_blank");
  if (newWindow) {
    newWindow.document.open();
    newWindow.document.write(html);
    newWindow.document.close();
    return true;
  }

  return false;
}
