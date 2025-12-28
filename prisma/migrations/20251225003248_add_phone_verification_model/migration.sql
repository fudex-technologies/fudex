-- CreateTable
CREATE TABLE "PhoneVerification" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhoneVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PhoneVerification_phone_idx" ON "PhoneVerification"("phone");

-- CreateIndex
CREATE INDEX "PhoneVerification_createdAt_idx" ON "PhoneVerification"("createdAt");
