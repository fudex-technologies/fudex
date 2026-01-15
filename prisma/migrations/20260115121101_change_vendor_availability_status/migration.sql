/*
  Warnings:

  - You are about to drop the column `isAvailable` on the `Vendor` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VendorAvailabilityStatus" AS ENUM ('AUTO', 'OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "isAvailable",
ADD COLUMN     "availabilityStatus" "VendorAvailabilityStatus" NOT NULL DEFAULT 'AUTO';

-- CreateTable
CREATE TABLE "playing_with_neon" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" REAL,

    CONSTRAINT "playing_with_neon_pkey" PRIMARY KEY ("id")
);
