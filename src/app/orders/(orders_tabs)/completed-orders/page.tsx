'use client';

import OngoingOrderItem from '@/components/order-components/OngoingOrderItem';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useOrderingActions } from '@/api-hooks/useOrderingActions';
import { Skeleton } from '@/components/ui/skeleton';
import { PAGES_DATA } from '@/data/pagesData';
import { useRouter } from 'next/navigation';
import { OrderStatus } from '@prisma/client';

export default function CompletedOrdersPage() {
	const router = useRouter();
	const { useListMyOrders } = useOrderingActions();
	
	// Get completed orders
	const { data: orders = [], isLoading } = useListMyOrders({
		take: 50,
		status: OrderStatus.DELIVERED,
	});

	const isEmpty = !isLoading && orders.length === 0;

	if (isLoading) {
		return (
			<div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-5'>
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={i} className='h-60 w-full rounded-md' />
				))}
			</div>
		);
	}

	return (
		<div className='w-full'>
			{/* Empty state */}
			{isEmpty && (
				<div className='w-full max-w-md mx-auto px-5 flex flex-col gap-5 items-center justify-center my-5'>
					<ImageWithFallback
						src={'/assets/riderillustration.png'}
						className='w-full'
					/>
					<div className='text-center'>
						<p className='text-sm font-light'>
							We're waiting for your first order
						</p>
					</div>
					<Button
						variant={'game'}
						size={'lg'}
						className='w-full py-5'
						onClick={() => router.push(PAGES_DATA.home_page)}>
						Order now
					</Button>
				</div>
			)}

			{/* With data state */}
			{!isEmpty && (
				<div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-5'>
					{orders.map((order) => {
						const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
						const deliveryDate = new Date(order.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
						const deliveryTime = new Date(order.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
						const deliveryAddress = order.address
							? `${order.address.line1}${order.address.line2 ? ', ' + order.address.line2 : ''}, ${order.address.city}${order.address.state ? ', ' + order.address.state : ''}`
							: 'Address not available';
						const pickupTime = new Date(order.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
						const pickupAddress = order.vendor?.name || 'Vendor location';
						const displayOrderId = order.id.slice(0, 8).toUpperCase();

						return (
							<OngoingOrderItem
								key={order.id}
								estimatedTime='5 - 10mins'
								itemCount={itemCount}
								orderId={order.id}
								vendorName={order.vendor?.name || 'Vendor'}
								orderStatus='delivered'
								deliveryDate={deliveryDate}
								deliveryTime={deliveryTime}
								deliveryAddress={deliveryAddress}
								pickupTime={pickupTime}
								pickupAddress={pickupAddress}
								displayOrderId={displayOrderId}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
}
