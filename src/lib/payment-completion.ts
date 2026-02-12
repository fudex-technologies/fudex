import prisma from "@/lib/prisma";
import { NotificationService } from "@/modules/notifications/server/service";
import { sendVendorNewOrderEmail, sendOperatorNewOrderEmail } from "@/lib/email";
import { PAGES_DATA } from "@/data/pagesData";
import { PayoutTransferStatus } from "@prisma/client";

/**
 * Shared function to handle payment completion (status update + notifications)
 * This ensures idempotency and prevents duplicate notifications
 * Uses database transactions to ensure atomicity
 */
export async function handlePaymentCompletion(paymentId: string) {
	// Use a transaction to ensure atomicity
	return await prisma.$transaction(async (tx) => {
		// Re-fetch payment with lock to prevent race conditions
		const payment = await tx.payment.findUnique({
			where: { id: paymentId },
			include: { order: true },
		});

		if (!payment) {
			throw new Error("Payment not found");
		}

		// If already completed and notifications sent, skip
		if (payment.status === "COMPLETED" && payment.notificationsSent) {
			return { alreadyCompleted: true, payment };
		}

		// Update payment status if not already completed
		if (payment.status !== "COMPLETED") {
			await tx.payment.update({
				where: { id: paymentId },
				data: {
					status: "COMPLETED",
					paidAt: payment.paidAt || new Date(),
				},
			});
		}

		// Update order status if not already PAID
		if (payment.order.status !== "PAID") {
			await tx.order.update({
				where: { id: payment.orderId },
				data: { status: "PAID", payoutStatus: "PENDING" },
			});
		}

		// Create VendorPayout record if it doesn't exist (ensure payout data for all successful payments)
		if (payment.order.vendorId) {
			const existingPayout = await tx.vendorPayout.findUnique({
				where: { orderId: payment.orderId }
			});

			if (!existingPayout) {
				await tx.vendorPayout.create({
					data: {
						vendorId: payment.order.vendorId,
						orderId: payment.orderId,
						amount: payment.order.productAmount,
						currency: payment.order.currency,
						status: PayoutTransferStatus.PENDING
					}
				});
			}
		}

		// Send notifications if not already sent (idempotency check)
		if (!payment.notificationsSent) {
			const vendorId = payment.order?.vendorId;
			const orderId = payment.orderId;

			if (vendorId && orderId) {
				// Notify Vendor
				const vendor = await tx.vendor.findUnique({
					where: { id: vendorId },
					select: {
						name: true,
						owner: {
							select: {
								id: true,
								email: true
							}
						}
					}
				});

				if (vendor?.owner) {
					// 1. Notify Vendor (Push)
					NotificationService.sendToUser(vendor.owner.id, {
						title: 'New Order Received! 🛍️',
						body: `You have a new order (#${orderId.slice(0, 8)}) worth ${payment.order?.currency} ${payment.order?.productAmount.toFixed(2)}.`,
						url: PAGES_DATA.vendor_dashboard_new_orders_page,
					}).catch((error) => {
						console.error('[Payment] Failed to send push notification to vendor:', error);
					});

					// 2. Notify Vendor (Email)
					if (vendor.owner.email && payment.order) {
						sendVendorNewOrderEmail(
							vendor.owner.email,
							vendor.name,
							orderId,
							payment.order.productAmount,
							payment.order.currency,
							'orders@fudex.ng'
						).catch((error) => {
							console.error('[Payment] Failed to send email to vendor:', error);
						});
					}
				}

				// 3. Notify Operators (Push)
				NotificationService.sendToRole('OPERATOR', {
					title: 'New Order Paid! 💰',
					body: `Order #${orderId.slice(0, 8)} has been paid and is ready for processing.`,
					url: PAGES_DATA.operator_dashboard_orders_page
				}).catch((error) => {
					console.error('[Payment] Failed to send push notification to operators:', error);
				});

				// 4. Notify Operators (Email)
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
							select: { firstName: true, lastName: true }
						});
						const customerAddress = await tx.address.findUnique({
							where: { id: payment.order.addressId! },
							select: { line1: true, city: true, state: true }
						});
						const vendor = await tx.vendor.findUnique({
							where: { id: vendorId },
							include: { addresses: { select: { line1: true, city: true, state: true } } }
						});

						if (customer && customerAddress && vendor) {
							const vendorAddress = vendor.addresses?.[0];
							const vendorAddressStr = vendorAddress
								? `${vendorAddress.line1 || ''}, ${vendorAddress.city || ''}, ${vendorAddress.state || ''}`.replace(/^,\s*|,\s*$/g, '')
								: 'Address not available';
							const customerAddressStr = `${customerAddress.line1 || ''}, ${customerAddress.city || ''}, ${customerAddress.state || ''}`.replace(/^,\s*|,\s*$/g, '');
							const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer';

							await sendOperatorNewOrderEmail(
								operatorEmails,
								vendor.name || 'Vendor',
								vendorAddressStr,
								customerName,
								customerAddressStr,
								orderId,
								payment.amount,
								payment.currency,
								'orders@fudex.ng'
							);
							console.log(`[Payment] Email notification sent to ${operatorEmails.length} operator(s)`);
						} else {
							console.warn('[Payment] Missing data for operator email notification:', {
								hasCustomer: !!customer,
								hasCustomerAddress: !!customerAddress,
								hasVendor: !!vendor
							});
						}
					} else {
						console.log('[Payment] No operators found to notify via email');
					}
				} catch (emailError) {
					console.error('[Payment] Failed to send email notification to operators:', emailError);
				}

				// Mark notifications as sent (atomic update)
				await tx.payment.update({
					where: { id: paymentId },
					data: {
						notificationsSent: true,
						notificationsSentAt: new Date(),
					},
				});
			}
		}

		return { alreadyCompleted: false, payment };
	});
}

