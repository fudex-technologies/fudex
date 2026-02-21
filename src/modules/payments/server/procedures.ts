import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/trpc/init";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import {
	initializePaystackTransaction,
	verifyPaystackTransaction,
} from "@/lib/paystack";
// Notifications are sent via handlePaymentCompletion (see @/lib/payment-completion.ts)
import { handlePaymentCompletion } from "@/lib/payment-completion";
import { WalletTransactionSource, WalletTransactionType } from "@prisma/client";

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
							await handlePaymentCompletion(order.payment.id, 'create-payment-verify').catch((error) => {
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
						// If verification errored (e.g. network), DO NOT delete the existing PENDING payment.
						// Let the webhook (source-of-truth) reconcile the payment later or the frontend retry verification.
						throw new Error(
							`Paystack verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
						);
					}
				}
			}

			// Validate order amount
			if (order.totalAmount <= 0) {
				throw new Error("Invalid order amount");
			}

			// Calculate external amount after wallet deduction
			const walletDebits = await ctx.prisma.walletTransaction.aggregate({
				where: {
					sourceId: order.id,
					sourceType: WalletTransactionSource.ORDER_PAYMENT,
					type: WalletTransactionType.DEBIT
				},
				_sum: { amount: true }
			});
			const walletUsed = walletDebits._sum.amount?.toNumber() || 0;
			const externalAmount = Math.max(0, order.totalAmount - walletUsed);

			// If already fully paid by wallet
			if (externalAmount <= 0) {
				const payment = await ctx.prisma.payment.create({
					data: {
						orderId: order.id,
						userId,
						amount: 0,
						currency: order.currency,
						provider: "wallet",
						providerRef: `WALLET-FULL-${order.id}`,
						status: "COMPLETED",
						paidAt: new Date(),
					},
				});

				// Handle payment completion logic
				await handlePaymentCompletion(payment.id, 'wallet-full');

				return {
					payment,
					checkoutUrl: null,
					reference: payment.providerRef,
				};
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
					amount: externalAmount,
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
					amount: externalAmount,
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

			// If already completed, just return success
			if (payment.status === "COMPLETED") {
				return {
					verified: true,
					alreadyVerified: true,
					payment,
				};
			}

			// If provider is wallet, we don't need to verify with Paystack
			// It should already be marked as COMPLETED during createPayment, but if it's PENDING for some reason, we handle it
			if (payment.provider === "wallet") {
				await ctx.prisma.payment.update({
					where: { id: payment.id },
					data: { status: "COMPLETED", paidAt: new Date() },
				});

				// Re-fetch to return the updated payment
				const updatedPayment = await ctx.prisma.payment.findUnique({
					where: { id: payment.id },
					include: { order: true },
				});


				await handlePaymentCompletion(payment.id);

				return {
					verified: true,
					alreadyVerified: false,
					payment: updatedPayment,
				};
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
			if (paymentStatus === "COMPLETED") {
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
			}

			// Handle payment completion (updates order status and sends notifications if needed)
			let alreadyCompleted = false;
			if (paymentStatus === "COMPLETED") {
				try {
					const result = await handlePaymentCompletion(payment.id, 'manual-verify');
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

	getPaymentStats: adminProcedure
		.query(async ({ ctx }) => {
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const [
				totalRevenue,
				todayRevenue,
				completedCount,
				pendingCount,
				failedCount,
				refundedCount
			] = await Promise.all([
				ctx.prisma.payment.aggregate({
					_sum: { amount: true },
					where: { status: 'COMPLETED' }
				}),
				ctx.prisma.payment.aggregate({
					_sum: { amount: true },
					where: {
						status: 'COMPLETED',
						paidAt: { gte: today }
					}
				}),
				ctx.prisma.payment.count({ where: { status: 'COMPLETED' } }),
				ctx.prisma.payment.count({ where: { status: 'PENDING' } }),
				ctx.prisma.payment.count({ where: { status: 'FAILED' } }),
				ctx.prisma.payment.count({ where: { status: 'REFUNDED' } })
			]);

			return {
				totalRevenue: totalRevenue._sum.amount || 0,
				todayRevenue: todayRevenue._sum.amount || 0,
				completedCount,
				pendingCount,
				failedCount,
				refundedCount
			};
		}),
});
