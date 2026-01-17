-- Migration: Add Vendor Approval Workflow
-- Run this migration manually after updating schema.prisma

-- Create VendorApprovalStatus enum
CREATE TYPE "VendorApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- Add approval fields to Vendor table
ALTER TABLE "Vendor" 
ADD COLUMN "approvalStatus" "VendorApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "approvalDate" TIMESTAMP(3),
ADD COLUMN "approvedById" TEXT,
ADD COLUMN "declineReason" TEXT,
ADD COLUMN "verificationDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "submittedForApproval" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "submittedAt" TIMESTAMP(3);

-- Add foreign key for approvedBy
ALTER TABLE "Vendor" 
ADD CONSTRAINT "Vendor_approvedById_fkey" 
FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index for approval status filtering
CREATE INDEX "Vendor_approvalStatus_idx" ON "Vendor"("approvalStatus");

-- IMPORTANT: Set existing vendors to APPROVED status to avoid disruption
UPDATE "Vendor" SET "approvalStatus" = 'APPROVED', "submittedForApproval" = true WHERE "approvalStatus" = 'PENDING';

-- Verify migration
SELECT id, name, "approvalStatus", "submittedForApproval" FROM "Vendor" LIMIT 5;
