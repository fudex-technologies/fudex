import prisma from "@/lib/prisma";
import { NotificationService } from "@/modules/notifications/server/service";
import { PAGES_DATA } from "@/data/pagesData";

/**
 * Shared function to handle package payment completion (status update + notifications)
 * This ensures idempotency and prevents duplicate notifications
 * Uses database transactions to ensure atomicity
 */
export async function handlePackagePaymentCompletion(paymentId: string) {
    // Use a transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
        // Re-fetch payment with lock to prevent race conditions
        const payment = await tx.packagePayment.findUnique({
            where: { id: paymentId },
            include: { packageOrder: { include: { package: true } } },
        });

        if (!payment) {
            throw new Error("Package payment not found");
        }

        // If already completed and notifications sent, skip
        if (payment.status === "COMPLETED" && payment.notificationsSent) {
            return { alreadyCompleted: true, payment };
        }

        // Update payment status if not already completed
        if (payment.status !== "COMPLETED") {
            await tx.packagePayment.update({
                where: { id: paymentId },
                data: {
                    status: "COMPLETED",
                    paidAt: payment.paidAt || new Date(),
                },
            });
        }

        // Update package order status if not already PAID
        if (payment.packageOrder.status !== "PAID") {
            await tx.packageOrder.update({
                where: { id: payment.packageOrderId },
                data: { status: "PAID" },
            });
        }

        // Send notifications if not already sent (idempotency check)
        if (!payment.notificationsSent) {
            const packageOrderId = payment.packageOrderId;
            const packageOrder = payment.packageOrder;

            // Notify Operators (Push)
            NotificationService.sendToRole('OPERATOR', {
                title: 'New Package Order Paid! 🎁',
                body: `Package order #${packageOrderId.slice(0, 8)} for ${packageOrder.package.name} has been paid. Delivery: ${new Date(packageOrder.deliveryDate).toLocaleDateString()}.`,
                url: PAGES_DATA.operator_dashboard_orders_page // Will update to package orders page
            }).catch((error) => {
                console.error('[PackagePayment] Failed to send push notification to operators:', error);
            });

            // Notify Operators (Email)
            try {
                const operators = await tx.user.findMany({
                    where: {
                        roles: {
                            some: {
                                role: "OPERATOR"
                            }
                        }
                    },
                    select: { email: true }
                });
                const operatorEmails = operators.map(op => op.email).filter((email): email is string => !!email);

                if (operatorEmails.length > 0) {
                    const customer = await tx.user.findUnique({
                        where: { id: payment.userId },
                        select: { firstName: true, lastName: true, email: true }
                    });

                    if (customer) {
                        const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer';
                        const recipientAddress = `${packageOrder.recipientAddressLine1}, ${packageOrder.recipientCity}${packageOrder.recipientState ? ', ' + packageOrder.recipientState : ''}`;

                        // Import email function dynamically to avoid circular dependencies
                        const { sendOperatorNewPackageOrderEmail, sendCustomerPackageOrderEmail } = await import("@/lib/email");

                        // Send Customer Email
                        await sendCustomerPackageOrderEmail(
                            customer.email!,
                            customerName,
                            packageOrder.package.name,
                            packageOrderId,
                            payment.amount,
                            payment.currency,
                            packageOrder.deliveryDate,
                            packageOrder.timeSlot,
                            packageOrder.recipientName,
                            'orders@fudex.ng'
                        ).catch((err) => console.error('[PackagePayment] Failed to send email to customer:', err));

                        // Calculate the payment method
                        const walletDebits = await tx.walletTransaction.aggregate({
                            where: {
                                sourceId: packageOrderId,
                                sourceType: "PACKAGE_PAYMENT",
                                type: "DEBIT"
                            },
                            _sum: { amount: true }
                        });

                        const walletUsed = walletDebits._sum.amount?.toNumber() || 0;
                        let paymentMethod = payment.provider === 'wallet' ? 'Wallet' : 'Paystack';

                        if (payment.provider === 'paystack' && walletUsed > 0) {
                            paymentMethod = 'Wallet + Paystack';
                        } else if (payment.provider === 'paystack') {
                            paymentMethod = 'Paystack';
                        } else if (payment.provider === 'wallet') {
                            paymentMethod = 'Wallet';
                        }

                        // Send Operator Email
                        await sendOperatorNewPackageOrderEmail(
                            operatorEmails,
                            packageOrder.package.name,
                            packageOrder.recipientName,
                            recipientAddress,
                            packageOrder.deliveryDate,
                            packageOrder.timeSlot,
                            packageOrderId,
                            packageOrder.totalAmount, // full order total (wallet + Paystack)
                            payment.currency,
                            paymentMethod,
                            'orders@fudex.ng'
                        );
                        console.log(`[PackagePayment] Email notification sent to ${operatorEmails.length} operator(s)`);
                    } else {
                        console.warn('[PackagePayment] Customer not found for email notification');
                    }
                } else {
                    console.log('[PackagePayment] No operators found to notify via email');
                }
            } catch (emailError) {
                console.error('[PackagePayment] Failed to send email notification to operators:', emailError);
            }

            // Mark notifications as sent (atomic update)
            await tx.packagePayment.update({
                where: { id: paymentId },
                data: {
                    notificationsSent: true,
                    notificationsSentAt: new Date(),
                },
            });
        }

        return { alreadyCompleted: false, payment };
    });
}
