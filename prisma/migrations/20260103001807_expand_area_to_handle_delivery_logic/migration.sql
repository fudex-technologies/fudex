-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "areaId" TEXT,
ADD COLUMN     "customArea" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "serviceFee" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "image" TEXT;

-- CreateTable
CREATE TABLE "DeliveryFeeRule" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryFeeRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorOpeningHour" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "openTime" TEXT,
    "closeTime" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VendorOpeningHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryFeeRule_areaId_idx" ON "DeliveryFeeRule"("areaId");

-- CreateIndex
CREATE INDEX "VendorOpeningHour_vendorId_idx" ON "VendorOpeningHour"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorOpeningHour_vendorId_day_key" ON "VendorOpeningHour"("vendorId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformSetting_key_key" ON "PlatformSetting"("key");

-- AddForeignKey
ALTER TABLE "DeliveryFeeRule" ADD CONSTRAINT "DeliveryFeeRule_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorOpeningHour" ADD CONSTRAINT "VendorOpeningHour_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
