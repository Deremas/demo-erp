-- Additive client-demo fields: warehouse locations and agent credit tracking.

ALTER TYPE "LocationType" ADD VALUE IF NOT EXISTS 'WAREHOUSE';

ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "partyType" TEXT NOT NULL DEFAULT 'CUSTOMER';
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "creditLimit" DECIMAL(18, 2) NOT NULL DEFAULT 0;
