import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/trpc/init";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import {
	initializePaystackTransaction,
	verifyPaystackTransaction,
} from "@/lib/paystack";
import { sendOperatorNewOrderEmail, sendVendorNewOrderEmail } from "@/lib/email";
import { NotificationService } from "@/modules/notifications/server/service";
import { PAGES_DATA } from "@/data/pagesData";
import prisma from "@/lib/prisma";
import { handlePaymentCompletion } from "@/lib/payment-completion";

export const paymentRouter = createTRPCRouter({
	// Create a payment record for an order and initialize Paystack transaction
	createPayment: protectedProcedure
		.input(
			z.object({
				orderId: z.string(),
				callbackUrl: z.string().optional(), // Optional callback URL for redirect after payment
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user!.id;

			// Fetch order with user and payment info
			const order = await ctx.prisma.order.findUnique({
				where: { id: input.orderId },
				include: {
					user: true,
					payment: true,
				},
			});

			if (!order) {
				throw new Error("Order not found");
			}

			if (order.userId !== userId) {
				throw new Error("Unauthorized: This order does not belong to you");
			}

			// Check if order already has a payment
			if (order.payment) {
				// If payment is already completed, don't create a new one
				if (order.payment.status === "COMPLETED") {
					throw new Error("Payment already completed for this order");
				}

				// If payment is FAILED, delete it and create a new one
				if (order.payment.status === "FAILED") {
					await ctx.prisma.payment.delete({
						where: { id: order.payment.id },
					});
					// Continue to create new payment below
				} else if (order.payment.status === "PENDING") {
					// Check if it's actually paid on Paystack
					try {
						const verification = await verifyPaystackTransaction(
							order.payment.providerRef
						);

						if (verification.status && verification.data.status === "success") {
							// It WAS paid! Update DB, send notifications, and don't create new one.
							// Update paidAt if not already set
							if (!order.payment.paidAt) {
								await ctx.prisma.payment.update({
									where: { id: order.payment.id },
									data: {
										paidAt: new Date(verification.data.paid_at || new Date()),
									},
								});
							}

							// Handle payment completion (updates status and sends notifications if needed)
							await handlePaymentCompletion(order.payment.id).catch((error) => {
								console.error('[Payment] Error handling payment completion in createPayment:', error);
								// Don't throw - payment is already completed, just notification might have failed
							});

							// Notify user it's already paid
							throw new Error("Payment already completed for this order");
						} else {
							// Not paid on Paystack (or abandoned/failed there).
							// The old reference is likely dead or the user wants a fresh start.
							// Delete the old PENDING payment so we can generate a FRESH reference.
							await ctx.prisma.payment.delete({
								where: { id: order.payment.id },
							});
							// Continue to create new payment below
						}
					} catch (error: any) {
						if (error.message === "Payment already completed for this order") {
							throw error; // Re-throw for frontend to handle
						}
						// If verification errored (e.g. network), we might assume it's safe to retry 
						// OR fail safe. Let's assume if we can't verify, we shouldn't delete blindly?
						// But if the user is clicking "Pay Now", they want to pay.
						// Safest: Delete old and retry.
						await ctx.prisma.payment.delete({
							where: { id: order.payment.id },
						}).catch(() => { }); // Ignore duplicate delete errors
					}
				}
			}

			// Validate order amount
			if (order.totalAmount <= 0) {
				throw new Error("Invalid order amount");
			}

			// Generate unique reference
			const reference = `FUDEX-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

			// Get user email for Paystack
			const userEmail = order.user.email;
			if (!userEmail) {
				throw new Error("User email is required for payment");
			}

			// Build callback URL
			const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
				? process.env.NEXT_PUBLIC_BASE_URL
				: process.env.VERCEL_URL
					? `https://${process.env.VERCEL_URL}`
					: "http://localhost:3000";
			const callbackUrl =
				input.callbackUrl ||
				`${baseUrl}/orders/${order.id}/payment-callback?reference=${reference}`;

			// Initialize Paystack transaction
			let paystackResponse;
			try {
				paystackResponse = await initializePaystackTransaction({
					email: userEmail,
					amount: order.totalAmount,
					reference,
					callback_url: callbackUrl,
					metadata: {
						orderId: order.id,
						userId: userId,
						custom_fields: [
							{
								display_name: "Order ID",
								variable_name: "order_id",
								value: order.id,
							},
						],
					},
					currency: order.currency || "NGN",
				});
			} catch (error) {
				throw new Error(
					`Failed to initialize payment: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}

			if (!paystackResponse.status || !paystackResponse.data) {
				throw new Error(
					paystackResponse.message || "Failed to initialize payment"
				);
			}

			// Create payment record in database
			const payment = await ctx.prisma.payment.create({
				data: {
					orderId: order.id,
					userId,
					amount: order.totalAmount,
					currency: order.currency,
					provider: "paystack",
					providerRef: paystackResponse.data.reference,
					status: "PENDING",
				},
			});

			return {
				payment,
				checkoutUrl: paystackResponse.data.authorization_url,
				reference: paystackResponse.data.reference,
			};
		}),

	// Verify payment by reference (can be called after redirect or via webhook)
	verifyPayment: protectedProcedure
		.input(
			z.object({
				reference: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user!.id;

			// Find payment by reference
			const payment = await ctx.prisma.payment.findFirst({
				where: { providerRef: input.reference },
				include: { order: true },
			});

			if (!payment) {
				throw new Error("Payment not found");
			}

			// Verify ownership
			if (payment.userId !== userId) {
				throw new Error("Unauthorized: This payment does not belong to you");
			}

			// Verify with Paystack
			let verification;
			try {
				verification = await verifyPaystackTransaction(input.reference);
			} catch (error) {
				throw new Error(
					`Payment verification failed: ${error instanceof Error ? error.message : "Unknown error"}`
				);
			}

			if (!verification.status) {
				throw new Error(
					verification.message || "Payment verification failed"
				);
			}

			const paystackData = verification.data;

			// Validate amount matches
			const expectedAmount = payment.amount * 100; // Convert to kobo
			if (paystackData.amount !== expectedAmount) {
				throw new Error("Payment amount mismatch");
			}

			// Update payment status based on Paystack response
			let paymentStatus: "PENDING" | "COMPLETED" | "FAILED" = "PENDING";
			if (paystackData.status === "success") {
				paymentStatus = "COMPLETED";
			} else if (paystackData.status === "failed") {
				paymentStatus = "FAILED";
			}

			// Update payment record with paidAt if completed
			if (paymentStatus === "COMPLETED" && !payment.paidAt) {
				await ctx.prisma.payment.update({
					where: { id: payment.id },
					data: {
						paidAt: paystackData.paid_at || paystackData.paidAt
							? new Date(paystackData.paid_at || paystackData.paidAt || "")
							: new Date(),
					},
				});
			}

			// Update payment status if not already completed
			if (paymentStatus === "COMPLETED" && payment.status !== "COMPLETED") {
				await ctx.prisma.payment.update({
					where: { id: payment.id },
					data: {
						status: "COMPLETED",
					},
				});
			} else if (paymentStatus === "FAILED" && payment.status !== "FAILED") {
				await ctx.prisma.payment.update({
					where: { id: payment.id },
					data: {
						status: "FAILED",
					},
				});

				// SECURITY: Only send notifications if not already sent (idempotency)
				if (!payment.notificationsSent) {
					const vendorId = payment?.order?.vendorId
					const orderId = payment?.orderId
					// Notify Vendor
					if (vendorId && orderId) {
						const vendor = await ctx.prisma.vendor.findUnique({
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
							}).catch(console.error);

							// 2. Notify Vendor (Email)
							if (vendor.owner.email && payment.order) {
								sendVendorNewOrderEmail(
									vendor.owner.email,
									vendor.name,
									orderId,
									payment.order.productAmount,
									payment.order.currency,
									'orders@fudex.ng'
								).catch(console.error);
							}
						}

						// 3. Notify Operators (Push)
						NotificationService.sendToRole('OPERATOR', {
							title: 'New Order Paid! 💰',
							body: `Order #${orderId.slice(0, 8)} has been paid and is ready for processing.`,
							url: PAGES_DATA.operator_dashboard_orders_page // Correct page for operators
						}).catch(console.error);

						// 4. Notify Operators (Email)
						const operators = await ctx.prisma.user.findMany({
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
							const customer = await ctx.prisma.user.findUnique({
								where: { id: payment.userId }
							});
							const customerAddress = await ctx.prisma.address.findUnique(
								{ where: { id: payment.order.addressId! } }
							);
							const vendor = await ctx.prisma.vendor.findUnique(
								{ where: { id: vendorId }, include: { addresses: true } }
							);

							if (customer && customerAddress && vendor) {
								sendOperatorNewOrderEmail(
									operatorEmails,
									vendor.name,
									`${vendor.addresses?.[0]?.line1}, ${vendor.addresses?.[0]?.city}, ${vendor.addresses?.[0]?.state}`,
									`${customer.firstName} ${customer.lastName}`,
									`${customerAddress.line1}, ${customerAddress.city}, ${customerAddress.state}`,
									orderId,
									payment.amount,
									payment.currency,
									'orders@fudex.ng'
								).catch(console.error);
							}
						}
					}

					// Mark notifications as sent
					await ctx.prisma.payment.update({
						where: { id: payment.id },
						data: {
							notificationsSent: true,
							notificationsSentAt: new Date(),
						},
					});
				}
			}

			// Handle payment completion (updates order status and sends notifications if needed)
			let alreadyCompleted = false;
			if (paymentStatus === "COMPLETED") {
				try {
					const result = await handlePaymentCompletion(payment.id);
					alreadyCompleted = result.alreadyCompleted;
				} catch (error) {
					console.error('[Payment] Error handling payment completion:', error);
					// Don't throw - payment is verified, just notification might have failed
				}
			}

			// Re-fetch updated payment
			const updatedPayment = await ctx.prisma.payment.findUnique({
				where: { id: payment.id },
			});

			return {
				payment: updatedPayment,
				verified: paymentStatus === "COMPLETED",
				paystackData,
				// Indicate if this was a duplicate verification
				alreadyVerified: alreadyCompleted || (payment.notificationsSent && paymentStatus === "COMPLETED"),
			};
		}),

	// Get payment status (for checking payment state)
	getPaymentStatus: protectedProcedure
		.input(
			z.object({
				orderId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.user!.id;

			const order = await ctx.prisma.order.findUnique({
				where: { id: input.orderId },
				include: { payment: true },
			});

			if (!order) {
				throw new Error("Order not found");
			}

			if (order.userId !== userId) {
				throw new Error("Unauthorized");
			}

			return {
				order,
				payment: order.payment,
			};
		}),

	getAllPayments: adminProcedure
		.input(z.object({
			skip: z.number().default(0),
			take: z.number().default(50),
			status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]).optional(),
			search: z.string().optional()
		}))
		.query(async ({ ctx, input }) => {
			const where: any = {};
			if (input.status) {
				where.status = input.status;
			}
			if (input.search) {
				where.OR = [
					{ providerRef: { contains: input.search, mode: 'insensitive' } },
					{ user: { email: { contains: input.search, mode: 'insensitive' } } },
					{ orderId: { contains: input.search, mode: 'insensitive' } }
				];
			}

			const payments = await ctx.prisma.payment.findMany({
				where,
				skip: input.skip,
				take: input.take,
				orderBy: { createdAt: 'desc' },
				include: {
					user: { select: { id: true, name: true, email: true } },
					order: {
						select: {
							id: true,
							totalAmount: true,
							currency: true,
							vendor: { select: { name: true } }
						}
					}
				}
			});

			const total = await ctx.prisma.payment.count({ where });

			return { payments, total };
		}),
});
