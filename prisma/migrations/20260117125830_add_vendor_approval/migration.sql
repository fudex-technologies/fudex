-- CreateEnum
CREATE TYPE "VendorApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "approvalDate" TIMESTAMP(3),
ADD COLUMN     "approvalStatus" "VendorApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "declineReason" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "submittedForApproval" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "VendorPayout" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Vendor_approvalStatus_idx" ON "Vendor"("approvalStatus");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPayout" ADD CONSTRAINT "VendorPayout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
