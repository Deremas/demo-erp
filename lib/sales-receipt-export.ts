import { format } from "date-fns";
import { utils, write } from "xlsx";

import {
  buildPdfBuffer,
  makeBox,
  makeFilledBox,
  makeGrayTextLine,
  makeRotatedTextLine,
  makeRule,
  makeTextLine,
} from "@/lib/pdf-builder";
import type { SaleReceiptRecord } from "@/lib/sales-receipt-service";
import { numberToWords } from "@/lib/utils";

type CompanySettings = {
  name: string;
  tin: string;
  phone?: string | null;
  address?: string | null;
};

function safeSaleNumber(saleNumber: string) {
  return saleNumber.replace(/^-/, "");
}

export function buildReceiptFileName(saleNumber: string, soldAt: Date, ext: "pdf" | "xlsx") {
  return `Receipt-${safeSaleNumber(saleNumber)}-${format(soldAt, "yyyy-MM-dd")}.${ext}`;
}

export function buildReceiptSummaryRows(sale: SaleReceiptRecord) {
  return [
    ["Sales Number", sale.saleNumber],
    ["Voucher Code", sale.voucherCode ?? "-"],
    ["Customer Name", sale.customer?.name ?? "Walk-in Customer"],
    ["Customer Phone", sale.customer?.phone ?? "-"],
    ["Customer TIN", sale.customer?.tinNumber ?? "-"],
    ["Location", sale.location?.name ?? "-"],
    ["Sold By", sale.createdBy?.name ?? "-"],
    ["Sale Date", format(new Date(sale.soldAt), "dd MMM yyyy")],
    ["Payment Method", sale.paymentMethod],
    ["Payment Status", sale.paymentStatus],
    ["Subtotal", Number(sale.subtotal)],
    ["Discount Total", Number(sale.discountTotal)],
    ["Grand Total", Number(sale.total)],
    ["Amount Paid", Number(sale.amountPaid)],
    ["Amount Due", Number(sale.amountDue)],
    ["Note", sale.note ?? "-"],
  ];
}

export function buildReceiptExcelBuffer(sale: SaleReceiptRecord, companySettings: CompanySettings, printedAt = new Date()) {
  const workbook = utils.book_new();
  const customerName = sale.customer?.name ?? "Walk-in Customer";
  const sheetRows: (string | number)[][] = [
    [companySettings.name.toUpperCase()],
    ["CASH SALES VOUCHER"],
    [],
    ["Company", companySettings.name, "", "Tel", companySettings.phone ?? "-"],
    ["Company TIN", companySettings.tin, "", "Address", companySettings.address ?? "-"],
    [],
    ["Customer", customerName, "", "Voucher No", sale.saleNumber],
    ["Tin No.", sale.customer?.tinNumber ?? "-", "", "Date", format(new Date(sale.soldAt), "M/d/yy h:mm a")],
    ["Address", sale.customer?.address ?? "-", "", "Store", sale.location?.name ?? "-"],
    ["FS No.", "00006472, MRC No. FGK0006971", "", "Sold By", sale.createdBy?.name ?? "-"],
    ["Remark", sale.note ?? "-", "", "Payment Method", sale.paymentMethod],
    [],
    ["SN", "ITEM ID", "DESCRIPTION", "QTY", "UOM", "UNIT AMT", "DISCOUNT", "TOTAL"],
    ...sale.items.map((item, index) => [
      index + 1,
      item.product.sku,
      item.product.name,
      item.quantity,
      item.quantity > 0 ? "PKG" : "PCS",
      Number(item.unitPrice),
      Number(item.discount),
      Number(item.lineTotal),
    ]),
    ["", "", "Total Qty", sale.items.reduce((sum, item) => sum + Number(item.quantity), 0), "", "", "", ""],
    [],
    [numberToWords(Number(sale.total)), "", "", "", "Grand Total", "", "", Number(sale.total)],
    ["PAYMENT METHOD:", sale.paymentMethod, "", "", "Subtotal", "", "", Number(sale.subtotal)],
    ["Printed On:", format(printedAt, "dd MMM yyyy, hh:mm a"), "", "", "Discount Total", "", "", Number(sale.discountTotal)],
    ["Sale Date:", format(new Date(sale.soldAt), "dd MMM yyyy"), "", "", "Amount Paid", "", "", Number(sale.amountPaid)],
    ["Sales Number:", sale.saleNumber, "", "", "Amount Due", "", "", Number(sale.amountDue)],
    [],
    ["INVALID WITHOUT FISCAL OR REFUND ATTACHED"],
    ["SYSTEM MADE BY BLUE OCEAN CREATIVES", "", "", "", "OFFICIAL DOCUMENT"],
  ];

  const sheet = utils.aoa_to_sheet(sheetRows);
  const invalidNoticeRow = sheetRows.findIndex((row) => row[0] === "INVALID WITHOUT FISCAL OR REFUND ATTACHED");
  sheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    { s: { r: invalidNoticeRow, c: 0 }, e: { r: invalidNoticeRow, c: 7 } },
  ];
  sheet["!cols"] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 38 },
    { wch: 10 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
  ];

  utils.book_append_sheet(workbook, sheet, "Receipt");

  return write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function buildReceiptPdfBuffer(sale: SaleReceiptRecord, companySettings: CompanySettings, printedAt = new Date()) {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const left = 36;
  const right = pageWidth - 36;
  const width = right - left;
  let ops: string[] = [];
  const text = (x: number, y: number, value: string, size = 8, bold = false) => {
    ops.push(makeTextLine(x, y, value, size, bold));
  };
  const pair = (label: string, value: string, x: number, y: number, labelWidth = 58) => {
    text(x, y, label, 7, true);
    text(x + labelWidth, y, value.toUpperCase(), 7, true);
  };

  ops.push(makeRotatedTextLine(145, 170, "ATTACHMENT", 45, 78, true, 0.9));
  text(250, 790, companySettings.name.toUpperCase(), 16, true);

  const companyBoxX = 408;
  const companyBoxY = 770;
  ops.push(makeBox(companyBoxX, companyBoxY, 150, 62));
  text(companyBoxX + 5, companyBoxY + 52, companySettings.name.toUpperCase(), 7, true);
  ops.push(makeRule(companyBoxX, companyBoxY + 47, companyBoxX + 150, companyBoxY + 47));
  text(companyBoxX + 5, companyBoxY + 37, "Tel:", 6, true);
  text(companyBoxX + 92, companyBoxY + 37, companySettings.phone ?? "-", 6, true);
  text(companyBoxX + 5, companyBoxY + 28, "Fax:", 6, true);
  text(companyBoxX + 137, companyBoxY + 28, "-", 6, true);
  text(companyBoxX + 5, companyBoxY + 19, "Web:", 6, true);
  text(companyBoxX + 137, companyBoxY + 19, "-", 6, true);
  text(companyBoxX + 5, companyBoxY + 10, "Email:", 6, true);
  text(companyBoxX + 137, companyBoxY + 10, "-", 6, true);
  text(companyBoxX + 5, companyBoxY + 1, "TIN:", 6, true);
  text(companyBoxX + 104, companyBoxY + 1, companySettings.tin, 6, true);

  text(438, 748, sale.paymentMethod === "CREDIT" ? "CREDIT SALES VOUCHER" : "CASH SALES VOUCHER", 12, true);

  const metaY = 660;
  ops.push(makeBox(left, metaY, 345, 76));
  ops.push(makeBox(left + 355, metaY, 168, 76));
  pair("Customer", sale.customer?.name ?? "Walk-in Customer", left + 8, metaY + 59);
  pair("Tin No.", sale.customer?.tinNumber ?? "-", left + 8, metaY + 45);
  pair("Address", sale.customer?.address ?? "-", left + 8, metaY + 31);
  pair("FS No.", "00006472, MRC No. FGK0006971", left + 8, metaY + 17);
  pair("Remark", sale.note ?? "-", left + 8, metaY + 3);
  pair("Voucher No", sale.saleNumber, left + 365, metaY + 55, 62);
  pair("Date", format(new Date(sale.soldAt), "M/d/yy h:mm a"), left + 365, metaY + 38, 62);
  pair("Store", sale.location?.name ?? "-", left + 365, metaY + 21, 62);

  const tableTop = 650;
  const headerH = 16;
  const rowH = 16;
  const cols = [left, left + 18, left + 82, left + 306, left + 342, left + 374, left + 438, left + 484, right];
  ops.push(makeFilledBox(left, tableTop - headerH, width, headerH, 0.96));
  ops.push(makeBox(left, tableTop - headerH, width, headerH));
  for (const x of cols) ops.push(makeRule(x, tableTop, x, tableTop - headerH));
  text(left + 5, tableTop - 11, "SN", 6, true);
  text(left + 23, tableTop - 11, "ITEM ID", 6, true);
  text(left + 87, tableTop - 11, "DESCRIPTION", 6, true);
  text(left + 314, tableTop - 11, "QTY", 6, true);
  text(left + 350, tableTop - 11, "UOM", 6, true);
  text(left + 385, tableTop - 11, "UNIT AMT", 6, true);
  text(left + 446, tableTop - 11, "DISCOUNT", 6, true);
  text(left + 502, tableTop - 11, "TOTAL", 6, true);

  const pageTemplate = [...ops];
  const itemsPerPage = 26;
  const itemPages = Array.from(
    { length: Math.max(1, Math.ceil(sale.items.length / itemsPerPage)) },
    (_, pageIndex) => sale.items.slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage),
  );
  const pages = itemPages.map((items, pageIndex) => {
    ops = [...pageTemplate];
    let y = tableTop - headerH;

    items.forEach((item, itemIndex) => {
      const saleItemIndex = pageIndex * itemsPerPage + itemIndex;
      y -= rowH;
      ops.push(makeBox(left, y, width, rowH));
      for (const x of cols) ops.push(makeRule(x, y + rowH, x, y));
      const name = item.product.name.length > 38 ? `${item.product.name.slice(0, 38)}...` : item.product.name;
      text(left + 5, y + 5, String(saleItemIndex + 1), 6, true);
      text(left + 23, y + 5, item.product.sku, 6);
      text(left + 87, y + 5, name.toUpperCase(), 6, true);
      text(left + 318, y + 5, Number(item.quantity).toFixed(2), 6, true);
      text(left + 350, y + 5, item.quantity > 0 ? "PKG" : "PCS", 6, true);
      text(left + 386, y + 5, Number(item.unitPrice).toFixed(2), 6);
      text(left + 449, y + 5, Number(item.discount).toFixed(2), 6);
      text(left + 500, y + 5, Number(item.lineTotal).toFixed(2), 6, true);
    });

    const isLastPage = pageIndex === itemPages.length - 1;
    if (isLastPage) {
      y -= rowH;
      ops.push(makeBox(left, y, width, rowH));
      text(left + 280, y + 5, "Total Qty", 6, true);
      text(left + 318, y + 5, sale.items.reduce((acc, item) => acc + Number(item.quantity), 0).toFixed(2), 6, true);

      const bottomY = Math.max(90, y - 48);
      ops.push(makeBox(left, bottomY, 306, 38));
      ops.push(makeBox(left + 306, bottomY, width - 306, 38));
      text(left + 8, bottomY + 24, numberToWords(Number(sale.total)), 6, true);
      text(left + 8, bottomY + 8, "PAYMENT METHOD:", 6, true);
      text(left + 78, bottomY + 8, sale.paymentMethod, 6, true);
      text(left + 312, bottomY + 24, "Grand Total", 8, true);
      text(right - 45, bottomY + 24, Number(sale.total).toFixed(2), 8, true);
      text(left + 312, bottomY + 8, "Amount Paid", 6, true);
      text(right - 45, bottomY + 8, Number(sale.amountPaid).toFixed(2), 6, true);
    } else {
      text(right - 105, 84, `CONTINUED ON PAGE ${pageIndex + 2}`, 6, true);
    }

    ops.push(makeRule(left, 68, right, 68));
    text(238, 58, "INVALID WITHOUT FISCAL OR REFUND ATTACHED", 6, true);
    ops.push(makeGrayTextLine(left, 42, "SYSTEM MADE BY BLUE OCEAN CREATIVES", 5, true, 0.45));
    text(386, 42, `PRINTED: ${format(printedAt, "PPpp").toUpperCase()}`, 5, true);
    text(506, 42, "OFFICIAL DOCUMENT", 5, true);
    text(right - 30, 58, `${pageIndex + 1}/${itemPages.length}`, 5, true);

    return { ops };
  });

  return buildPdfBuffer(pages, { width: pageWidth, height: pageHeight });
}