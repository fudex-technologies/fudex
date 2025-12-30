-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "groupKey" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "inStock" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ProductItem" ADD COLUMN     "inStock" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "OrderItemAddon" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "addonProductItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItemAddon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderItemAddon_orderItemId_idx" ON "OrderItemAddon"("orderItemId");

-- CreateIndex
CREATE INDEX "OrderItemAddon_addonProductItemId_idx" ON "OrderItemAddon"("addonProductItemId");

-- AddForeignKey
ALTER TABLE "OrderItemAddon" ADD CONSTRAINT "OrderItemAddon_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemAddon" ADD CONSTRAINT "OrderItemAddon_addonProductItemId_fkey" FOREIGN KEY ("addonProductItemId") REFERENCES "ProductItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
