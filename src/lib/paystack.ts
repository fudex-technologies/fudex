/**
 * Paystack Integration Service
 * Handles all Paystack API interactions securely
 */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

if (!PAYSTACK_SECRET_KEY) {
	console.warn("PAYSTACK_SECRET_KEY is not set. Payment functionality will not work.");
}

export interface PaystackInitializeResponse {
	status: boolean;
	message: string;
	data: {
		authorization_url: string;
		access_code: string;
		reference: string;
	};
}

export interface PaystackVerifyResponse {
	status: boolean;
	message: string;
	data: {
		id: number;
		domain: string;
		status: string;
		reference: string;
		amount: number;
		message: string;
		gateway_response: string;
		paid_at: string | null;
		created_at: string;
		channel: string;
		currency: string;
		ip_address: string;
			metadata: {
				custom_fields: Array<{
					display_name: string;
					variable_name: string;
					value: string;
				}>;
			};
			log: unknown;
			fees: number;
			fees_split: unknown;
			authorization: {
				authorization_code: string;
				bin: string;
				last4: string;
				exp_month: string;
				exp_year: string;
				channel: string;
				card_type: string;
				bank: string;
				country_code: string;
				brand: string;
				reusable: boolean;
				signature: string;
				account_name: string | null;
			};
			customer: {
				id: number;
				first_name: string;
				last_name: string;
				email: string;
				customer_code: string;
				phone: string | null;
				metadata: unknown;
				risk_action: string;
			};
			plan: unknown;
			split: unknown;
			order_id: number | null;
			paidAt: string | null;
			createdAt: string;
			requested_amount: number;
			pos_transaction_data: unknown;
			source: unknown;
			fees_breakdown: unknown;
	};
}

export interface InitializeTransactionParams {
	email: string;
	amount: number; // in kobo (smallest currency unit)
	reference: string;
	callback_url?: string;
	metadata?: Record<string, unknown>;
	currency?: string;
}

/**
 * Initialize a Paystack transaction
 */
export async function initializePaystackTransaction(
	params: InitializeTransactionParams
): Promise<PaystackInitializeResponse> {
	if (!PAYSTACK_SECRET_KEY) {
		throw new Error("Paystack secret key is not configured");
	}

	const url = `${PAYSTACK_BASE_URL}/transaction/initialize`;

	const response = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email: params.email,
			amount: Math.round(params.amount * 100), // Convert to kobo
			reference: params.reference,
			callback_url: params.callback_url,
			metadata: params.metadata,
			currency: params.currency || "NGN",
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			error.message || `Paystack API error: ${response.statusText}`
		);
	}

	return response.json();
}

/**
 * Verify a Paystack transaction by reference
 */
export async function verifyPaystackTransaction(
	reference: string
): Promise<PaystackVerifyResponse> {
	if (!PAYSTACK_SECRET_KEY) {
		throw new Error("Paystack secret key is not configured");
	}

	const url = `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			error.message || `Paystack API error: ${response.statusText}`
		);
	}

	return response.json();
}

/**
 * Verify Paystack webhook signature
 */
export function verifyPaystackWebhook(
	payload: string | Buffer,
	signature: string
): boolean {
	if (!PAYSTACK_SECRET_KEY) {
		return false;
	}

	// Dynamic import for Node.js crypto module
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const crypto = require("crypto");
	const hash = crypto
		.createHmac("sha512", PAYSTACK_SECRET_KEY)
		.update(payload)
		.digest("hex");

	return hash === signature;
}

/**
 * Get Paystack public key (for frontend use)
 */
export function getPaystackPublicKey(): string {
	if (!PAYSTACK_PUBLIC_KEY) {
		throw new Error("Paystack public key is not configured");
	}
	return PAYSTACK_PUBLIC_KEY;
}

