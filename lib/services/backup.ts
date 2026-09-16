import fs from "fs";
import path from "path";
import { utils, write } from "xlsx";
import { prisma } from "@/lib/prisma";
import { getBackupsDir } from "@/lib/services/backup-paths";

export { getBackupsDir };

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function serializeRows(rows: unknown[]) {
  return JSON.parse(JSON.stringify(rows));
}

function formatRowValue(key: string, val: unknown): any {
  if (val === null || val === undefined) return "";
  
  if (val instanceof Date) {
    return val.toISOString().replace("T", " ").substring(0, 19);
  }
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
    return val.replace("T", " ").substring(0, 19);
  }

  if (typeof val === "number") {
    const moneyKeys = [
      "price", "cost", "total", "subtotal", "amount", "balance", 
      "buyingPrice", "sellingPrice", "unitCost", "unitPrice", "discount",
      "netTotal", "grossSubtotal", "amountPaid", "amountDue", "balanceDue", "debit", "credit"
    ];
    if (moneyKeys.some(mk => key.toLowerCase().includes(mk.toLowerCase()))) {
      return Math.round(val * 100) / 100;
    }
  }

  return val;
}

function addSheet(workbook: ReturnType<typeof utils.book_new>, name: string, rows: unknown[]) {
  const sheetNamesMapping: Record<string, string> = {
    sales: "Sales List",
    saleItems: "Sold Items Detail",
    purchases: "Purchases List",
    purchaseItems: "Purchased Items Detail",
    stockMovements: "Stock Movement Log",
    ledgerEntries: "Financial Ledger",
    customerPayments: "Customer Payments",
    supplierPayments: "Supplier Payments",
    expenses: "Expenses Log",
    products: "Products Master",
    locations: "Locations Master",
    users: "Users Master",
    companySettings: "System Settings",
  };

  const displayName = sheetNamesMapping[name] || name;
  const safeRows = serializeRows(rows);
  
  const formattedRows = safeRows.map((row: any) => {
    const newRow: any = {};
    for (const [key, val] of Object.entries(row)) {
      newRow[key] = formatRowValue(key, val);
    }
    return newRow;
  });

  const worksheet = utils.json_to_sheet(formattedRows.length ? formattedRows : [{ empty: "No rows" }]);
  utils.book_append_sheet(workbook, worksheet, displayName.slice(0, 31));
}

function writeBackupWorkbook(filePath: string, data: Record<string, unknown[]>) {
  const workbook = utils.book_new();
  for (const [name, rows] of Object.entries(data)) {
    addSheet(workbook, name, rows);
  }
  const buffer = write(workbook, { type: "buffer", bookType: "xlsx" });
  fs.writeFileSync(filePath, buffer);
}

function writeBackupReport(filePath: string, args: {
  baseName: string;
  timestamp: string;
  filters: { dateFrom?: Date; dateTo?: Date };
  data: Record<string, unknown[]>;
}) {
  const rows = Object.entries(args.data)
    .map(([name, items]) => `
      <tr>
        <td>${escapeHtml(name)}</td>
        <td>${items.length.toLocaleString()}</td>
      </tr>
    `)
    .join("");

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(args.baseName)} report</title>
    <style>
      @page { size: A4; margin: 1.5cm; }
      body { font-family: Inter, Arial, sans-serif; color: #000; margin: 0; }
      .page { max-width: 950px; margin: 0 auto; padding: 24px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
      h1 { margin: 0; text-transform: uppercase; font-size: 28px; font-weight: 900; }
      .subtitle { margin-top: 4px; text-transform: uppercase; letter-spacing: 3px; font-weight: 800; color: #555; }
      .box { border: 2px solid #000; padding: 12px; min-width: 260px; font-size: 12px; font-weight: 700; }
      .box-title { border-bottom: 2px solid #000; margin-bottom: 8px; padding-bottom: 4px; font-weight: 900; }
      table { width: 100%; border-collapse: collapse; margin-top: 24px; }
      th, td { border: 1px solid #000; padding: 10px; text-align: left; font-size: 12px; }
      th { background: #f1f5f9; text-transform: uppercase; font-weight: 900; }
      .footer { margin-top: 40px; border-top: 2px solid #000; padding-top: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase; display: flex; justify-content: space-between; }
      @media print { button { display: none; } }
    </style>
  </head>
  <body>
    <div class="page">
      <button onclick="window.print()" style="float:right;margin-bottom:16px;padding:8px 12px;font-weight:800;">Print / Save PDF</button>
      <div class="header">
        <div>
          <h1>Demo ERP</h1>
          <div class="subtitle">Operational System</div>
        </div>
        <div class="box">
          <div class="box-title">BACKUP REPORT</div>
          <div>Generated: ${escapeHtml(args.timestamp)}</div>
          <div>JSON: ${escapeHtml(`${args.baseName}.json`)}</div>
          <div>Excel: ${escapeHtml(`${args.baseName}.xlsx`)}</div>
          <div>From: ${args.filters.dateFrom ? escapeHtml(args.filters.dateFrom.toISOString()) : "Full backup"}</div>
          <div>To: ${args.filters.dateTo ? escapeHtml(args.filters.dateTo.toISOString()) : "Full backup"}</div>
        </div>
      </div>
      <h2>Dataset Summary</h2>
      <table>
        <thead><tr><th>Dataset</th><th>Rows</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">
        <span>Structured JSON and Excel are the reseed sources.</span>
        <span>PDF/print report is for review only.</span>
      </div>
    </div>
  </body>
</html>`;

  fs.writeFileSync(filePath, html);
}

function buildBackupBaseName(prefix: "backup" | "export", date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "long" }).toLowerCase();
  const year = date.getFullYear();
  const time = [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ].join("-");

  return `${prefix}_${day}_${month}_${year}_${time}`;
}

export async function generateSystemBackup(filters?: { dateFrom?: Date; dateTo?: Date }) {
  const { dateFrom, dateTo } = filters || {};
  
  const dateQuery = dateFrom || dateTo ? {
    ...(dateFrom ? { gte: dateFrom } : {}),
    ...(dateTo ? { lte: dateTo } : {}),
  } : undefined;

  const [
    users,
    userBranches,
    locations,
    units,
    categories,
    brands,
    companies,
    products,
    customers,
    suppliers,
    sales,
    saleItems,
    purchases,
    purchaseItems,
    customerPayments,
    supplierPayments,
    transfers,
    transferItems,
    expenseCategories,
    expenses,
    financeAccounts,
    ledgerEntries,
    stockMovements,
    alertRecords,
    auditLogs,
    exchangeRateHistory,
    companySettings,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.userBranch.findMany(),
    prisma.location.findMany(),
    prisma.unit.findMany(),
    prisma.category.findMany(),
    prisma.brand.findMany(),
    prisma.company.findMany(),
    prisma.product.findMany(),
    prisma.customer.findMany(),
    prisma.supplier.findMany(),
    prisma.sale.findMany({
      where: dateQuery ? { soldAt: dateQuery } : {},
    }),
    prisma.saleItem.findMany({
      where: dateQuery ? { sale: { soldAt: dateQuery } } : {},
    }),
    prisma.purchase.findMany({
      where: dateQuery ? { purchasedAt: dateQuery } : {},
    }),
    prisma.purchaseItem.findMany({
      where: dateQuery ? { purchase: { purchasedAt: dateQuery } } : {},
    }),
    prisma.customerPayment.findMany({
      where: dateQuery ? { paymentDate: dateQuery } : {},
    }),
    prisma.supplierPayment.findMany({
      where: dateQuery ? { paymentDate: dateQuery } : {},
    }),
    prisma.transfer.findMany({
      where: dateQuery ? { createdAt: dateQuery } : {},
    }),
    prisma.transferItem.findMany({
      where: dateQuery ? { transfer: { createdAt: dateQuery } } : {},
    }),
    prisma.expenseCategory.findMany(),
    prisma.expense.findMany({
      where: dateQuery ? { expenseDate: dateQuery } : {},
    }),
    prisma.financeAccount.findMany(),
    prisma.ledgerEntry.findMany({
      where: dateQuery ? { createdAt: dateQuery } : {},
    }),
    prisma.stockMovement.findMany({
      where: dateQuery ? { movementDate: dateQuery } : {},
    }),
    prisma.alertRecord.findMany({
      where: dateQuery ? { createdAt: dateQuery } : {},
    }),
    prisma.auditLog.findMany({
      where: dateQuery ? { createdAt: dateQuery } : {},
    }),
    prisma.exchangeRateHistory.findMany({
      where: dateQuery ? { recordedAt: dateQuery } : {},
    }),
    prisma.companySettings.findMany(),
  ]);

  const mainData = {
    users,
    userBranches,
    locations,
    units,
    categories,
    brands,
    companies,
    products,
    customers,
    suppliers,
    sales,
    saleItems,
    purchases,
    purchaseItems,
    customerPayments,
    supplierPayments,
    transfers,
    transferItems,
    expenseCategories,
    expenses,
    financeAccounts,
    ledgerEntries,
    stockMovements,
    alertRecords,
    auditLogs,
    exchangeRateHistory,
    companySettings,
  };

  const generatedAt = new Date();
  const backupData = {
    timestamp: generatedAt.toISOString(),
    version: "1.2.0",
    filters: { dateFrom, dateTo },
    restoreNote: "Use JSON/Excel for reseeding. The HTML report is human-readable and can be printed/saved as PDF.",
    data: mainData,
  };

  const baseName = buildBackupBaseName(dateQuery ? "export" : "backup", generatedAt);
  const fileName = `${baseName}.json`;
  const excelFileName = `${baseName}.xlsx`;
  const reportFileName = `${baseName}_report.html`;
    
  const backupsDir = getBackupsDir();

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const filePath = path.join(backupsDir, fileName);
  const excelPath = path.join(backupsDir, excelFileName);
  const reportPath = path.join(backupsDir, reportFileName);
  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
  writeBackupWorkbook(excelPath, mainData);
  writeBackupReport(reportPath, {
    baseName,
    timestamp: backupData.timestamp,
    filters: {
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    },
    data: mainData,
  });

  const fileSize = fs.statSync(filePath).size + fs.statSync(excelPath).size + fs.statSync(reportPath).size;

  return await prisma.databaseBackup.create({
    data: {
      fileName,
      fileSize,
      status: "SUCCESS",
      dateFrom: dateFrom ?? null,
      dateTo: dateTo ?? null,
    }
  });
}