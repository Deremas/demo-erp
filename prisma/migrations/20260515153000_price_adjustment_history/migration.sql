-- CreateTable
CREATE TABLE "price_adjustment_batches" (
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

-- CreateTable
CREATE TABLE "price_adjustment_history" (
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

-- CreateIndex
CREATE INDEX "price_adjustment_batches_createdAt_idx" ON "price_adjustment_batches"("createdAt");

-- CreateIndex
CREATE INDEX "price_adjustment_batches_createdById_idx" ON "price_adjustment_batches"("createdById");

-- CreateIndex
CREATE INDEX "price_adjustment_history_batchId_idx" ON "price_adjustment_history"("batchId");

-- CreateIndex
CREATE INDEX "price_adjustment_history_productId_idx" ON "price_adjustment_history"("productId");

-- CreateIndex
CREATE INDEX "price_adjustment_history_locationId_idx" ON "price_adjustment_history"("locationId");

-- CreateIndex
CREATE INDEX "price_adjustment_history_createdAt_idx" ON "price_adjustment_history"("createdAt");

-- AddForeignKey
ALTER TABLE "price_adjustment_batches" ADD CONSTRAINT "price_adjustment_batches_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_adjustment_history" ADD CONSTRAINT "price_adjustment_history_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "price_adjustment_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_adjustment_history" ADD CONSTRAINT "price_adjustment_history_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_adjustment_history" ADD CONSTRAINT "price_adjustment_history_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
