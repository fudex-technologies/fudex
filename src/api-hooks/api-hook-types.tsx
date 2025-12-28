export interface UseAPICallerOptions {
	silent?: boolean;
	onSuccess?: (data?: unknown) => void;
	onError?: (error?: unknown) => void;
	enabled?: boolean;
}
