-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "WalletTransactionSource" AS ENUM ('ORDER_PAYMENT', 'PACKAGE_PAYMENT', 'REFUND', 'REFERRAL_BONUS', 'WALLET_FUNDING', 'ADMIN_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "WalletFundingStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "sourceType" "WalletTransactionSource" NOT NULL,
    "sourceId" TEXT,
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_funding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "providerRef" TEXT NOT NULL,
    "status" "WalletFundingStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_funding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_userId_key" ON "wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transaction_reference_key" ON "wallet_transaction"("reference");

-- CreateIndex
CREATE INDEX "wallet_transaction_walletId_idx" ON "wallet_transaction"("walletId");

-- CreateIndex
CREATE INDEX "wallet_transaction_reference_idx" ON "wallet_transaction"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_funding_providerRef_key" ON "wallet_funding"("providerRef");

-- CreateIndex
CREATE INDEX "wallet_funding_userId_idx" ON "wallet_funding"("userId");

-- CreateIndex
CREATE INDEX "wallet_funding_providerRef_idx" ON "wallet_funding"("providerRef");

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transaction" ADD CONSTRAINT "wallet_transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_funding" ADD CONSTRAINT "wallet_funding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
