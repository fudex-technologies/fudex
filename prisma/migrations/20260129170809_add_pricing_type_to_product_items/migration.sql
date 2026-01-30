-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('FIXED', 'PER_UNIT');

-- AlterTable
ALTER TABLE "ProductItem" ADD COLUMN     "maxQuantity" INTEGER,
ADD COLUMN     "minQuantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "pricingType" "PricingType" NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "quantityStep" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "unitName" TEXT;
