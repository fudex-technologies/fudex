import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import {
	initializePaystackTransaction,
	verifyPaystackTransaction,
} from "@/lib/paystack";

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

				// If payment is pending, return existing payment info
				if (order.payment.status === "PENDING") {
					// Verify if payment was completed
					try {
						const verification = await verifyPaystackTransaction(
							order.payment.providerRef
						);

						if (verification.status && verification.data.status === "success") {
							// Update payment status
							await ctx.prisma.payment.update({
								where: { id: order.payment.id },
								data: {
									status: "COMPLETED",
									paidAt: new Date(verification.data.paid_at || new Date()),
								},
							});

							// Update order status
							await ctx.prisma.order.update({
								where: { id: order.id },
								data: { status: "PAID" },
							});

							throw new Error("Payment already completed for this order");
						}
					} catch (error) {
						// If verification fails, continue with existing payment
					}

					// Return existing payment with new checkout URL
					const checkoutUrl = `https://checkout.paystack.com/${order.payment.providerRef}`;
					return {
						payment: order.payment,
						checkoutUrl,
						reference: order.payment.providerRef,
					};
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
			const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
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

			// Update payment record
			const updatedPayment = await ctx.prisma.payment.update({
				where: { id: payment.id },
				data: {
					status: paymentStatus,
					paidAt:
						paystackData.paid_at || paystackData.paidAt
							? new Date(paystackData.paid_at || paystackData.paidAt || "")
							: paymentStatus === "COMPLETED"
								? new Date()
								: null,
				},
			});

			// Update order status if payment is completed
			if (paymentStatus === "COMPLETED") {
				await ctx.prisma.order.update({
					where: { id: payment.orderId },
					data: { status: "PAID" },
				});
			}

			return {
				payment: updatedPayment,
				verified: paymentStatus === "COMPLETED",
				paystackData,
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
});
