import "dotenv/config";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const url = new URL(databaseUrl);
url.searchParams.delete("channel_binding");

const pool = new Pool({
  connectionString: url.toString(),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "product_location_prices" (
      "id" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "locationId" TEXT NOT NULL,
      "baseSellingPrice" DECIMAL(18,2) NOT NULL,
      "packageSellingPrice" DECIMAL(18,2) NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "product_location_prices_pkey" PRIMARY KEY ("id")
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "product_location_prices_productId_locationId_key"
      ON "product_location_prices"("productId", "locationId");

    CREATE INDEX IF NOT EXISTS "product_location_prices_locationId_idx"
      ON "product_location_prices"("locationId");

    CREATE INDEX IF NOT EXISTS "product_location_prices_productId_idx"
      ON "product_location_prices"("productId");

    CREATE TABLE IF NOT EXISTS "exchange_rate_history" (
      "id" TEXT NOT NULL,
      "currency" TEXT NOT NULL,
      "rate" DECIMAL(18,4) NOT NULL,
      "sourceType" TEXT NOT NULL,
      "sourceId" TEXT,
      "recordedById" TEXT,
      "note" TEXT,
      "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "exchange_rate_history_pkey" PRIMARY KEY ("id")
    );

    CREATE INDEX IF NOT EXISTS "exchange_rate_history_currency_recordedAt_idx"
      ON "exchange_rate_history"("currency", "recordedAt");

    CREATE INDEX IF NOT EXISTS "exchange_rate_history_sourceType_sourceId_idx"
      ON "exchange_rate_history"("sourceType", "sourceId");

    CREATE TABLE IF NOT EXISTS "price_adjustment_batches" (
      "id" TEXT NOT NULL,
      "mode" TEXT NOT NULL,
      "amount" DECIMAL(18,2) NOT NULL,
      "locationCount" INTEGER NOT NULL,
      "itemCount" INTEGER NOT NULL,
      "rowCount" INTEGER NOT NULL,
      "createdById" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "price_adjustment_batches_pkey" PRIMARY KEY ("id")
    );

    CREATE INDEX IF NOT EXISTS "price_adjustment_batches_createdAt_idx"
      ON "price_adjustment_batches"("createdAt");

    CREATE INDEX IF NOT EXISTS "price_adjustment_batches_createdById_idx"
      ON "price_adjustment_batches"("createdById");

    CREATE TABLE IF NOT EXISTS "price_adjustment_history" (
      "id" TEXT NOT NULL,
      "batchId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "locationId" TEXT NOT NULL,
      "baseSellingPriceBefore" DECIMAL(18,2) NOT NULL,
      "baseSellingPriceAfter" DECIMAL(18,2) NOT NULL,
      "packageSellingPriceBefore" DECIMAL(18,2) NOT NULL,
      "packageSellingPriceAfter" DECIMAL(18,2) NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "price_adjustment_history_pkey" PRIMARY KEY ("id")
    );

    CREATE INDEX IF NOT EXISTS "price_adjustment_history_batchId_idx"
      ON "price_adjustment_history"("batchId");

    CREATE INDEX IF NOT EXISTS "price_adjustment_history_productId_idx"
      ON "price_adjustment_history"("productId");

    CREATE INDEX IF NOT EXISTS "price_adjustment_history_locationId_idx"
      ON "price_adjustment_history"("locationId");

    CREATE INDEX IF NOT EXISTS "price_adjustment_history_createdAt_idx"
      ON "price_adjustment_history"("createdAt");
  `);

  const { rows } = await pool.query(`
    SELECT
      table_name AS "table",
      to_regclass(table_name) IS NOT NULL AS "exists"
    FROM unnest(ARRAY[
      'product_location_prices',
      'exchange_rate_history',
      'price_adjustment_batches',
      'price_adjustment_history'
    ]::text[]) AS table_name;
  `);

  console.table(rows);
}

main()
  .finally(async () => {
    await pool.end();
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
