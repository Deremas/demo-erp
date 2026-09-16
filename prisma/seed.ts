import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { hashPassword } from "../lib/auth/password";
import {
  AccountType,
  AppRole,
  LedgerDirection,
  LedgerEntryType,
  LocationType,
  Prisma,
  PrismaClient,
} from "../generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run the seed script.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const isProduction = process.env.NODE_ENV === "production";
const seedDemoData = process.env.SEED_DEMO_DATA === "true";
const createSalesUser = process.env.SEED_CREATE_SALES_USER === "true";
const updateSeededPasswords = process.env.SEED_UPDATE_PASSWORDS === "true";

function requiredSeedSecret(name: string, fallbackForDevelopment?: string) {
  const value = process.env[name]?.trim();
  if (value) return value;

  if (!isProduction && fallbackForDevelopment) {
    return fallbackForDevelopment;
  }

  throw new Error(`${name} must be set before running production seed.`);
}

function money(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

async function seedCompanySettings() {
  const existing = await prisma.companySettings.findFirst();
  const data = {
    name: process.env.SEED_COMPANY_NAME || "Demo ERP",
    tin: process.env.SEED_COMPANY_TIN || "0042571273",
    address: process.env.SEED_COMPANY_ADDRESS || "Addis Ababa, Ethiopia",
    phone: process.env.SEED_COMPANY_PHONE || "+251 911 000 000",
    email: process.env.SEED_COMPANY_EMAIL || null,
    currencySymbol: process.env.SEED_CURRENCY_SYMBOL || "ETB",
    weeklyBackupEnabled: process.env.SEED_WEEKLY_BACKUP_ENABLED === "true",
  };

  if (existing) {
    await prisma.companySettings.update({
      where: { id: existing.id },
      data,
    });
    return;
  }

  await prisma.companySettings.create({ data });
}

async function seedLocations() {
  const locations = [
    // Stores
    { code: "DJIBOUTI", name: "Djibouti", type: LocationType.STORE, location: "Djibouti" },
    { code: "ADDIS-ABABA", name: "Addis Ababa", type: LocationType.STORE, location: "Addis Ababa" },
    { code: "ADDIS-WAREHOUSE", name: "Addis Ababa Warehouse", type: LocationType.WAREHOUSE, location: "Addis Ababa" },
    // Shops
    { code: "SHALA", name: "Shala", type: LocationType.SHOP, location: "Addis Ababa" },
    { code: "SABON", name: "Sabon", type: LocationType.SHOP, location: "Addis Ababa" },
    { code: "SUMMIT", name: "Summit", type: LocationType.SHOP, location: "Addis Ababa" },
    { code: "BISRATE-GABRIEL", name: "Bisrate Gabriel", type: LocationType.SHOP, location: "Addis Ababa" },
    { code: "BOLE", name: "Bole", type: LocationType.SHOP, location: "Addis Ababa" },
    { code: "DIPLOMATIC", name: "Diplomatic", type: LocationType.SHOP, location: "Addis Ababa" },
    { code: "BAHIRDAR", name: "Bahirdar", type: LocationType.SHOP, location: "Bahir Dar" },
    { code: "MEKELLE", name: "Mekelle", type: LocationType.SHOP, location: "Mekelle" },
    { code: "SHIRE", name: "Shire", type: LocationType.SHOP, location: "Shire" },
  ];

  const seeded = [];
  for (const location of locations) {
    const row = await prisma.location.upsert({
      where: { code: location.code },
      update: {
        name: location.name,
        type: location.type,
        location: location.location,
        isActive: true,
      },
      create: {
        code: location.code,
        name: location.name,
        type: location.type,
        location: location.location,
        isActive: true,
      },
    });
    seeded.push(row);
  }

  return seeded;
}

async function ensureCredentialAccount(userId: string, password: string) {
  const passwordHash = await hashPassword(password);
  const existing = await prisma.account.findFirst({
    where: {
      userId,
      providerId: "credential",
    },
  });

  if (existing) {
    if (updateSeededPasswords) {
      await prisma.account.update({
        where: { id: existing.id },
        data: {
          accountId: userId,
          password: passwordHash,
        },
      });
    }
    return;
  }

  await prisma.account.create({
    data: {
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
    },
  });
}

async function assignUserToLocations(userId: string, locations: Awaited<ReturnType<typeof seedLocations>>, defaultLocationId: string) {
  for (const location of locations) {
    await prisma.userBranch.upsert({
      where: {
        userId_locationId: {
          userId,
          locationId: location.id,
        },
      },
      update: {
        isDefault: location.id === defaultLocationId,
        isActive: true,
      },
      create: {
        userId,
        locationId: location.id,
        isDefault: location.id === defaultLocationId,
        isActive: true,
      },
    });
  }
}

async function seedUsers(locations: Awaited<ReturnType<typeof seedLocations>>) {
  const defaultLocation = locations[0];
  if (!defaultLocation) {
    throw new Error("At least one location is required before seeding users.");
  }

  const adminPassword = process.env.SEED_ADMIN_PASSWORD?.trim() || "1234";
  const adminUsername = process.env.SEED_ADMIN_USERNAME || "admin";
  const adminName = process.env.SEED_ADMIN_NAME || "Demo Admin";

  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      name: adminName,
      displayName: adminName,
      displayUsername: adminUsername,
      role: AppRole.ADMIN,
      isActive: true,
      defaultLocationId: defaultLocation.id,
    },
    create: {
      name: adminName,
      username: adminUsername,
      displayUsername: adminUsername,
      displayName: adminName,
      role: AppRole.ADMIN,
      isActive: true,
      defaultLocationId: defaultLocation.id,
    },
  });

  await ensureCredentialAccount(admin.id, adminPassword);
  await assignUserToLocations(admin.id, locations, defaultLocation.id);

  if (!createSalesUser) return;

  const salesPassword = requiredSeedSecret("SEED_SALES_PASSWORD", "change-sales-password");
  const salesUsername = process.env.SEED_SALES_USERNAME || "sales";
  const salesName = process.env.SEED_SALES_NAME || "Rungo Sales";

  const sales = await prisma.user.upsert({
    where: { username: salesUsername },
    update: {
      name: salesName,
      displayName: salesName,
      displayUsername: salesUsername,
      role: AppRole.SALES,
      isActive: true,
      defaultLocationId: defaultLocation.id,
    },
    create: {
      name: salesName,
      username: salesUsername,
      displayUsername: salesUsername,
      displayName: salesName,
      role: AppRole.SALES,
      isActive: true,
      defaultLocationId: defaultLocation.id,
    },
  });

  await ensureCredentialAccount(sales.id, salesPassword);
  await assignUserToLocations(sales.id, locations, defaultLocation.id);
}


async function seedUnits() {
  const units = [
    { id: "unit_bottle", name: "bottle" },
    { id: "unit_case", name: "case" },
    { id: "unit_piece", name: "piece" },
  ];

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { id: unit.id },
      update: { name: unit.name, isActive: true },
      create: { id: unit.id, name: unit.name, isActive: true },
    });
  }
}

async function seedCatalogMasters() {
  const categories = ["Whisky", "Vodka", "Gin", "Rum", "Wine", "Beer", "Tequila", "Other"];
  const expenseCategories = ["Rent", "Transport", "Utilities", "Salary", "Other"];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true },
    });
  }

  for (const name of expenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true },
    });
  }
}

async function seedFinanceAccounts() {
  const cashAccount = await prisma.financeAccount.upsert({
    where: { code: "CENTRAL-CASH" },
    update: {
      name: "Central Cash",
      type: AccountType.CASH,
      isActive: true,
    },
    create: {
      code: "CENTRAL-CASH",
      name: "Central Cash",
      type: AccountType.CASH,
      isActive: true,
    },
  });

  const existingOpening = await prisma.ledgerEntry.findFirst({
    where: {
      entryType: LedgerEntryType.OPENING_BALANCE,
      referenceType: "FinanceAccount",
      referenceId: cashAccount.id,
    },
  });

  if (!existingOpening) {
    await prisma.ledgerEntry.create({
      data: {
        entryDate: new Date(),
        financeAccountId: cashAccount.id,
        direction: LedgerDirection.DEBIT,
        amount: money(0),
        entryType: LedgerEntryType.OPENING_BALANCE,
        referenceType: "FinanceAccount",
        referenceId: cashAccount.id,
        description: `Opening balance for ${cashAccount.name}`,
      },
    });
  }
}

async function seedDemoCatalog() {
  if (!seedDemoData) return;

  const demoBrand = await prisma.brand.upsert({
    where: { name: "Demo Brand" },
    update: { isActive: true },
    create: { name: "Demo Brand", isActive: true },
  });
  const demoCompany = await prisma.company.upsert({
    where: { name: "Demo Company" },
    update: { isActive: true },
    create: { name: "Demo Company", isActive: true },
  });
  const category = await prisma.category.findUnique({ where: { name: "Other" } });
  if (!category) throw new Error("Other category was not seeded.");

  await prisma.product.upsert({
    where: { sku: "DEMO-ITEM-001" },
    update: {
      isActive: true,
      categoryId: category.id,
      brandId: demoBrand.id,
      companyId: demoCompany.id,
      unitId: "unit_bottle",
      buyingPrice: money(100),
      sellingPrice: money(150),
    },
    create: {
      sku: "DEMO-ITEM-001",
      name: "Demo Item 750ml",
      categoryId: category.id,
      brandId: demoBrand.id,
      companyId: demoCompany.id,
      unitId: "unit_bottle",
      buyingPrice: money(100),
      sellingPrice: money(150),
      minimumStockAlert: 10,
      isActive: true,
    },
  });
}

async function seedAgentsAndCustomers() {
  const parties = [
    { name: "Bole Agent", businessName: "Bole Distribution", partyType: "AGENT", creditLimit: 150000, phone: "+251 911 100 001" },
    { name: "Summit Agent", businessName: "Summit Liquor Agent", partyType: "AGENT", creditLimit: 80000, phone: "+251 911 100 002" },
    { name: "Hotel Walk-in Desk", businessName: "Rungo Hotel Counter", partyType: "CUSTOMER", creditLimit: 25000, phone: "+251 911 100 003" },
  ];

  for (const party of parties) {
    const existing = await prisma.customer.findFirst({ where: { name: party.name } });
    if (existing) {
      await prisma.customer.update({
        where: { id: existing.id },
        data: {
          businessName: party.businessName,
          partyType: party.partyType,
          creditLimit: money(party.creditLimit),
          phone: party.phone,
          isActive: true,
        },
      });
      continue;
    }

    await prisma.customer.create({
      data: {
        name: party.name,
        businessName: party.businessName,
        partyType: party.partyType,
        creditLimit: money(party.creditLimit),
        phone: party.phone,
        isActive: true,
      },
    });
  }
}

async function main() {
  const locations = await seedLocations();
  await seedCompanySettings();
  await seedUsers(locations);
  await seedUnits();
  await seedCatalogMasters();
  await seedFinanceAccounts();
  await seedDemoCatalog();
  await seedAgentsAndCustomers();

  console.log("Demo ERP production seed completed.");
  console.log(`Admin user ensured: ${process.env.SEED_ADMIN_USERNAME || "admin"}`);
  if (!seedDemoData) {
    console.log("Demo catalog data skipped. Set SEED_DEMO_DATA=true only for sandbox/demo databases.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
