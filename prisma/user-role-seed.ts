import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { hashPassword } from "../lib/auth/password";
import { PrismaClient } from "../generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run the seed script.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function ensureCredentialAccount(userId: string, password: string) {
  const passwordHash = await hashPassword(password);
  const existing = await prisma.account.findFirst({
    where: {
      userId,
      providerId: "credential",
    },
  });

  if (existing) {
    await prisma.account.update({
      where: { id: existing.id },
      data: {
        accountId: userId,
        password: passwordHash,
      },
    });
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

async function main() {
  const locations = await prisma.location.findMany({
    where: { isActive: true },
  });

  const addisAbabaLocation = locations.find((l) => l.code === "ADDIS-ABABA") || locations[0];
  const djiboutiLocation = locations.find((l) => l.code === "DJIBOUTI") || locations[0];

  if (!addisAbabaLocation || !djiboutiLocation) {
    throw new Error("Required locations (Addis Ababa and Djibouti) are missing from the database.");
  }

  const usersToSeed = [
    {
      username: "bethlehem",
      name: "Bethlehem Birhane",
      role: "PURCHASE_ROLE",
      password: "bethlehem123",
      locationsToAssign: locations, // All locations
      defaultLocation: addisAbabaLocation,
    },
    {
      username: "tsega",
      name: "Tsega g/trading",
      role: "SALES_ROLE",
      password: "tsega123",
      locationsToAssign: locations, // All locations
      defaultLocation: addisAbabaLocation,
    },
    {
      username: "teame",
      name: "Teame Nagis",
      role: "ADMIN",
      password: "teame123",
      locationsToAssign: locations, // All locations
      defaultLocation: addisAbabaLocation,
    },
    {
      username: "zelalem",
      name: "Zelalem Endale",
      role: "ADMIN",
      password: "zelalem123",
      locationsToAssign: locations, // All locations
      defaultLocation: addisAbabaLocation,
    },
    {
      username: "awot",
      name: "Awot Hailu",
      role: "STORE_STAFF",
      password: "awot123",
      locationsToAssign: [addisAbabaLocation], // Only Ethiopian Store (Addis Ababa)
      defaultLocation: addisAbabaLocation,
    },
    {
      username: "alazar",
      name: "Alazar Tilahun",
      role: "STORE_ROLE",
      password: "alazar123",
      locationsToAssign: [djiboutiLocation],
      defaultLocation: djiboutiLocation,
    },
    {
      username: "manager",
      name: "Operations Manager",
      role: "MANAGER",
      password: "manager123",
      locationsToAssign: locations,
      defaultLocation: addisAbabaLocation,
    },
    {
      username: "warehouse",
      name: "Warehouse Clerk",
      role: "WAREHOUSE_ROLE",
      password: "warehouse123",
      locationsToAssign: [addisAbabaLocation],
      defaultLocation: addisAbabaLocation,
    },
    {
      username: "finance",
      name: "Finance Officer",
      role: "FINANCE_ROLE",
      password: "finance123",
      locationsToAssign: locations,
      defaultLocation: addisAbabaLocation,
    },
  ];

  for (const user of usersToSeed) {
    const dbUser = await prisma.user.upsert({
      where: { username: user.username },
      update: {
        name: user.name,
        displayName: user.name,
        displayUsername: user.username,
        role: user.role,
        isActive: true,
        defaultLocationId: user.defaultLocation.id,
      },
      create: {
        name: user.name,
        username: user.username,
        displayUsername: user.username,
        displayName: user.name,
        role: user.role,
        isActive: true,
        defaultLocationId: user.defaultLocation.id,
      },
    });

    await ensureCredentialAccount(dbUser.id, user.password);
    
    // Assign locations
    for (const loc of user.locationsToAssign) {
      await prisma.userBranch.upsert({
        where: {
          userId_locationId: {
            userId: dbUser.id,
            locationId: loc.id,
          },
        },
        update: {
          isDefault: loc.id === user.defaultLocation.id,
          isActive: true,
        },
        create: {
          userId: dbUser.id,
          locationId: loc.id,
          isDefault: loc.id === user.defaultLocation.id,
          isActive: true,
        },
      });
    }

    // Deactivate location assignments that are not assigned in this seed run
    await prisma.userBranch.updateMany({
      where: {
        userId: dbUser.id,
        locationId: { notIn: user.locationsToAssign.map((loc) => loc.id) },
      },
      data: {
        isActive: false,
        isDefault: false,
      },
    });
  }

  console.log("Operational users and roles seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });