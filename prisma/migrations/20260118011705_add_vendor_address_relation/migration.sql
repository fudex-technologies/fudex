/*
  Warnings:

  - You are about to drop the column `address` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `lat` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `Vendor` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Vendor_city_idx";

-- DropIndex
DROP INDEX "Vendor_lat_lng_idx";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "vendorId" TEXT;

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "lat",
DROP COLUMN "lng",
ADD COLUMN     "areaId" TEXT;

-- CreateTable
CREATE TABLE "VendorVerificationDocument" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorVerificationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorVerificationDocument_vendorId_idx" ON "VendorVerificationDocument"("vendorId");

-- CreateIndex
CREATE INDEX "Address_vendorId_idx" ON "Address"("vendorId");

-- CreateIndex
CREATE INDEX "Vendor_areaId_idx" ON "Vendor"("areaId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorVerificationDocument" ADD CONSTRAINT "VendorVerificationDocument_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
