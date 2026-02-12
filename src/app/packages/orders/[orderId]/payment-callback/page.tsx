'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePackageActions } from '@/api-hooks/usePackageActions';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { PAGES_DATA } from '@/data/pagesData';

export default function PackagePaymentCallbackPage({
	params,
}: {
	params: { orderId: string };
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const reference = searchParams.get('reference');

	const [verificationState, setVerificationState] = useState<
		'verifying' | 'success' | 'failed'
	>('verifying');

	const { verifyPackagePayment } = usePackageActions();

	const verifyMutation = verifyPackagePayment({
		onSuccess: (data) => {
			setVerificationState('success');
			// Redirect to order details or success page after 2 seconds
			setTimeout(() => {
				router.push(PAGES_DATA.profile_page); // Update this to package orders page when created
			}, 2000);
		},
		onError: (error) => {
			console.error('Payment verification failed:', error);
			setVerificationState('failed');
		},
		silent: true, // Don't show toast, we'll handle UI ourselves
	});

	useEffect(() => {
		if (!reference) {
			setVerificationState('failed');
			return;
		}

		// Verify payment
		verifyMutation.mutate({ reference });
	}, [reference]);

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
			<div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8'>
				{verificationState === 'verifying' && (
					<div className='text-center'>
						<Loader2 className='w-16 h-16 text-purple-600 animate-spin mx-auto mb-4' />
						<h2 className='text-2xl font-bold text-gray-900 mb-2'>
							Verifying Payment
						</h2>
						<p className='text-gray-600'>
							Please wait while we confirm your payment...
						</p>
					</div>
				)}

				{verificationState === 'success' && (
					<div className='text-center'>
						<CheckCircle2 className='w-16 h-16 text-green-600 mx-auto mb-4' />
						<h2 className='text-2xl font-bold text-gray-900 mb-2'>
							Payment Successful! 🎉
						</h2>
						<p className='text-gray-600 mb-4'>
							Your package order has been confirmed. You will be
							redirected shortly...
						</p>
						<div className='bg-green-50 border border-green-200 rounded-lg p-4'>
							<p className='text-sm text-green-800'>
								Our team will prepare your package for delivery
								on the scheduled date.
							</p>
						</div>
					</div>
				)}

				{verificationState === 'failed' && (
					<div className='text-center'>
						<XCircle className='w-16 h-16 text-red-600 mx-auto mb-4' />
						<h2 className='text-2xl font-bold text-gray-900 mb-2'>
							Payment Verification Failed
						</h2>
						<p className='text-gray-600 mb-4'>
							We couldn't verify your payment. This could be
							because:
						</p>
						<ul className='text-left text-sm text-gray-600 mb-6 space-y-2'>
							<li>• The payment was not completed</li>
							<li>• The payment reference is invalid</li>
							<li>• There was a network issue</li>
						</ul>
						<div className='flex flex-col gap-3'>
							<button
								onClick={() =>
									router.push(PAGES_DATA.profile_page)
								}
								className='w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors'>
								Go to My Orders
							</button>
							<button
								onClick={() =>
									router.push(PAGES_DATA.home_page)
								}
								className='w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors'>
								Return Home
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
