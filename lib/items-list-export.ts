import { format } from "date-fns";
import { utils, write } from "xlsx";

import { buildPdfBuffer, makeBox, makeRule, makeTextLine } from "@/lib/pdf-builder";

export type ItemsListRow = {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  company: string;
  unit: string;
  buyingPrice: number;
  sellingPrice: number;
  minimumStockAlert: number;
  status: string;
  createdAt: string;
};

export function buildItemsListFileName(ext: "pdf" | "xlsx") {
  return `Items-List.${ext}`;
}

export function buildItemsListExcelBuffer(rows: ItemsListRow[]) {
  const workbook = utils.book_new();
  const sheet = utils.json_to_sheet(
    rows.map((row) => ({
      "Item Code": row.sku,
      "Item Name": row.name,
      Category: row.category,
      Brand: row.brand,
      Company: row.company,
      "Unit": row.unit,
      "Buying Price": row.buyingPrice,
      "Selling Price": row.sellingPrice,
      "Minimum Stock Alert": row.minimumStockAlert,
      Status: row.status,
      "Created Date": row.createdAt,
    })),
  );

  utils.book_append_sheet(workbook, sheet, "Items List");
  return write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function buildItemsListPdfBuffer(rows: ItemsListRow[]) {
  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const left = 24;
  const right = pageWidth - 24;
  const colWidths = [58, 175, 88, 78, 85, 68, 84, 84];
  const colStarts = [left];
  for (let i = 0; i < colWidths.length - 1; i += 1) {
    colStarts.push((colStarts[i] ?? left) + (colWidths[i] ?? 0));
  }

  type Page = { ops: string[]; y: number };
  const pages: Page[] = [{ ops: [], y: pageHeight - 28 }];
  const current = () => pages[pages.length - 1]!;
  const nextPage = () => pages.push({ ops: [], y: pageHeight - 28 });

  const header = () => {
    const page = current();
    page.ops.push(makeTextLine(left, page.y, "Demo ERP - Items List Report", 16, true));
    page.ops.push(makeTextLine(right - 160, page.y, format(new Date(), "dd MMM yyyy"), 10, true));
    page.ops.push(makeRule(left, page.y - 9, right, page.y - 9));
    page.y -= 22;
    page.ops.push(makeBox(left, page.y - 5, right - left, 22));
    const titles = ["Item Code", "Item Name", "Category", "Brand", "Company", "Unit", "Buy Price", "Sell Price"];
    titles.forEach((title, index) => {
      page.ops.push(makeTextLine((colStarts[index] ?? left) + 4, page.y + 9, title, 9, true));
    });
  };

  header();

  let y = current().y - 12;
  rows.forEach((row) => {
    if (y < 50) {
      nextPage();
      header();
      y = current().y - 12;
    }

    current().ops.push(makeTextLine((colStarts[0] ?? left) + 4, y, row.sku, 8));
    current().ops.push(makeTextLine((colStarts[1] ?? left) + 4, y, row.name.length > 24 ? `${row.name.slice(0, 24)}...` : row.name, 8));
    current().ops.push(makeTextLine((colStarts[2] ?? left) + 4, y, row.category, 8));
    current().ops.push(makeTextLine((colStarts[3] ?? left) + 4, y, row.brand, 8));
    current().ops.push(makeTextLine((colStarts[4] ?? left) + 4, y, row.company, 8));
    current().ops.push(makeTextLine((colStarts[5] ?? left) + 4, y, row.unit, 8));
    current().ops.push(makeTextLine((colStarts[6] ?? left) + 4, y, row.buyingPrice.toFixed(2), 8));
    current().ops.push(makeTextLine((colStarts[7] ?? left) + 4, y, row.sellingPrice.toFixed(2), 8));
    current().ops.push(makeRule(left, y - 3, right, y - 3));
    y -= 16;
  });

  current().ops.push(makeRule(left, 34, right, 34));
  current().ops.push(makeTextLine(left, 20, "Exported from Demo ERP operational system.", 9, true));

  return buildPdfBuffer(pages, { width: pageWidth, height: pageHeight });
}