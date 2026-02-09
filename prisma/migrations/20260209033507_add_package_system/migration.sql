-- CreateEnum
CREATE TYPE "PackageCardType" AS ENUM ('ADMIN_CREATED', 'CUSTOM');

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPreorder" BOOLEAN NOT NULL DEFAULT false,
    "deliveryDate" TIMESTAMP(3),
    "orderCloseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageCategory" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackageCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageItem" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "details" JSONB,

    CONSTRAINT "PackageItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "orderId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "recipientName" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "recipientAddressId" TEXT,
    "recipientAddressLine1" TEXT NOT NULL,
    "recipientAddressLine2" TEXT,
    "recipientCity" TEXT NOT NULL,
    "recipientState" TEXT,
    "recipientAreaId" TEXT,
    "recipientCustomArea" TEXT,
    "senderName" TEXT NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "cardType" "PackageCardType" NOT NULL DEFAULT 'CUSTOM',
    "customCardMessage" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "serviceFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "productAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageOrderItem" (
    "id" TEXT NOT NULL,
    "packageOrderId" TEXT NOT NULL,
    "packageItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PackageOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagePayment" (
    "id" TEXT NOT NULL,
    "packageOrderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "provider" TEXT NOT NULL DEFAULT 'paystack',
    "providerRef" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "PackagePayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Package_slug_key" ON "Package"("slug");

-- CreateIndex
CREATE INDEX "Package_slug_idx" ON "Package"("slug");

-- CreateIndex
CREATE INDEX "Package_isActive_idx" ON "Package"("isActive");

-- CreateIndex
CREATE INDEX "PackageCategory_packageId_idx" ON "PackageCategory"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "PackageCategory_packageId_slug_key" ON "PackageCategory"("packageId", "slug");

-- CreateIndex
CREATE INDEX "PackageItem_packageId_idx" ON "PackageItem"("packageId");

-- CreateIndex
CREATE INDEX "PackageItem_categoryId_idx" ON "PackageItem"("categoryId");

-- CreateIndex
CREATE INDEX "PackageItem_isActive_idx" ON "PackageItem"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PackageItem_packageId_slug_key" ON "PackageItem"("packageId", "slug");

-- CreateIndex
CREATE INDEX "PackageOrder_userId_idx" ON "PackageOrder"("userId");

-- CreateIndex
CREATE INDEX "PackageOrder_packageId_idx" ON "PackageOrder"("packageId");

-- CreateIndex
CREATE INDEX "PackageOrder_status_idx" ON "PackageOrder"("status");

-- CreateIndex
CREATE INDEX "PackageOrder_deliveryDate_idx" ON "PackageOrder"("deliveryDate");

-- CreateIndex
CREATE INDEX "PackageOrderItem_packageOrderId_idx" ON "PackageOrderItem"("packageOrderId");

-- CreateIndex
CREATE INDEX "PackageOrderItem_packageItemId_idx" ON "PackageOrderItem"("packageItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PackagePayment_packageOrderId_key" ON "PackagePayment"("packageOrderId");

-- CreateIndex
CREATE INDEX "PackagePayment_userId_idx" ON "PackagePayment"("userId");

-- CreateIndex
CREATE INDEX "PackagePayment_providerRef_idx" ON "PackagePayment"("providerRef");

-- CreateIndex
CREATE INDEX "PackagePayment_status_idx" ON "PackagePayment"("status");

-- AddForeignKey
ALTER TABLE "PackageCategory" ADD CONSTRAINT "PackageCategory_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageItem" ADD CONSTRAINT "PackageItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PackageCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageItem" ADD CONSTRAINT "PackageItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageOrder" ADD CONSTRAINT "PackageOrder_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageOrder" ADD CONSTRAINT "PackageOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageOrderItem" ADD CONSTRAINT "PackageOrderItem_packageOrderId_fkey" FOREIGN KEY ("packageOrderId") REFERENCES "PackageOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageOrderItem" ADD CONSTRAINT "PackageOrderItem_packageItemId_fkey" FOREIGN KEY ("packageItemId") REFERENCES "PackageItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagePayment" ADD CONSTRAINT "PackagePayment_packageOrderId_fkey" FOREIGN KEY ("packageOrderId") REFERENCES "PackageOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagePayment" ADD CONSTRAINT "PackagePayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
