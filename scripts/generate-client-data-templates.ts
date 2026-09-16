import { mkdirSync } from "node:fs";
import path from "node:path";
import { utils, writeFileXLSX } from "xlsx";

type ColumnDef = {
  header: string;
  required?: boolean;
  example?: string | number;
  note: string;
};

type TemplateDef = {
  fileName: string;
  sheetName: string;
  title: string;
  columns: ColumnDef[];
};

const outputDir = path.join(process.cwd(), "data", "client-data-templates");

const templates: TemplateDef[] = [
  {
    fileName: "01-items-template.xlsx",
    sheetName: "Items",
    title: "Items",
    columns: [
      { header: "Item Name", required: true, example: "Johnnie Walker Black Label 750ml", note: "Required. Product/item name, minimum 2 characters." },
      { header: "SKU / Item Code", example: "JW-BLACK-750", note: "Optional. Leave blank if the system should generate it." },
      { header: "Category", required: true, example: "Whisky", note: "Required. Must match or be created as a category." },
      { header: "Brand", example: "Johnnie Walker", note: "Optional. Must match or be created as a brand." },
      { header: "Brand Owner", example: "Diageo", note: "Optional. This maps to Brand Owner / Company in the system." },
      { header: "Base Unit", required: true, example: "bottle", note: "Required. Smallest selling unit, for example bottle, can, piece." },
      { header: "Package Unit", example: "case", note: "Optional. Outer/package unit, for example case or carton." },
      { header: "Units Per Package", example: 12, note: "Optional. Whole number. Use 1 when not applicable." },
      { header: "Low Stock Alert Qty", example: 10, note: "Optional. Whole number, zero or more." },
      { header: "Base Buying Price", example: 850, note: "Optional. Buying cost for one base unit." },
      { header: "Base Selling Price", example: 1050, note: "Optional. Selling price for one base unit." },
      { header: "Package Buying Price", example: 10200, note: "Optional. Buying cost for one package." },
      { header: "Package Selling Price", example: 12600, note: "Optional. Selling price for one package." },
      { header: "Description", example: "750ml imported whisky", note: "Optional. Maximum 300 characters." },
      { header: "Active", example: "Yes", note: "Optional. Use Yes or No. Blank means Yes." },
    ],
  },
  {
    fileName: "02-brand-owners-template.xlsx",
    sheetName: "Brand Owners",
    title: "Brand Owners",
    columns: [
      { header: "Brand Owner Name", required: true, example: "Diageo", note: "Required. Minimum 2 characters. Also called Company in the system." },
      { header: "Description", example: "International spirits owner", note: "Optional refinement. Useful for notes/reporting even if not shown in every form yet." },
      { header: "Active", example: "Yes", note: "Optional. Use Yes or No. Blank means Yes." },
    ],
  },
  {
    fileName: "03-customers-template.xlsx",
    sheetName: "Customers",
    title: "Customers",
    columns: [
      { header: "Customer Name", required: true, example: "Abebe Kebede", note: "Required. Person or account name, max 120 characters." },
      { header: "Business Name", example: "Sunrise Hotel", note: "Optional. Business/company name, max 120 characters." },
      { header: "TIN Number", example: "0012345678", note: "Optional. Max 40 characters." },
      { header: "Contact Person", example: "Marta Tesfaye", note: "Optional. Main business contact, max 120 characters." },
      { header: "Contact Phone", example: "+251911000000", note: "Optional. Main business contact phone, max 40 characters." },
      { header: "Personal Phone", example: "+251922000000", note: "Optional. Customer personal/direct phone, max 40 characters." },
      { header: "Email", example: "customer@example.com", note: "Optional refinement. The database can store it, although the current quick form focuses on phone/address." },
      { header: "Address", example: "Bole, Addis Ababa", note: "Optional. Store, area, or address, max 160 characters." },
      { header: "Note", example: "Credit customer", note: "Optional refinement for internal notes." },
      { header: "Active", example: "Yes", note: "Optional. Use Yes or No. Blank means Yes." },
    ],
  },
  {
    fileName: "04-suppliers-template.xlsx",
    sheetName: "Suppliers",
    title: "Suppliers",
    columns: [
      { header: "Supplier Name", required: true, example: "Rungo Liquor Supplier", note: "Required. Max 120 characters. Must be unique." },
      { header: "Phone", example: "+251911000000", note: "Optional. Max 40 characters." },
      { header: "Email", example: "supplier@example.com", note: "Optional refinement. The database can store it." },
      { header: "Address", example: "Merkato, Addis Ababa", note: "Optional. Max 160 characters." },
      { header: "Note", example: "Main spirits supplier", note: "Optional refinement for internal notes." },
      { header: "Active", example: "Yes", note: "Optional. Use Yes or No. Blank means Yes." },
    ],
  },
  {
    fileName: "05-categories-template.xlsx",
    sheetName: "Categories",
    title: "Categories",
    columns: [
      { header: "Category Name", required: true, example: "Whisky", note: "Required. Minimum 2 characters. Must be unique." },
      { header: "Description", example: "Whisky and scotch items", note: "Optional refinement. Better than a one-field table for future reporting context." },
      { header: "Active", example: "Yes", note: "Optional. Use Yes or No. Blank means Yes." },
    ],
  },
  {
    fileName: "06-brands-template.xlsx",
    sheetName: "Brands",
    title: "Brands",
    columns: [
      { header: "Brand Name", required: true, example: "Johnnie Walker", note: "Required. Minimum 2 characters. Must be unique." },
      { header: "Description", example: "Scotch whisky brand", note: "Optional refinement. Better than a one-field table for future reporting context." },
      { header: "Active", example: "Yes", note: "Optional. Use Yes or No. Blank means Yes." },
    ],
  },
];

function buildTemplateSheet(template: TemplateDef) {
  const headers = template.columns.map((column) => `${column.header}${column.required ? " *" : ""}`);
  const sampleRow = Object.fromEntries(
    template.columns.map((column) => [
      `${column.header}${column.required ? " *" : ""}`,
      column.example ?? "",
    ]),
  );
  const blankRows = Array.from({ length: 25 }, () => Object.fromEntries(headers.map((header) => [header, ""])));
  const worksheet = utils.json_to_sheet([sampleRow, ...blankRows], { header: headers });
  worksheet["!cols"] = template.columns.map((column) => ({
    wch: Math.max(16, column.header.length + 4, String(column.example ?? "").length + 4),
  }));
  worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };
  return worksheet;
}

function buildNotesSheet(template: TemplateDef) {
  const rows = [
    { Field: "Template", Rule: template.title },
    { Field: "Required Fields", Rule: "Columns with * are required." },
    { Field: "Do Not Rename Headers", Rule: "Please keep the column names unchanged." },
    { Field: "Sample Row", Rule: "Row 2 is an example. Replace or delete it before final import." },
    ...template.columns.map((column) => ({
      Field: `${column.header}${column.required ? " *" : ""}`,
      Rule: column.note,
    })),
  ];
  const worksheet = utils.json_to_sheet(rows);
  worksheet["!cols"] = [{ wch: 28 }, { wch: 90 }];
  return worksheet;
}

mkdirSync(outputDir, { recursive: true });

const combinedWorkbook = utils.book_new();

for (const template of templates) {
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, buildTemplateSheet(template), template.sheetName);
  utils.book_append_sheet(workbook, buildNotesSheet(template), "Instructions");
  writeFileXLSX(workbook, path.join(outputDir, template.fileName));

  utils.book_append_sheet(combinedWorkbook, buildTemplateSheet(template), template.sheetName);
}

const overview = templates.map((template) => ({
  File: template.fileName,
  Sheet: template.sheetName,
  "Required Columns": template.columns
    .filter((column) => column.required)
    .map((column) => column.header)
    .join(", "),
}));
const overviewSheet = utils.json_to_sheet(overview);
overviewSheet["!cols"] = [{ wch: 34 }, { wch: 20 }, { wch: 60 }];
utils.book_append_sheet(combinedWorkbook, overviewSheet, "Overview");
writeFileXLSX(combinedWorkbook, path.join(outputDir, "client-data-collection-all.xlsx"));

console.log(`Generated ${templates.length + 1} Excel files in ${outputDir}`);
