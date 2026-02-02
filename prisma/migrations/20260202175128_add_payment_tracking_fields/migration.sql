-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "notificationsSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notificationsSentAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
