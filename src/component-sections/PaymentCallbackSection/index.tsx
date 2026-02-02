'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useOrderingActions } from '@/api-hooks/useOrderingActions';
import { PAGES_DATA } from '@/data/pagesData';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const PaymentCallbackSection = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [status, setStatus] = useState<'loading' | 'success' | 'failed'>(
		'loading',
	);
	const [error, setError] = useState<string | null>(null);
	const reference = searchParams.get('reference');

	const verifyPaymentMutation = useOrderingActions().verifyPayment({
		onSuccess: (data) => {
			if ((data as any).alreadyVerified) {
				toast.info('This payment was already verified');
				// Redirect to order details if available, otherwise ongoing orders
				const orderId = (data as any).payment?.orderId;
				if (orderId) {
					router.push(PAGES_DATA.order_info_page(orderId));
				} else {
					router.push(PAGES_DATA.ongoing_orders_page);
				}
			} else if ((data as any).verified) {
				setStatus('success');
			} else {
				// Verification failed (provider status not success)
				setError('Payment verification failed');
				setStatus('failed');
			}
		},
		onError: (err) => {
			setError(
				err instanceof Error
					? err.message
					: 'Payment verification failed',
			);
			setStatus('failed');
		},
		silent: true,
	});

	useEffect(() => {
		if (reference) {
			verifyPaymentMutation.mutate({ reference });
		} else {
			setError('Payment reference not found');
			setStatus('failed');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reference]);

	const handleContinue = () => {
		router.push(PAGES_DATA.ongoing_orders_page);
	};
	return (
		<div className='flex flex-col items-center justify-center min-h-[60vh] gap-6 px-5'>
			{status === 'loading' && (
				<>
					<Loader2 className='w-16 h-16 animate-spin text-primary' />
					<div className='text-center'>
						<h1 className='text-2xl font-semibold mb-2'>
							Verifying Payment
						</h1>
						<p className='text-foreground/70'>
							Please wait while we verify your payment...
						</p>
					</div>
				</>
			)}

			{status === 'success' && (
				<>
					<CheckCircle2 className='w-16 h-16 text-green-500' />
					<div className='text-center'>
						<h1 className='text-2xl font-semibold mb-2'>
							Payment Successful!
						</h1>
						<p className='text-foreground/70 mb-6'>
							Your order has been confirmed and payment received.
						</p>
						<Button
							onClick={handleContinue}
							variant='game'
							size='lg'>
							View Orders
						</Button>
					</div>
				</>
			)}

			{status === 'failed' && (
				<>
					<XCircle className='w-16 h-16 text-destructive' />
					<div className='text-center'>
						<h1 className='text-2xl font-semibold mb-2'>
							Payment Failed
						</h1>
						{error && (
							<p className='text-foreground/70 mb-6'>{error}</p>
						)}
						<div className='flex gap-3 justify-center'>
							<Button
								onClick={() => router.back()}
								variant='outline'
								size='lg'>
								Go Back
							</Button>
							<Button
								onClick={handleContinue}
								variant='game'
								size='lg'>
								View Orders
							</Button>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default PaymentCallbackSection;
