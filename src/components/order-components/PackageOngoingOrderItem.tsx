'use client';

import { Badge } from '../ui/badge';
import { Check, ChevronRight, CreditCard, Package } from 'lucide-react';
import { Separator } from '../ui/separator';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useState } from 'react';
import { usePackageActions } from '@/api-hooks/usePackageActions';
import { toast } from 'sonner';
import { formatCurency } from '@/lib/commonFunctions';

const PackageOngoingOrderItem = ({ packageOrder }: { packageOrder: any }) => {
	const {
		id,
		status,
		package: pkg,
		items,
		totalAmount,
		deliveryDate,
		timeSlot,
		recipientCity,
		payment,
	} = packageOrder;

	const { createPackagePayment, verifyPackagePayment } = usePackageActions();
	const createPackagePaymentMutation = createPackagePayment();
	const verifyPackagePaymentMutation = verifyPackagePayment();

	const itemCount = items.reduce(
		(sum: number, item: any) => sum + item.quantity,
		0,
	);
	// Format ID for display (first 8 chars)
	const displayOrderId = id.slice(0, 8).toUpperCase();

	const handlePayNow = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();

		try {
			const result = await createPackagePaymentMutation.mutateAsync({
				packageOrderId: id,
				// Optional: Add a callback URL if needed, otherwise backend handles it
			});
			// Redirect to Paystack checkout
			if (result.checkoutUrl) {
				window.location.href = result.checkoutUrl;
			}
		} catch (error: any) {
			// If payment is already completed (caught by backend check), refresh to show updated status
			if (error.message?.includes('Payment already completed')) {
				toast.success('Payment was already completed!');
				window.location.reload();
				return;
			}
			toast.error(error.message || 'Failed to initialize payment');
		}
	};

	const handleCheckStatus = async (
		e: React.MouseEvent<HTMLButtonElement>,
	) => {
		e.preventDefault();
		e.stopPropagation();

		if (!payment?.providerRef) {
			toast.error('No payment reference found to verify.');
			return;
		}

		const toastId = toast.loading('Verifying payment status...');

		try {
			// Call verification directly
			const result = await verifyPackagePaymentMutation.mutateAsync({
				reference: payment.providerRef,
			});

			if (result.status === 'COMPLETED' || result.status === 'PAID') {
				toast.success('Payment confirmed! Updating status...', {
					id: toastId,
				});
				// Reload to show updated status
				window.location.reload();
			} else {
				toast.error(
					`Payment is still ${result.status.toLowerCase()}. Please try paying again if you haven't.`,
					{ id: toastId },
				);
			}
		} catch (error: any) {
			console.error('Verification error:', error);
			// Fallback to redirect if direct verification fails or errors
			toast.dismiss(toastId);
			const baseUrl =
				typeof window !== 'undefined'
					? window.location.origin
					: process.env.NEXT_PUBLIC_BASE_URL || '';

			const callbackUrl = `${baseUrl}/packages/orders/${id}/payment-callback?reference=${payment.providerRef}`;
			window.location.href = callbackUrl;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'PAID':
				return 'text-success bg-success/10';
			case 'PREPARING':
			case 'ACCEPTED':
			case 'READY':
				return 'text-chart-4 bg-chart-4/10';
			case 'ASSIGNED':
			case 'OUT_FOR_DELIVERY':
				return 'text-chart-3 bg-chart-3/10';
			case 'DELIVERED':
				return 'text-primary bg-primary/10';
			case 'CANCELLED':
				return 'text-destructive bg-destructive/10';
			default: // PENDING
				return 'text-muted-foreground bg-muted';
		}
	};

	const formatDate = (date: string | Date) => {
		if (!date) return '';
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	return (
		<div className='p-5 border border-foreground/50 rounded-md flex flex-col gap-3 h-fit bg-card'>
			<div className='flex gap-2'>
				<div className=''>
					<ImageWithFallback
						width={60}
						height={60}
						src={
							pkg?.coverImage ||
							'/assets/images/package-default.png'
						}
						className='object-cover rounded-md aspect-square'
						alt={pkg?.name || 'Package'}
					/>
				</div>

				<div className='flex-1'>
					<div className='w-full flex justify-between items-start'>
						<p className='text-lg font-semibold line-clamp-1'>
							{pkg?.name}
						</p>

						<Badge
							className={cn(
								'capitalize w-fit h-fit shrink-0 ml-2',
								getStatusColor(status),
							)}>
							{status.toLowerCase().replace(/_/g, ' ')}
						</Badge>
					</div>

					<div className='w-full flex flex-col gap-1 mt-1'>
						<div className='flex items-center justify-between text-sm font-light'>
							<div className='flex gap-2 items-center'>
								<p>{itemCount} items</p>
								<Separator
									orientation='vertical'
									className='h-3'
								/>
								<p>{formatCurency(totalAmount)}</p>
							</div>
							<p className='text-xs text-muted-foreground'>
								#{displayOrderId}
							</p>
						</div>

						{(status === 'PENDING' || status === 'PAID') &&
							deliveryDate && (
								<p className='text-xs text-muted-foreground'>
									Delivery: {formatDate(deliveryDate)}{' '}
									{timeSlot ? `(${timeSlot})` : ''}
								</p>
							)}
					</div>
				</div>
			</div>

			{status === 'PENDING' && (
				<>
					<Separator
						orientation='horizontal'
						className='bg-foreground/50'
					/>
					<div className='flex gap-2'>
						<Button
							onClick={handlePayNow}
							variant={'game'}
							className='flex-1 py-5'>
							<CreditCard className='w-4 h-4 mr-2' />
							Pay Now
						</Button>
						{payment?.providerRef && (
							<Button
								onClick={handleCheckStatus}
								variant={'outline'}
								className='flex-1 border-primary text-primary py-5'>
								<Check className='w-4 h-4 mr-2' />
								Check Status
							</Button>
						)}
					</div>
				</>
			)}

			{/* Show delivery info if delivered */}
			{status === 'DELIVERED' && (
				<>
					<Separator
						orientation='horizontal'
						className='bg-foreground/50'
					/>
					<div className='flex gap-3 items-center'>
						<ImageWithFallback
							src={'/assets/locationIcon.svg'}
							width={20}
							height={20}
							alt='Location'
						/>
						<div>
							<p className='text-xs text-muted-foreground'>
								Delivered to
							</p>
							<p className='text-sm'>{recipientCity}</p>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default PackageOngoingOrderItem;
