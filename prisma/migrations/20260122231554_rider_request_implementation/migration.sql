-- CreateEnum
CREATE TYPE "RiderRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'ASSIGNED', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('UNSETTLED', 'PENDING_VERIFICATION', 'SETTLED');

-- CreateTable
CREATE TABLE "RiderRequest" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "operatorId" TEXT,
    "assignedRiderId" TEXT,
    "status" "RiderRequestStatus" NOT NULL DEFAULT 'PENDING',
    "settlementStatus" "SettlementStatus" NOT NULL DEFAULT 'UNSETTLED',
    "totalFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiderRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiderRequestItem" (
    "id" TEXT NOT NULL,
    "riderRequestId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerAddress" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "deliveryFee" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiderRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RiderRequest_vendorId_idx" ON "RiderRequest"("vendorId");

-- CreateIndex
CREATE INDEX "RiderRequest_status_idx" ON "RiderRequest"("status");

-- CreateIndex
CREATE INDEX "RiderRequest_settlementStatus_idx" ON "RiderRequest"("settlementStatus");

-- CreateIndex
CREATE INDEX "RiderRequestItem_riderRequestId_idx" ON "RiderRequestItem"("riderRequestId");

-- CreateIndex
CREATE INDEX "RiderRequestItem_areaId_idx" ON "RiderRequestItem"("areaId");

-- AddForeignKey
ALTER TABLE "RiderRequest" ADD CONSTRAINT "RiderRequest_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderRequest" ADD CONSTRAINT "RiderRequest_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderRequest" ADD CONSTRAINT "RiderRequest_assignedRiderId_fkey" FOREIGN KEY ("assignedRiderId") REFERENCES "Rider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderRequestItem" ADD CONSTRAINT "RiderRequestItem_riderRequestId_fkey" FOREIGN KEY ("riderRequestId") REFERENCES "RiderRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderRequestItem" ADD CONSTRAINT "RiderRequestItem_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
