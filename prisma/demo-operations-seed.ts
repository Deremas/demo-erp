import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import {
  AccountType,
  LedgerDirection,
  LedgerEntryType,
  PaymentStatus,
  Prisma,
  PrismaClient,
  PurchaseStatus,
  SalePaymentMethod,
  SaleStatus,
  StockMovementType,
  TransferStatus,
} from "../generated/prisma/client";

const USD_RATE = 138;

type SeedClient = PrismaClient;

type DemoItem = {
  sku: string;
  name: string;
  category: string;
  unitId: string;
  buyingPrice: number;
  sellingPrice: number;
  minimumStockAlert: number;
  usdCost?: number;
  kind: "import" | "local";
};

const DEMO_ITEMS: DemoItem[] = [
  { sku: "DEMO-JW-BLACK", name: "Johnnie Walker Black 75cl", category: "Whisky", unitId: "unit_bottle", buyingPrice: 3864, sellingPrice: 6500, minimumStockAlert: 12, usdCost: 28, kind: "import" },
  { sku: "DEMO-JW-BLUE", name: "Johnnie Walker Blue 75cl", category: "Whisky", unitId: "unit_bottle", buyingPrice: 25530, sellingPrice: 42000, minimumStockAlert: 4, usdCost: 185, kind: "import" },
  { sku: "DEMO-JAMESON", name: "Jameson 70cl", category: "Whisky", unitId: "unit_bottle", buyingPrice: 3036, sellingPrice: 4800, minimumStockAlert: 10, usdCost: 22, kind: "import" },
  { sku: "DEMO-JD", name: "Jack Daniel's 70cl", category: "Whisky", unitId: "unit_bottle", buyingPrice: 3312, sellingPrice: 5200, minimumStockAlert: 10, usdCost: 24, kind: "import" },
  { sku: "DEMO-CHIVAS12", name: "Chivas 12 70cl", category: "Whisky", unitId: "unit_bottle", buyingPrice: 4416, sellingPrice: 7800, minimumStockAlert: 8, usdCost: 32, kind: "import" },
  { sku: "DEMO-ABSOLUT", name: "Absolut Blue 100cl", category: "Vodka", unitId: "unit_bottle", buyingPrice: 1932, sellingPrice: 3800, minimumStockAlert: 12, usdCost: 14, kind: "import" },
  { sku: "DEMO-GREYGOOSE", name: "Grey Goose 70cl", category: "Vodka", unitId: "unit_bottle", buyingPrice: 5244, sellingPrice: 9800, minimumStockAlert: 10, usdCost: 38, kind: "import" },
  { sku: "DEMO-GORDONS", name: "Gordon's 70cl", category: "Gin", unitId: "unit_bottle", buyingPrice: 1656, sellingPrice: 3200, minimumStockAlert: 10, usdCost: 12, kind: "import" },
  { sku: "DEMO-BOMBAY", name: "Bombay Sapphire 70cl", category: "Gin", unitId: "unit_bottle", buyingPrice: 2760, sellingPrice: 5400, minimumStockAlert: 8, usdCost: 20, kind: "import" },
  { sku: "DEMO-HENNY-VS", name: "Hennessy VS 70cl", category: "Cognac", unitId: "unit_bottle", buyingPrice: 5796, sellingPrice: 11000, minimumStockAlert: 6, usdCost: 42, kind: "import" },
  { sku: "DEMO-HENNY-XO", name: "Hennessy XO 70cl", category: "Cognac", unitId: "unit_bottle", buyingPrice: 22080, sellingPrice: 38000, minimumStockAlert: 3, usdCost: 160, kind: "import" },
  { sku: "DEMO-BACARDI", name: "Bacardi Carta Blanca 100cl", category: "Rum", unitId: "unit_bottle", buyingPrice: 1794, sellingPrice: 3400, minimumStockAlert: 8, usdCost: 13, kind: "import" },
  { sku: "DEMO-1800", name: "1800 Reposado 70cl", category: "Tequila", unitId: "unit_bottle", buyingPrice: 3588, sellingPrice: 7200, minimumStockAlert: 6, usdCost: 26, kind: "import" },
  { sku: "DEMO-BAILEYS", name: "Baileys 70cl", category: "Liqueur", unitId: "unit_bottle", buyingPrice: 2484, sellingPrice: 4600, minimumStockAlert: 8, usdCost: 18, kind: "import" },
  { sku: "DEMO-JAGER", name: "Jägermeister 70cl", category: "Liqueur", unitId: "unit_bottle", buyingPrice: 2208, sellingPrice: 4200, minimumStockAlert: 8, usdCost: 16, kind: "import" },
  { sku: "DEMO-MOET", name: "Moët Brut 75cl", category: "Champagne", unitId: "unit_bottle", buyingPrice: 6624, sellingPrice: 12500, minimumStockAlert: 4, usdCost: 48, kind: "import" },
  { sku: "DEMO-19CRIMES", name: "19 Crimes Shiraz 75cl", category: "Wine", unitId: "unit_bottle", buyingPrice: 1242, sellingPrice: 2800, minimumStockAlert: 12, usdCost: 9, kind: "import" },
  { sku: "DEMO-WOLFB", name: "Wolf Blass Cab Sauv 75cl", category: "Wine", unitId: "unit_bottle", buyingPrice: 1518, sellingPrice: 3200, minimumStockAlert: 10, usdCost: 11, kind: "import" },
  { sku: "DEMO-HEINEKEN", name: "Heineken 33cl", category: "Beer", unitId: "unit_piece", buyingPrice: 85, sellingPrice: 180, minimumStockAlert: 80, kind: "local" },
  { sku: "DEMO-CORONA", name: "Corona Extra 33cl", category: "Beer", unitId: "unit_piece", buyingPrice: 95, sellingPrice: 220, minimumStockAlert: 40, kind: "local" },
  { sku: "DEMO-REDBULL", name: "Red Bull 250ml", category: "Energy", unitId: "unit_piece", buyingPrice: 110, sellingPrice: 250, minimumStockAlert: 40, kind: "local" },
  { sku: "DEMO-WATER", name: "Still water 500ml", category: "Water", unitId: "unit_piece", buyingPrice: 12, sellingPrice: 25, minimumStockAlert: 50, kind: "local" },
  { sku: "DEMO-NUTS", name: "Mixed nuts 200g", category: "Snacks", unitId: "unit_piece", buyingPrice: 80, sellingPrice: 180, minimumStockAlert: 15, kind: "local" },
  { sku: "DEMO-SYRUP", name: "Almond syrup 70cl", category: "Syrup", unitId: "unit_bottle", buyingPrice: 420, sellingPrice: 950, minimumStockAlert: 8, kind: "local" },
];

const IMPORT_QTY: Record<string, number> = {
  "DEMO-JW-BLACK": 120,
  "DEMO-JW-BLUE": 18,
  "DEMO-JAMESON": 60,
  "DEMO-JD": 72,
  "DEMO-CHIVAS12": 36,
  "DEMO-ABSOLUT": 96,
  "DEMO-GREYGOOSE": 12,
  "DEMO-GORDONS": 80,
  "DEMO-BOMBAY": 36,
  "DEMO-HENNY-VS": 40,
  "DEMO-HENNY-XO": 10,
  "DEMO-BACARDI": 48,
  "DEMO-1800": 24,
  "DEMO-BAILEYS": 36,
  "DEMO-JAGER": 30,
  "DEMO-MOET": 16,
  "DEMO-19CRIMES": 60,
  "DEMO-WOLFB": 48,
};

const LOCAL_QTY: Record<string, number> = {
  "DEMO-HEINEKEN": 240,
  "DEMO-REDBULL": 120,
  "DEMO-WATER": 200,
  "DEMO-NUTS": 40,
  "DEMO-SYRUP": 18,
};

function money(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

function daysAgo(days: number) {
  const date = new Date();
  date.setHours(10, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

async function recordMovement(
  tx: Prisma.TransactionClient,
  balances: Map<string, number>,
  data: {
    locationId: string;
    productId: string;
    movementType: StockMovementType;
    quantity: number;
    unitCost?: Prisma.Decimal;
    unitValue?: Prisma.Decimal;
    movementDate: Date;
    sourceType: string;
    sourceId: string;
    sourceLineId?: string;
    counterpartyType?: string;
    counterpartyId?: string;
  },
) {
  const key = `${data.locationId}:${data.productId}`;
  const current = balances.get(key) ?? 0;
  const balanceAfter = current + data.quantity;
  balances.set(key, balanceAfter);
  return tx.stockMovement.create({
    data: {
      ...data,
      balanceAfter,
    },
  });
}

async function syncAlert(
  tx: Prisma.TransactionClient,
  locationId: string,
  productId: string,
  threshold: number,
  evaluatedAt: Date,
) {
  const aggregate = await tx.stockMovement.aggregate({
    where: { locationId, productId },
    _sum: { quantity: true },
  });
  const totalQuantity = aggregate._sum.quantity ?? 0;
  const existing = await tx.alertRecord.findFirst({
    where: { locationId, productId },
    orderBy: { evaluatedAt: "desc" },
    select: { id: true },
  });

  if (totalQuantity > threshold) return totalQuantity;

  if (existing) {
    await tx.alertRecord.update({
      where: { id: existing.id },
      data: { threshold, currentQty: totalQuantity, evaluatedAt },
    });
  } else {
    await tx.alertRecord.create({
      data: { locationId, productId, threshold, currentQty: totalQuantity, evaluatedAt },
    });
  }
  return totalQuantity;
}

async function requireLocation(prisma: SeedClient, code: string) {
  const location = await prisma.location.findUnique({ where: { code } });
  if (!location) throw new Error(`Location ${code} was not seeded.`);
  return location;
}

async function upsertCashAccount(prisma: SeedClient, code: string, name: string, locationId: string) {
  return prisma.financeAccount.upsert({
    where: { code },
    update: { name, type: AccountType.CASH, locationId, isActive: true },
    create: { code, name, type: AccountType.CASH, locationId, isActive: true },
  });
}

export async function seedDemoOperations(prisma: SeedClient) {
  for (const unit of [
    { id: "unit_bottle", name: "bottle" },
    { id: "unit_case", name: "case" },
    { id: "unit_piece", name: "piece" },
  ]) {
    await prisma.unit.upsert({
      where: { id: unit.id },
      update: { name: unit.name, isActive: true },
      create: { id: unit.id, name: unit.name, isActive: true },
    });
  }

  const warehouse = await requireLocation(prisma, "ADDIS-WAREHOUSE");
  const bole = await requireLocation(prisma, "BOLE");
  const shala = await requireLocation(prisma, "SHALA");
  const summit = await requireLocation(prisma, "SUMMIT");

  const admin =
    (await prisma.user.findUnique({ where: { username: process.env.SEED_ADMIN_USERNAME || "admin" } })) ??
    (await prisma.user.findFirst({ where: { role: "ADMIN" } }));
  if (!admin) throw new Error("An admin user is required before seeding demo operations.");

  const categoryNames = [...new Set(DEMO_ITEMS.map((item) => item.category))];
  const categoryByName = new Map<string, string>();
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true },
    });
    categoryByName.set(name, category.id);
  }

  const products = new Map<string, { id: string; sellingPrice: Prisma.Decimal; buyingPrice: Prisma.Decimal; minimumStockAlert: number }>();
  for (const item of DEMO_ITEMS) {
    const categoryId = categoryByName.get(item.category);
    if (!categoryId) throw new Error(`Missing category ${item.category}`);
    const product = await prisma.product.upsert({
      where: { sku: item.sku },
      update: {
        name: item.name,
        categoryId,
        unitId: item.unitId,
        buyingPrice: money(item.buyingPrice),
        sellingPrice: money(item.sellingPrice),
        minimumStockAlert: item.minimumStockAlert,
        isActive: true,
      },
      create: {
        sku: item.sku,
        name: item.name,
        categoryId,
        unitId: item.unitId,
        buyingPrice: money(item.buyingPrice),
        sellingPrice: money(item.sellingPrice),
        minimumStockAlert: item.minimumStockAlert,
        isActive: true,
      },
    });
    products.set(item.sku, product);
  }

  const importSupplier = await prisma.supplier.upsert({
    where: { name: "Global Spirits Import" },
    update: { phone: "+253 21 350000", address: "Djibouti Free Zone", isActive: true },
    create: { name: "Global Spirits Import", phone: "+253 21 350000", address: "Djibouti Free Zone", isActive: true },
  });
  const localSupplier = await prisma.supplier.upsert({
    where: { name: "Addis Beverage Distributors" },
    update: { phone: "+251 911 200 100", address: "Addis Ababa", isActive: true },
    create: { name: "Addis Beverage Distributors", phone: "+251 911 200 100", address: "Addis Ababa", isActive: true },
  });

  const boleAgent = await prisma.customer.upsert({
    where: { id: (await prisma.customer.findFirst({ where: { name: "Bole Agent" } }))?.id ?? "bole-agent-seed" },
    update: {
      name: "Bole Agent",
      businessName: "Bole Distribution",
      partyType: "AGENT",
      creditLimit: money(150000),
      phone: "+251 911 100 001",
      isActive: true,
    },
    create: {
      id: "bole-agent-seed",
      name: "Bole Agent",
      businessName: "Bole Distribution",
      partyType: "AGENT",
      creditLimit: money(150000),
      phone: "+251 911 100 001",
      isActive: true,
    },
  });

  const warehouseCash = await upsertCashAccount(prisma, "ADDIS-WH-CASH", "Addis Warehouse Cash", warehouse.id);
  const boleCash = await upsertCashAccount(prisma, "BOLE-CASH", "Bole Shop Cash", bole.id);

  const existingImport = await prisma.purchase.findUnique({ where: { purchaseNumber: "DEMO-IMP-001" } });
  if (existingImport) {
    console.log("Demo operations already exist (DEMO-IMP-001). Catalog items refreshed.");
    return;
  }

  const importAt = daysAgo(10);
  const localAt = daysAgo(8);
  const transferAt = daysAgo(7);
  const posAt = daysAgo(2);
  const wholesaleAt = daysAgo(1);

  await prisma.$transaction(
    async (tx) => {
    const balances = new Map<string, number>();
    const importLines = DEMO_ITEMS.filter((item) => item.kind === "import").map((item) => {
      const product = products.get(item.sku)!;
      const qty = IMPORT_QTY[item.sku] ?? 0;
      const usdCost = item.usdCost ?? 0;
      const unitCostEtb = usdCost * USD_RATE;
      return { item, product, qty, usdCost, unitCostEtb, lineUsd: qty * usdCost, lineEtb: qty * unitCostEtb };
    });
    const usdTotal = Number(importLines.reduce((sum, line) => sum + line.lineUsd, 0).toFixed(2));
    const etbTotal = Number((usdTotal * USD_RATE).toFixed(2));
    const usdPaid = Number((usdTotal * 0.4).toFixed(2));
    const etbPaid = Number((usdPaid * USD_RATE).toFixed(2));

    const importPurchase = await tx.purchase.create({
      data: {
        purchaseNumber: "DEMO-IMP-001",
        invoiceNumber: "GSI-88421",
        locationId: warehouse.id,
        supplierId: importSupplier.id,
        createdById: admin.id,
        status: PurchaseStatus.POSTED,
        paymentStatus: PaymentStatus.PARTIAL,
        subtotal: money(etbTotal),
        total: money(etbTotal),
        amountPaid: money(etbPaid),
        amountDue: money(etbTotal - etbPaid),
        trackInUsd: true,
        exchangeRate: money(USD_RATE),
        usdTotal: money(usdTotal),
        usdAmountPaid: money(usdPaid),
        purchasedAt: importAt,
        note: "USD import received into Addis warehouse.",
      },
    });

    await tx.exchangeRateHistory.create({
      data: {
        currency: "USD",
        rate: money(USD_RATE),
        sourceType: "Purchase",
        sourceId: importPurchase.id,
        recordedById: admin.id,
        note: `Import ${importPurchase.purchaseNumber}: ${usdTotal} USD @ ${USD_RATE}`,
        recordedAt: importAt,
      },
    });

    for (const line of importLines) {
      const purchaseItem = await tx.purchaseItem.create({
        data: {
          purchaseId: importPurchase.id,
          productId: line.product.id,
          quantity: line.qty,
          unitCost: money(line.unitCostEtb),
          sellingPrice: line.product.sellingPrice,
          lineTotal: money(line.lineEtb),
        },
      });
      await recordMovement(tx, balances, {
        locationId: warehouse.id,
        productId: line.product.id,
        movementType: StockMovementType.PURCHASE,
        quantity: line.qty,
        unitCost: money(line.unitCostEtb),
        unitValue: line.product.sellingPrice,
        movementDate: importAt,
        sourceType: "Purchase",
        sourceId: importPurchase.id,
        sourceLineId: purchaseItem.id,
        counterpartyType: "Supplier",
        counterpartyId: importSupplier.id,
      });
    }

    const importPayment = await tx.supplierPayment.create({
      data: {
        paymentNumber: "DEMO-SPM-001",
        supplierId: importSupplier.id,
        purchaseId: importPurchase.id,
        locationId: warehouse.id,
        financeAccountId: warehouseCash.id,
        recordedById: admin.id,
        amount: money(etbPaid),
        isUsd: true,
        exchangeRate: money(USD_RATE),
        paymentDate: importAt,
        note: `Partial USD payment ${usdPaid} @ ${USD_RATE}`,
      },
    });
    await tx.ledgerEntry.create({
      data: {
        entryDate: importAt,
        locationId: warehouse.id,
        financeAccountId: warehouseCash.id,
        direction: LedgerDirection.CREDIT,
        amount: money(etbPaid),
        entryType: LedgerEntryType.SUPPLIER_PAYMENT,
        referenceType: "SupplierPayment",
        referenceId: importPayment.id,
        description: `Partial import payment for DEMO-IMP-001 (${usdPaid} USD)`,
      },
    });

    const localLines = DEMO_ITEMS.filter((item) => LOCAL_QTY[item.sku]).map((item) => {
      const product = products.get(item.sku)!;
      const qty = LOCAL_QTY[item.sku]!;
      const unitCost = Number(product.buyingPrice);
      return { item, product, qty, unitCost, lineTotal: qty * unitCost };
    });
    const localTotal = Number(localLines.reduce((sum, line) => sum + line.lineTotal, 0).toFixed(2));

    const localPurchase = await tx.purchase.create({
      data: {
        purchaseNumber: "DEMO-PUR-001",
        invoiceNumber: "ABD-3310",
        locationId: bole.id,
        supplierId: localSupplier.id,
        createdById: admin.id,
        status: PurchaseStatus.POSTED,
        paymentStatus: PaymentStatus.PAID,
        subtotal: money(localTotal),
        total: money(localTotal),
        amountPaid: money(localTotal),
        amountDue: money(0),
        purchasedAt: localAt,
        note: "Local ETB purchase into Bole shop.",
      },
    });

    for (const line of localLines) {
      const purchaseItem = await tx.purchaseItem.create({
        data: {
          purchaseId: localPurchase.id,
          productId: line.product.id,
          quantity: line.qty,
          unitCost: money(line.unitCost),
          sellingPrice: line.product.sellingPrice,
          lineTotal: money(line.lineTotal),
        },
      });
      await recordMovement(tx, balances, {
        locationId: bole.id,
        productId: line.product.id,
        movementType: StockMovementType.PURCHASE,
        quantity: line.qty,
        unitCost: money(line.unitCost),
        unitValue: line.product.sellingPrice,
        movementDate: localAt,
        sourceType: "Purchase",
        sourceId: localPurchase.id,
        sourceLineId: purchaseItem.id,
        counterpartyType: "Supplier",
        counterpartyId: localSupplier.id,
      });
    }

    const localPayment = await tx.supplierPayment.create({
      data: {
        paymentNumber: "DEMO-SPM-002",
        supplierId: localSupplier.id,
        purchaseId: localPurchase.id,
        locationId: bole.id,
        financeAccountId: boleCash.id,
        recordedById: admin.id,
        amount: money(localTotal),
        paymentDate: localAt,
        note: "Full payment for local Bole purchase.",
      },
    });
    await tx.ledgerEntry.create({
      data: {
        entryDate: localAt,
        locationId: bole.id,
        financeAccountId: boleCash.id,
        direction: LedgerDirection.CREDIT,
        amount: money(localTotal),
        entryType: LedgerEntryType.SUPPLIER_PAYMENT,
        referenceType: "SupplierPayment",
        referenceId: localPayment.id,
        description: "Local purchase payment for DEMO-PUR-001",
      },
    });

    const transfers = [
      {
        number: "DEMO-TRF-001",
        destination: bole,
        note: "Warehouse replenishment to Bole",
        lines: [
          ["DEMO-JW-BLACK", 24],
          ["DEMO-ABSOLUT", 18],
          ["DEMO-GORDONS", 12],
          ["DEMO-JD", 12],
          ["DEMO-19CRIMES", 12],
        ] as const,
      },
      {
        number: "DEMO-TRF-002",
        destination: shala,
        note: "Warehouse replenishment to Shala",
        lines: [
          ["DEMO-JW-BLACK", 18],
          ["DEMO-JAMESON", 12],
          ["DEMO-BAILEYS", 8],
        ] as const,
      },
      {
        number: "DEMO-TRF-003",
        destination: summit,
        note: "Warehouse replenishment to Summit",
        lines: [
          ["DEMO-BOMBAY", 8],
          ["DEMO-HENNY-VS", 6],
          ["DEMO-MOET", 4],
        ] as const,
      },
    ];

    for (const transferDef of transfers) {
      const transfer = await tx.transfer.create({
        data: {
          transferNumber: transferDef.number,
          sourceLocationId: warehouse.id,
          destinationLocationId: transferDef.destination.id,
          status: TransferStatus.RECEIVED,
          note: transferDef.note,
          sentById: admin.id,
          receivedById: admin.id,
          sentAt: transferAt,
          receivedAt: transferAt,
        },
      });
      for (const [sku, qty] of transferDef.lines) {
        const product = products.get(sku)!;
        const transferItem = await tx.transferItem.create({
          data: {
            transferId: transfer.id,
            productId: product.id,
            quantity: qty,
            unitCost: product.buyingPrice,
            sellingPrice: product.sellingPrice,
          },
        });
        await recordMovement(tx, balances, {
          locationId: warehouse.id,
          productId: product.id,
          movementType: StockMovementType.TRANSFER_OUT,
          quantity: -qty,
          unitCost: product.buyingPrice,
          unitValue: product.sellingPrice,
          movementDate: transferAt,
          sourceType: "Transfer",
          sourceId: transfer.id,
          sourceLineId: transferItem.id,
          counterpartyType: "Location",
          counterpartyId: transferDef.destination.id,
        });
        await recordMovement(tx, balances, {
          locationId: transferDef.destination.id,
          productId: product.id,
          movementType: StockMovementType.TRANSFER_IN,
          quantity: qty,
          unitCost: product.buyingPrice,
          unitValue: product.sellingPrice,
          movementDate: transferAt,
          sourceType: "Transfer",
          sourceId: transfer.id,
          sourceLineId: transferItem.id,
          counterpartyType: "Location",
          counterpartyId: warehouse.id,
        });
      }
    }

    const posLines = [
      ["DEMO-HEINEKEN", 12],
      ["DEMO-REDBULL", 8],
      ["DEMO-JW-BLACK", 2],
      ["DEMO-ABSOLUT", 2],
      ["DEMO-GORDONS", 1],
    ] as const;
    const posTotals = posLines.map(([sku, qty]) => {
      const product = products.get(sku)!;
      const unitPrice = Number(product.sellingPrice);
      return { sku, product, qty, unitPrice, lineTotal: qty * unitPrice };
    });
    const posTotal = Number(posTotals.reduce((sum, line) => sum + line.lineTotal, 0).toFixed(2));

    const posSale = await tx.sale.create({
      data: {
        saleNumber: "DEMO-SAL-POS-001",
        locationId: bole.id,
        createdById: admin.id,
        status: SaleStatus.COMPLETED,
        paymentMethod: SalePaymentMethod.CASH,
        paymentStatus: PaymentStatus.PAID,
        subtotal: money(posTotal),
        total: money(posTotal),
        amountPaid: money(posTotal),
        amountDue: money(0),
        soldAt: posAt,
        note: "Walk-in POS sample sale.",
      },
    });
    for (const line of posTotals) {
      const saleItem = await tx.saleItem.create({
        data: {
          saleId: posSale.id,
          productId: line.product.id,
          quantity: line.qty,
          unitPrice: money(line.unitPrice),
          lineTotal: money(line.lineTotal),
        },
      });
      await recordMovement(tx, balances, {
        locationId: bole.id,
        productId: line.product.id,
        movementType: StockMovementType.SALE,
        quantity: -line.qty,
        unitValue: money(line.unitPrice),
        movementDate: posAt,
        sourceType: "Sale",
        sourceId: posSale.id,
        sourceLineId: saleItem.id,
        counterpartyType: "WalkIn",
      });
    }
    await tx.ledgerEntry.create({
      data: {
        entryDate: posAt,
        locationId: bole.id,
        financeAccountId: boleCash.id,
        direction: LedgerDirection.DEBIT,
        amount: money(posTotal),
        entryType: LedgerEntryType.SALE,
        referenceType: "Sale",
        referenceId: posSale.id,
        description: "POS cash sale DEMO-SAL-POS-001",
      },
    });

    const wholesaleLines = [
      ["DEMO-JW-BLUE", 2],
      ["DEMO-HENNY-XO", 1],
      ["DEMO-MOET", 2],
      ["DEMO-GREYGOOSE", 3],
    ] as const;
    const wholesaleTotals = wholesaleLines.map(([sku, qty]) => {
      const product = products.get(sku)!;
      const unitPrice = Number(product.sellingPrice);
      return { sku, product, qty, unitPrice, lineTotal: qty * unitPrice };
    });
    const wholesaleTotal = Number(wholesaleTotals.reduce((sum, line) => sum + line.lineTotal, 0).toFixed(2));

    const wholesaleSale = await tx.sale.create({
      data: {
        saleNumber: "DEMO-SAL-WS-001",
        locationId: warehouse.id,
        customerId: boleAgent.id,
        createdById: admin.id,
        status: SaleStatus.COMPLETED,
        paymentMethod: SalePaymentMethod.CREDIT,
        paymentStatus: PaymentStatus.UNPAID,
        subtotal: money(wholesaleTotal),
        total: money(wholesaleTotal),
        amountPaid: money(0),
        amountDue: money(wholesaleTotal),
        soldAt: wholesaleAt,
        note: "Agent credit wholesale sample.",
      },
    });
    for (const line of wholesaleTotals) {
      const saleItem = await tx.saleItem.create({
        data: {
          saleId: wholesaleSale.id,
          productId: line.product.id,
          quantity: line.qty,
          unitPrice: money(line.unitPrice),
          lineTotal: money(line.lineTotal),
        },
      });
      await recordMovement(tx, balances, {
        locationId: warehouse.id,
        productId: line.product.id,
        movementType: StockMovementType.SALE,
        quantity: -line.qty,
        unitValue: money(line.unitPrice),
        movementDate: wholesaleAt,
        sourceType: "Sale",
        sourceId: wholesaleSale.id,
        sourceLineId: saleItem.id,
        counterpartyType: "Customer",
        counterpartyId: boleAgent.id,
      });
    }

    const alertChecks = [
      { locationId: warehouse.id, sku: "DEMO-GREYGOOSE" },
      { locationId: bole.id, sku: "DEMO-CORONA" },
      { locationId: warehouse.id, sku: "DEMO-CORONA" },
      { locationId: bole.id, sku: "DEMO-HEINEKEN" },
    ];
    for (const check of alertChecks) {
      const product = products.get(check.sku)!;
      await syncAlert(tx, check.locationId, product.id, product.minimumStockAlert, wholesaleAt);
    }
    },
    { maxWait: 20_000, timeout: 180_000 },
  );

  console.log("Demo catalog and operations seeded.");
  console.log("Items: 24  | Import: DEMO-IMP-001  | Local purchase: DEMO-PUR-001");
  console.log("Transfers: DEMO-TRF-001/002/003  | POS: DEMO-SAL-POS-001  | Wholesale: DEMO-SAL-WS-001");
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed demo operations.");
  }

  const connectionString = (() => {
    const url = new URL(process.env.DATABASE_URL);
    url.searchParams.delete("channel_binding");
    url.searchParams.set("sslmode", "require");
    url.searchParams.set("uselibpqcompat", "true");
    return url.toString();
  })();

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  try {
    await seedDemoOperations(prisma);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

const invokedDirectly = process.argv[1]?.includes("demo-operations-seed");
if (invokedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
