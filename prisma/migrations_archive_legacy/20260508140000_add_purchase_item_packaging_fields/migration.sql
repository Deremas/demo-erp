-- AlterTable
ALTER TABLE "purchase_items" ADD COLUMN     "unitId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "purchase_items" ADD COLUMN     "actualUnitsPerPackage" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "purchase_items" ADD COLUMN     "baseQuantity" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
