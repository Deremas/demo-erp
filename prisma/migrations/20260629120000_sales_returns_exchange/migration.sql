-- Production-safe additive migration for sales returns and exchanges.
-- Existing sales and sale_items rows are preserved.

ALTER TYPE "SaleStatus" ADD VALUE IF NOT EXISTS 'PARTIALLY_RETURNED';
ALTER TYPE "SaleStatus" ADD VALUE IF NOT EXISTS 'RETURNED';
ALTER TYPE "SaleStatus" ADD VALUE IF NOT EXISTS 'PARTIALLY_EXCHANGED';
ALTER TYPE "SaleStatus" ADD VALUE IF NOT EXISTS 'EXCHANGED';

ALTER TYPE "LedgerEntryType" ADD VALUE IF NOT EXISTS 'SALES_RETURN';
ALTER TYPE "LedgerEntryType" ADD VALUE IF NOT EXISTS 'SALES_EXCHANGE';

ALTER TYPE "StockMovementType" ADD VALUE IF NOT EXISTS 'SALE_EXCHANGE_OUT';

DO $$ BEGIN
  CREATE TYPE "SalesReturnType" AS ENUM ('FULL_RETURN', 'PARTIAL_RETURN', 'EXCHANGE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "SalesReturnStatus" AS ENUM ('DRAFT', 'COMPLETED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReturnRefundMethod" AS ENUM ('CASH', 'BANK', 'CREDIT', 'EXCHANGE', 'MIXED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "sales_returns" (
  "id" TEXT NOT NULL,
  "returnNumber" TEXT NOT NULL,
  "saleId" TEXT NOT NULL,
  "locationId" TEXT NOT NULL,
  "customerId" TEXT,
  "createdById" TEXT NOT NULL,
  "returnType" "SalesReturnType" NOT NULL,
  "status" "SalesReturnStatus" NOT NULL DEFAULT 'COMPLETED',
  "refundMethod" "ReturnRefundMethod",
  "returnedAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "exchangeAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "differenceAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "amountRefunded" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "amountCollected" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "reason" TEXT,
  "returnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sales_returns_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sales_return_items" (
  "id" TEXT NOT NULL,
  "salesReturnId" TEXT NOT NULL,
  "originalSaleItemId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" DECIMAL(18,2) NOT NULL,
  "discount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "lineTotal" DECIMAL(18,2) NOT NULL,
  "packageQuantity" INTEGER NOT NULL DEFAULT 0,
  "remainderQuantity" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sales_return_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sales_exchange_items" (
  "id" TEXT NOT NULL,
  "salesReturnId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" DECIMAL(18,2) NOT NULL,
  "discount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "lineTotal" DECIMAL(18,2) NOT NULL,
  "packageQuantity" INTEGER NOT NULL DEFAULT 0,
  "remainderQuantity" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sales_exchange_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "sales_returns_returnNumber_key" ON "sales_returns"("returnNumber");
CREATE INDEX IF NOT EXISTS "sales_returns_saleId_idx" ON "sales_returns"("saleId");
CREATE INDEX IF NOT EXISTS "sales_returns_locationId_returnedAt_idx" ON "sales_returns"("locationId", "returnedAt");
CREATE INDEX IF NOT EXISTS "sales_returns_customerId_idx" ON "sales_returns"("customerId");
CREATE INDEX IF NOT EXISTS "sales_returns_createdById_idx" ON "sales_returns"("createdById");
CREATE INDEX IF NOT EXISTS "sales_return_items_salesReturnId_idx" ON "sales_return_items"("salesReturnId");
CREATE INDEX IF NOT EXISTS "sales_return_items_productId_idx" ON "sales_return_items"("productId");
CREATE INDEX IF NOT EXISTS "sales_return_items_originalSaleItemId_idx" ON "sales_return_items"("originalSaleItemId");
CREATE INDEX IF NOT EXISTS "sales_exchange_items_salesReturnId_idx" ON "sales_exchange_items"("salesReturnId");
CREATE INDEX IF NOT EXISTS "sales_exchange_items_productId_idx" ON "sales_exchange_items"("productId");
