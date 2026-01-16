import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhook } from "@/lib/paystack";
import prisma from "@/lib/prisma";

/**
 * Paystack Webhook Handler
 * This endpoint receives payment events from Paystack
 * Docs: https://paystack.com/docs/payments/webhooks
 */
export async function POST(request: NextRequest) {
	try {
		// Get the raw body for signature verification
		const body = await request.text();
		const signature = request.headers.get("x-paystack-signature");

		if (!signature) {
			return NextResponse.json(
				{ error: "Missing signature" },
				{ status: 400 }
			);
		}

		// Verify webhook signature
		const isValid = verifyPaystackWebhook(body, signature);
		if (!isValid) {
			return NextResponse.json(
				{ error: "Invalid signature" },
				{ status: 401 }
			);
		}

		const event = JSON.parse(body);

		// Handle different event types
		switch (event.event) {
			case "charge.success":
				await handleSuccessfulPayment(event.data);
				break;

			case "charge.failed":
				await handleFailedPayment(event.data);
				break;

			case "transfer.success":
			case "transfer.failed":
				// Handle transfer events if needed
				break;

			default:
				console.log(`Unhandled event type: ${event.event}`);
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("Webhook error:", error);
		return NextResponse.json(
			{
				error: "Webhook processing failed",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(data: any) {
	const reference = data.reference;

	if (!reference) {
		throw new Error("Missing reference in webhook data");
	}

	// Find payment by reference
	const payment = await prisma.payment.findFirst({
		where: { providerRef: reference },
		include: { order: true },
	});

	if (!payment) {
		console.error(`Payment not found for reference: ${reference}`);
		return;
	}

	// Validate amount
	const expectedAmount = payment.amount * 100; // Convert to kobo
	if (data.amount !== expectedAmount) {
		console.error(
			`Amount mismatch for payment ${payment.id}: expected ${expectedAmount}, got ${data.amount}`
		);
		return;
	}

	// Update payment status
	await prisma.payment.update({
		where: { id: payment.id },
		data: {
			status: "COMPLETED",
			paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
		},
	});

	// Update order status
	await prisma.order.update({
		where: { id: payment.orderId },
		data: { status: "PAID" },
	});

	// console.log(`Payment ${payment.id} marked as successful`);
}

/**
 * Handle failed payment
 */
async function handleFailedPayment(data: {
	reference: string;
}) {
	const reference = data.reference;

	if (!reference) {
		throw new Error("Missing reference in webhook data");
	}

	// Find payment by reference
	const payment = await prisma.payment.findFirst({
		where: { providerRef: reference },
	});

	if (!payment) {
		console.error(`Payment not found for reference: ${reference}`);
		return;
	}

	// Update payment status
	await prisma.payment.update({
		where: { id: payment.id },
		data: {
			status: "FAILED",
		},
	});

	// console.log(`Payment ${payment.id} marked as failed`);
}

