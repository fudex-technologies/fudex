-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('DELIVERY', 'PICKUP');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryType" "DeliveryType" NOT NULL DEFAULT 'DELIVERY';
