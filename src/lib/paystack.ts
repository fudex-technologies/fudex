/**
 * Paystack Integration Service
 * Handles all Paystack API interactions securely
 */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY;
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
 * Get list of banks supported by Paystack
 */
export async function getPaystackBanks(): Promise<{
	status: boolean;
	message: string;
	data: Array<{
		name: string;
		code: string;
		active: boolean;
	}>;
}> {
	if (!PAYSTACK_SECRET_KEY) {
		throw new Error("Paystack secret key is not configured");
	}

	const url = `${PAYSTACK_BASE_URL}/bank?currency=NGN`;

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
 * Create a transfer recipient on Paystack
 */
export async function createPaystackRecipient(params: {
	name: string;
	account_number: string;
	bank_code: string;
	currency?: string;
}): Promise<{
	status: boolean;
	message: string;
	data: {
		recipient_code: string;
		active: boolean;
		id: number;
		name: string;
		details: {
			account_number: string;
			bank_code: string;
			bank_name: string;
		};
	};
}> {
	if (!PAYSTACK_SECRET_KEY) {
		throw new Error("Paystack secret key is not configured");
	}

	const url = `${PAYSTACK_BASE_URL}/transferrecipient`;

	const response = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			type: "nuban",
			name: params.name,
			account_number: params.account_number,
			bank_code: params.bank_code,
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
 * Initiate a single transfer
 */
export async function initiatePaystackTransfer(params: {
	amount: number; // in Naira
	recipient: string; // recipient code
	reference?: string;
	reason?: string;
}): Promise<{
	status: boolean;
	message: string;
	data: {
		reference: string;
		transfer_code: string;
		amount: number;
		status: string;
	};
}> {
	if (!PAYSTACK_SECRET_KEY) {
		throw new Error("Paystack secret key is not configured");
	}

	const url = `${PAYSTACK_BASE_URL}/transfer`;

	const response = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			source: "balance",
			amount: Math.round(params.amount * 100), // Convert to kobo
			recipient: params.recipient,
			reference: params.reference,
			reason: params.reason,
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
 * Initiate bulk transfers
 */
export async function initiatePaystackBulkTransfer(params: {
	transfers: Array<{
		amount: number; // in Naira
		recipient: string;
		reference?: string;
	}>;
}): Promise<{
	status: boolean;
	message: string;
	data: Array<{
		reference: string;
		transfer_code: string;
		status: string;
	}>;
}> {
	if (!PAYSTACK_SECRET_KEY) {
		throw new Error("Paystack secret key is not configured");
	}

	const url = `${PAYSTACK_BASE_URL}/transfer/bulk`;

	const response = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			source: "balance",
			currency: "NGN",
			transfers: params.transfers.map(t => ({
				amount: Math.round(t.amount * 100),
				recipient: t.recipient,
				reference: t.reference,
			})),
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
 * Get Paystack public key (for frontend use)
 */
export function getPaystackPublicKey(): string {
	if (!PAYSTACK_PUBLIC_KEY) {
		throw new Error("Paystack public key is not configured");
	}
	return PAYSTACK_PUBLIC_KEY;
}

