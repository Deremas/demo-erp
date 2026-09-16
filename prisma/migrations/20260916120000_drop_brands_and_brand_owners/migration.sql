-- Drop product brand / brand-owner columns, then remove the unused tables.
DROP INDEX IF EXISTS "products_brandId_idx";
DROP INDEX IF EXISTS "products_companyId_idx";

ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_brandId_fkey";
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_companyId_fkey";

ALTER TABLE "products" DROP COLUMN IF EXISTS "brandId";
ALTER TABLE "products" DROP COLUMN IF EXISTS "companyId";

DROP TABLE IF EXISTS "brands";
DROP TABLE IF EXISTS "companies";
