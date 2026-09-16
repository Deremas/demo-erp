import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client"; // v2 cache bust

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaPool?: Pool;
  prismaAdapter?: PrismaPg;
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to initialize Prisma.");
}

function normalizeDatabaseUrl(value: string) {
  const url = new URL(value);
  const sslMode = url.searchParams.get("sslmode");

  if (url.searchParams.get("channel_binding") === "require") {
    url.searchParams.delete("channel_binding");
  }

  if (sslMode === "disable") {
    url.searchParams.delete("uselibpqcompat");
    return url.toString();
  }

  // pg v8 treats require/prefer/verify-ca as verify-full and warns.
  // Keep encrypt-without-full-CA-verify (Neon-compatible) via libpq require.
  url.searchParams.set("sslmode", "require");
  url.searchParams.set("uselibpqcompat", "true");

  return url.toString();
}

function toPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const pool =
  globalForPrisma.prismaPool ??
  new Pool({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
    ssl: { rejectUnauthorized: false },
    max: toPositiveInteger(
      process.env.PG_POOL_MAX,
      process.env.NODE_ENV === "development" ? 20 : 1,
    ),
    idleTimeoutMillis: toPositiveInteger(process.env.PG_IDLE_TIMEOUT_MS, 30_000),
    connectionTimeoutMillis: toPositiveInteger(
      process.env.PG_CONNECTION_TIMEOUT_MS,
      60_000,
    ),
  });

const adapter =
  globalForPrisma.prismaAdapter ??
  new PrismaPg(pool, {
    onPoolError: (error) => {
      console.error("Prisma pool error", error);
    },
    onConnectionError: (error) => {
      console.error("Prisma connection error", error);
    },
  });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaPool = pool;
  globalForPrisma.prismaAdapter = adapter;
  globalForPrisma.prisma = prisma;
}