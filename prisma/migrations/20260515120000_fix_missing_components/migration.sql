-- CreateEnum
CREATE TYPE "ChequeStatus" AS ENUM ('PENDING', 'DUE_SOON', 'OVERDUE', 'CLEARED', 'BOUNCED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryOrderStatus" AS ENUM ('DRAFT', 'SENT', 'DELIVERED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "SalePaymentMethod" ADD VALUE 'CHEQUE';

-- CreateTable
CREATE TABLE "exchange_rate_history" (
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

-- CreateTable
CREATE TABLE "cheques" (
    "id" TEXT NOT NULL,
    "chequeNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "chequeDate" TIMESTAMP(3) NOT NULL,
    "depositableDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "clearedDate" TIMESTAMP(3),
    "status" "ChequeStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "customerId" TEXT NOT NULL,
    "saleId" TEXT,
    "locationId" TEXT NOT NULL,
    "financeAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cheques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "deliveryPerson" TEXT,
    "deliveryAddress" TEXT,
    "phone" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "notes" TEXT,
    "status" "DeliveryOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_order_items" (
    "id" TEXT NOT NULL,
    "deliveryOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "packageQuantity" INTEGER NOT NULL DEFAULT 0,
    "remainderQuantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "delivery_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exchange_rate_history_currency_recordedAt_idx" ON "exchange_rate_history"("currency", "recordedAt");

-- CreateIndex
CREATE INDEX "exchange_rate_history_sourceType_sourceId_idx" ON "exchange_rate_history"("sourceType", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "cheques_saleId_key" ON "cheques"("saleId");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_orders_orderNumber_key" ON "delivery_orders"("orderNumber");
