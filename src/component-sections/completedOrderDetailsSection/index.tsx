'use client';

import { buttonVariants } from '@/components/ui/button';
import { PAGES_DATA } from '@/data/pagesData';
import { formatCurency, normalizePhoneNumber } from '@/lib/commonFunctions';
import { FUDEX_PHONE_NUMBER } from '@/lib/staticData/contactData';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useOrderingActions } from '@/api-hooks/useOrderingActions';
import { Skeleton } from '@/components/ui/skeleton';
import { addIssueToContext } from 'zod/v3';

const CompletedOrderDetailsSection = ({ orderId }: { orderId: string }) => {
	const { useGetOrder } = useOrderingActions();
	const { data: order, isLoading } = useGetOrder({ id: orderId });

	console.log(order);

	if (isLoading) {
		return (
			<div className='w-full max-w-lg py-10 space-y-5'>
				<Skeleton className='h-40 w-full' />
				<Skeleton className='h-60 w-full' />
				<Skeleton className='h-40 w-full' />
			</div>
		);
	}

	if (!order) {
		return (
			<div className='w-full max-w-lg py-10 px-5'>
				<p className='text-center text-foreground/50'>
					Order not found
				</p>
			</div>
		);
	}

	const displayOrderId = order.id.slice(0, 8).toUpperCase();
	const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

	const pickupDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
	const pickupTime = new Date(order.createdAt).toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});
	const deliveryDate = new Date(order.updatedAt).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
	const deliveryTime = new Date(order.updatedAt).toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});

	const pickupAddress = order.vendor?.name || 'Vendor location';
	const deliveryAddress = order.address
		? `${order.address.line1}${
				order.address.line2 ? ', ' + order.address.line2 : ''
			}, ${order.address.city}${
				order.address.state ? ', ' + order.address.state : ''
			}`
		: 'Address not available';

	return (
		<>
			<div className='w-full max-w-lg py-10 space-y-5'>
				<div className='w-full space-y-5 px-5'>
					<div className='w-full'>
						<p className='font-light'>
							Picked at {pickupDate} at {pickupTime}
						</p>
						<p className='font-semibold'>{pickupAddress}</p>
					</div>
					<div className='w-full'>
						<p className='font-light'>
							Delivered at {deliveryDate} at {deliveryTime}
						</p>
						<p className='font-semibold'>{deliveryAddress}</p>
					</div>
				</div>
				<div className='w-full flex flex-col'>
					<div className='px-5 py-2 bg-muted text-muted-foreground'>
						<p className='text-lg font-bold'>Payment Summary</p>
					</div>
					<div className='flex items-center justify-between py-1 px-5'>
						<p>
							Sub-total ({itemCount} item
							{itemCount !== 1 ? 's' : ''})
						</p>
						<p className='font-semibold'>
							{formatCurency(order.productAmount, {
								ShowFree: true,
							})}
						</p>
					</div>
					<div className='flex items-center justify-between py-1 px-5'>
						<p>Delivery fee</p>
						<p className='font-semibold'>
							{formatCurency(order.deliveryFee, {
								ShowFree: true,
							})}
						</p>
					</div>
					<div className='flex items-center justify-between py-1 px-5'>
						<p>Service fee</p>
						<p className='font-semibold'>
							{formatCurency(order.serviceFee, {
								ShowFree: true,
							})}
						</p>
					</div>
					<div className='flex items-center justify-between py-1 px-5'>
						<p className='font-semibold'>Total</p>
						<p className='font-semibold'>
							{formatCurency(order.totalAmount, {
								ShowFree: true,
							})}
						</p>
					</div>
				</div>
				<div className='w-full flex flex-col'>
					<div className='px-5 py-2 bg-muted text-muted-foreground'>
						<p className='text-lg font-bold'>Package Details</p>
					</div>
					<div className='flex flex-col  text-start justify-between py-1 px-5'>
						<p className='font-light'>Package ID</p>
						<p className='font-semibold'>#{displayOrderId}</p>
					</div>
					<div className='flex flex-col text-start justify-between py-1 px-5'>
						<p className='font-light'>Package items</p>
						<div className='flex flex-col gap-1'>
							{order.items.map((item) => (
								<div key={item.id} className='flex-1'>
									<div className='flex gap-1 items-center'>
										<span className='w-2 h-2 rounded-full bg-foreground' />{' '}
										<p className='text-lg capitalize'>
											{item.productItem.name}
										</p>
									</div>
									{item.addons && item.addons.length > 0 && (
										<div className='flex flex-col gap-1 pl-3 mt-1'>
											{item.addons.map((addon, idx) => {
												return (
													<p
														className='font-light text-sm'
														key={idx}>
														{
															addon
																.addonProductItem
																.name
														}{' '}
														x{addon.quantity}
													</p>
												);
											})}
										</div>
									)}
								</div>
							))}
						</div>
					</div>
					<div className='flex flex-col  text-start justify-between py-1 px-5'>
						<p className='font-light'>Date</p>
						<p className='font-semibold'>
							{deliveryDate} at {deliveryTime}
						</p>
					</div>
					{order.notes && (
						<div className='flex flex-col  text-start justify-between py-1 px-5'>
							<p className='font-light'>Delivery instructions</p>
							<p className='font-semibold'>{order.notes}</p>
						</div>
					)}
				</div>
			</div>
			<>
				{/* <div className='mb-[60px]' /> */}
				<div className='fixed bottom-0 left-0 w-screen  bg-background border-t border-t-[#85858540] h-[100px] text-[#858585] px-5 flex justify-center'>
					<div className='w-full h-full flex gap-5 items-center justify-between max-w-lg'>
						<a
							href={`https://wa.me/${normalizePhoneNumber(
								FUDEX_PHONE_NUMBER,
							)}?text=Hello%20FUDEX%20`}
							target='__blacnk'
							rel='noreferrer'
							className={cn(
								buttonVariants({
									variant: 'outline',
									className:
										'border-primary text-primary flex-1 py-6',
								}),
							)}>
							Need help?
						</a>
						{/* {order.vendorId && (
							<Link
								href={PAGES_DATA.single_vendor_rate_page(
									order.vendorId
								)}
								className={cn(
									buttonVariants({
										variant: 'game',
										className: 'flex-1 py-6',
									})
								)}>
								Rate your order
							</Link>
						)} */}
					</div>
				</div>
			</>
		</>
	);
};

export default CompletedOrderDetailsSection;
