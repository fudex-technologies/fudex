-- AlterTable
ALTER TABLE "PackagePayment" ADD COLUMN     "notificationsSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notificationsSentAt" TIMESTAMP(3);
