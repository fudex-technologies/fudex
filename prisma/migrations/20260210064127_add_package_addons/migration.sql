-- CreateTable
CREATE TABLE "PackageAddon" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "productItemId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackageAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageOrderAddon" (
    "id" TEXT NOT NULL,
    "packageOrderId" TEXT NOT NULL,
    "productItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PackageOrderAddon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PackageAddon_packageId_idx" ON "PackageAddon"("packageId");

-- CreateIndex
CREATE INDEX "PackageAddon_productItemId_idx" ON "PackageAddon"("productItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PackageAddon_packageId_productItemId_key" ON "PackageAddon"("packageId", "productItemId");

-- CreateIndex
CREATE INDEX "PackageOrderAddon_packageOrderId_idx" ON "PackageOrderAddon"("packageOrderId");

-- CreateIndex
CREATE INDEX "PackageOrderAddon_productItemId_idx" ON "PackageOrderAddon"("productItemId");

-- AddForeignKey
ALTER TABLE "PackageAddon" ADD CONSTRAINT "PackageAddon_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageAddon" ADD CONSTRAINT "PackageAddon_productItemId_fkey" FOREIGN KEY ("productItemId") REFERENCES "ProductItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageOrderAddon" ADD CONSTRAINT "PackageOrderAddon_packageOrderId_fkey" FOREIGN KEY ("packageOrderId") REFERENCES "PackageOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageOrderAddon" ADD CONSTRAINT "PackageOrderAddon_productItemId_fkey" FOREIGN KEY ("productItemId") REFERENCES "ProductItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
