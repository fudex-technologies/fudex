import prisma from "@/lib/prisma";
import { Prisma, WalletTransactionSource } from "@prisma/client";
import { WalletService } from "./service";

export class RefundService {
    /**
     * Refund a standard order to the user's wallet
     */
    static async refundOrder(orderId: string) {
        return prisma.$transaction(async (tx) => {
            // 1. Fetch order with payment and wallet transactions
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: {
                    payment: true,
                },
            });

            if (!order) {
                throw new Error("Order not found");
            }

            // 2. Safety Check: Only allow refunds for cancelled orders or specific admin actions
            // For now, let's assume it can be called for any order that needs a refund
            // but usually it's for CANCELLED orders.

            // 3. Idempotency Check: Don't refund twice
            const existingRefund = await tx.walletTransaction.findFirst({
                where: {
                    sourceId: orderId,
                    sourceType: WalletTransactionSource.REFUND,
                    type: "CREDIT"
                }
            });

            if (existingRefund) {
                return { success: true, alreadyRefunded: true, amount: existingRefund.amount };
            }

            // 4. Calculate amount to refund
            // We need to find all DEBIT transactions from the wallet for this order
            const walletDebits = await tx.walletTransaction.findMany({
                where: {
                    sourceId: orderId,
                    sourceType: WalletTransactionSource.ORDER_PAYMENT,
                    type: "DEBIT"
                }
            });

            const walletUsed = walletDebits.reduce((sum, tx) => sum.add(tx.amount), new Prisma.Decimal(0));

            // Add external payment if it was completed
            let externalPaid = new Prisma.Decimal(0);
            if (order.payment && order.payment.status === "COMPLETED") {
                externalPaid = new Prisma.Decimal(order.payment.amount);
            }

            const totalRefund = walletUsed.add(externalPaid);

            if (totalRefund.isZero()) {
                return { success: true, amount: 0, message: "Nothing to refund" };
            }

            // 5. Execute Refund
            await WalletService.creditWallet({
                userId: order.userId,
                amount: totalRefund,
                sourceType: WalletTransactionSource.REFUND,
                sourceId: orderId,
                reference: `REFUND-ORDER-${orderId}`,
            }, tx as any);

            // 6. Update order payout status to prevent vendor payout if it was scheduled
            await tx.order.update({
                where: { id: orderId },
                data: {
                    payoutStatus: "NOT_ELIGIBLE"
                }
            });

            // 7. If there was a VendorPayout record, mark it as cancelled/failed
            await tx.vendorPayout.updateMany({
                where: { orderId: orderId },
                data: { status: "FAILED" } // Or add a REFUNDED status to VendorPayout if needed
            });

            // 8. Update Payment status to REFUNDED if it exists
            if (order.payment) {
                await tx.payment.update({
                    where: { id: order.payment.id },
                    data: { status: "REFUNDED" }
                });
            }

            return { success: true, amount: totalRefund };
        });
    }

    /**
     * Refund a package order to the user's wallet
     */
    static async refundPackageOrder(packageOrderId: string) {
        return prisma.$transaction(async (tx) => {
            // 1. Fetch package order with payment
            const packageOrder = await tx.packageOrder.findUnique({
                where: { id: packageOrderId },
                include: {
                    payment: true,
                },
            });

            if (!packageOrder) {
                throw new Error("Package order not found");
            }

            // 2. Idempotency Check
            const existingRefund = await tx.walletTransaction.findFirst({
                where: {
                    sourceId: packageOrderId,
                    sourceType: WalletTransactionSource.REFUND,
                    type: "CREDIT"
                }
            });

            if (existingRefund) {
                return { success: true, alreadyRefunded: true, amount: existingRefund.amount };
            }

            // 3. Calculate amount
            const walletDebits = await tx.walletTransaction.findMany({
                where: {
                    sourceId: packageOrderId,
                    sourceType: WalletTransactionSource.PACKAGE_PAYMENT,
                    type: "DEBIT"
                }
            });

            const walletUsed = walletDebits.reduce((sum, tx) => sum.add(tx.amount), new Prisma.Decimal(0));

            let externalPaid = new Prisma.Decimal(0);
            if (packageOrder.payment && packageOrder.payment.status === "COMPLETED") {
                externalPaid = new Prisma.Decimal(packageOrder.payment.amount);
            }

            const totalRefund = walletUsed.add(externalPaid);

            if (totalRefund.isZero()) {
                return { success: true, amount: 0, message: "Nothing to refund" };
            }

            // 4. Execute Refund
            await WalletService.creditWallet({
                userId: packageOrder.userId,
                amount: totalRefund,
                sourceType: WalletTransactionSource.REFUND,
                sourceId: packageOrderId,
                reference: `REFUND-PKG-${packageOrderId}`,
            }, tx as any);

            // 5. Update Payment status to REFUNDED if it exists
            if (packageOrder.payment) {
                await tx.payment.update({
                    where: { id: packageOrder.payment.id },
                    data: { status: "REFUNDED" }
                });
            }

            return { success: true, amount: totalRefund };
        });
    }
}
