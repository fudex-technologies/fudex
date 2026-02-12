import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhook } from "@/lib/paystack";
import prisma from "@/lib/prisma";
import { handlePaymentCompletion } from "@/lib/payment-completion";
import { WalletService } from "@/modules/wallet/server/service";
import { handlePackagePaymentCompletion } from "@/lib/package-payment-completion";

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

	// 1. Check if it's a Wallet Funding attempt
	const funding = await prisma.walletFunding.findUnique({
		where: { providerRef: reference },
	});

	if (funding) {
		console.log(`[Webhook] Processing Wallet Funding for reference: ${reference}`);
		await WalletService.completeFunding(reference, data.paid_at ? new Date(data.paid_at) : new Date());
		return;
	}

	// 2. Check if it's a Standard Order Payment
	const payment = await prisma.payment.findFirst({
		where: { providerRef: reference },
	});

	if (payment) {
		// Validate amount
		const expectedAmount = payment.amount * 100; // Convert to kobo
		if (data.amount !== expectedAmount) {
			console.error(`[Webhook] Amount mismatch for payment ${payment.id}: expected ${expectedAmount}, got ${data.amount}`);
			return;
		}

		// Update paidAt if provided and not already set
		if (data.paid_at && !payment.paidAt) {
			await prisma.payment.update({
				where: { id: payment.id },
				data: { paidAt: new Date(data.paid_at) },
			});
		}

		// Handle payment completion
		await handlePaymentCompletion(payment.id).catch(err => {
			console.error(`[Webhook] Error handling payment completion for ${payment.id}:`, err);
		});
		return;
	}

	// 3. Check if it's a Package Order Payment
	const packagePayment = await prisma.packagePayment.findFirst({
		where: { providerRef: reference },
	});

	if (packagePayment) {
		// Validate amount
		const expectedAmount = packagePayment.amount * 100; // Convert to kobo
		if (data.amount !== expectedAmount) {
			console.error(`[Webhook] Amount mismatch for package payment ${packagePayment.id}: expected ${expectedAmount}, got ${data.amount}`);
			return;
		}

		// Update paidAt if provided and not already set
		if (data.paid_at && !packagePayment.paidAt) {
			await prisma.packagePayment.update({
				where: { id: packagePayment.id },
				data: { paidAt: new Date(data.paid_at) },
			});
		}

		// Handle package payment completion
		await handlePackagePaymentCompletion(packagePayment.id).catch(err => {
			console.error(`[Webhook] Error handling package payment completion for ${packagePayment.id}:`, err);
		});
		return;
	}

	console.error(`[Webhook] No record found for reference: ${reference}`);
}

/**
 * Handle failed payment
 */
async function handleFailedPayment(data: { reference: string }) {
	const reference = data.reference;
	if (!reference) throw new Error("Missing reference in webhook data");

	// 1. Try Wallet Funding
	const funding = await prisma.walletFunding.findUnique({
		where: { providerRef: reference },
	});
	if (funding) {
		await prisma.walletFunding.update({
			where: { id: funding.id },
			data: { status: "FAILED" },
		});
		return;
	}

	// 2. Try Standard Payment
	const payment = await prisma.payment.findFirst({
		where: { providerRef: reference },
	});
	if (payment) {
		await prisma.payment.update({
			where: { id: payment.id },
			data: { status: "FAILED" },
		});
		return;
	}

	// 3. Try Package Payment
	const packagePayment = await prisma.packagePayment.findFirst({
		where: { providerRef: reference },
	});
	if (packagePayment) {
		await prisma.packagePayment.update({
			where: { id: packagePayment.id },
			data: { status: "FAILED" },
		});
		return;
	}
}

