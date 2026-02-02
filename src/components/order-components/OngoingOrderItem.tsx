'use client';

import { Badge } from '../ui/badge';
import { Check, ChevronRight, Repeat, CreditCard } from 'lucide-react';
import { Separator } from '../ui/separator';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';
import { Button } from '../ui/button';
import ConfirmOrderDeliveryModal from './ConfirmOrderDeliveryModal';
import { useState } from 'react';
import { useOrderingActions } from '@/api-hooks/useOrderingActions';
import { toast } from 'sonner';

const OngoingOrderItem = ({
	vendorName,
	orderStatus,
	itemCount,
	estimatedTime,
	orderId,
	vendorImage,

	deliveryDate,
	deliveryTime,
	deliveryAddress,
	pickupTime,
	pickupAddress,
	displayOrderId,
	paymentRef,
}: {
	displayOrderId: string;
	vendorName: string;
	vendorImage?: string;
	orderStatus:
		| 'preparing'
		| 'on-the-way'
		| 'pending'
		| 'delivered'
		| 'pending'
		| 'paid';
	itemCount: number;
	estimatedTime: string;
	orderId: string;

	// if orderstatus is delivered
	deliveryDate?: string;
	deliveryTime?: string;
	deliveryAddress?: string;
	pickupTime?: string;
	pickupAddress?: string;
	paymentRef?: string;
}) => {
	// If orderId is short (8 chars), it's a display ID, otherwise use as-is
	const linkOrderId = orderId.length === 8 ? orderId : orderId;
	const [open, setOpen] = useState(false);
	const { createPayment } = useOrderingActions();
	const createPaymentMutation = createPayment();

	const retryPayment = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();

		try {
			const result = await createPaymentMutation.mutateAsync({ orderId });
			// Redirect to Paystack checkout
			window.location.href = result.checkoutUrl;
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

	const verifyPayment = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();

		const baseUrl =
			typeof window !== 'undefined'
				? window.location.origin
				: process.env.NEXT_PUBLIC_BASE_URL || '';
		const callbackUrl = `${baseUrl}/orders/${orderId}/payment-callback?reference=${paymentRef}`;
		window.location.href = callbackUrl;
	};

	return (
		<Link
			href={
				orderStatus === 'delivered'
					? PAGES_DATA.completed_order_info_page(linkOrderId)
					: PAGES_DATA.order_info_page(linkOrderId)
			}
			className='p-5 border border-foreground/50 rounded-md flex flex-col gap-3 h-fit'>
			<div className='flex gap-2'>
				<div className=''>
					<ImageWithFallback
						width={60}
						height={60}
						src={vendorImage || '/assets/products/prod1.png'}
						className='object-cover rounded-md '
					/>
				</div>

				<div className='flex-1'>
					<div className='w-full flex justify-between'>
						<p className='text-lg font-semibold'>{vendorName}</p>

						<Badge
							className={cn(
								'capitalize w-fit h-fit',
								orderStatus === 'paid' &&
									'text-success bg-success/10',
								orderStatus === 'preparing' &&
									'text-chart-4 bg-chart-4/10',
								orderStatus === 'on-the-way' &&
									'text-chart-3 bg-chart-3/10',
								orderStatus === 'delivered' &&
									'text-primary bg-primary/10',
							)}>
							{orderStatus}
						</Badge>
					</div>
					{orderStatus !== 'delivered' && (
						<div className='w-full flex gap-3 justify-between items-center'>
							<div className='font-light'>
								<div className='flex gap-2'>
									<p>{itemCount} items</p>
									<Separator orientation='vertical' />
									<p>{estimatedTime}</p>
								</div>
								<p>Order ID: #{displayOrderId}</p>
							</div>
							<ChevronRight />
						</div>
					)}
					{orderStatus === 'delivered' && deliveryDate && (
						<p>
							{deliveryDate}{' '}
							{deliveryTime && `at ${deliveryTime}`}
						</p>
					)}
				</div>
			</div>

			{orderStatus === 'pending' && (
				<>
					<Separator
						orientation='horizontal'
						className='bg-foreground/50'
					/>
					<div className='flex gap-2'>
						<Button
							onClick={retryPayment}
							variant={'game'}
							className='flex-1 py-5'>
							<CreditCard />
							Pay Now
						</Button>
						{paymentRef && (
							<Button
								onClick={verifyPayment}
								variant={'outline'}
								className='flex-1 border-primary text-primary py-5'>
								<Check />
								Check Status
							</Button>
						)}
					</div>
				</>
			)}
			{orderStatus === 'on-the-way' && (
				<>
					<Separator
						orientation='horizontal'
						className='bg-foreground/50'
					/>
					<ConfirmOrderDeliveryModal
						open={open}
						setOpen={setOpen}
						orderId={orderId}
					/>
				</>
			)}

			{orderStatus === 'delivered' && (
				<>
					<Separator
						orientation='horizontal'
						className='bg-foreground/50'
					/>

					<div className='w-full space-y-2'>
						<div className='w-full flex gap-3 items-center'>
							<ImageWithFallback
								src={'/assets/locationIcon.svg'}
								width={20}
								height={20}
								alt='Location'
							/>
							<div className='flex justify-center gap-1'>
								<span className='w-2 h-2 rounded-full bg-destructive' />
								<span className='w-2 h-2 rounded-full from-destructive to-primary bg-linear-to-tr' />
								<span className='w-2 h-2 rounded-full bg-primary' />
							</div>
							<div className=''>
								<p className='text-light text-foreground/50'>
									Picked up at {pickupTime}
								</p>
								<p className=''>{pickupAddress}</p>
							</div>
						</div>
						<div className='w-full flex gap-3 items-center'>
							<div className='flex justify-center gap-1'>
								<span className='w-2 h-2 rounded-full bg-destructive' />
								<span className='w-2 h-2 rounded-full from-destructive to-primary bg-linear-to-tr' />
								<span className='w-2 h-2 rounded-full bg-primary' />
							</div>
							<ImageWithFallback
								src={'/assets/locationIcon.svg'}
								width={20}
								height={20}
								alt='Location'
							/>
							<div className=''>
								<p className='text-light text-foreground/50'>
									Delivered at {deliveryTime}
								</p>
								<p className=''>{deliveryAddress}</p>
							</div>
						</div>
					</div>

					{/* <Separator
						orientation='horizontal'
						className='bg-foreground/50'
					/>

					<Button
						variant={'outline'}
						className='w-full border-primary text-primary py-5'>
						<Repeat />
						Repeat Order
					</Button> */}
				</>
			)}
		</Link>
	);
};

export default OngoingOrderItem;
