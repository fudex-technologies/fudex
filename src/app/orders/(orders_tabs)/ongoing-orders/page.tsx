'use client';

import OngoingOrderItem from '@/components/order-components/OngoingOrderItem';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useOrderingActions } from '@/api-hooks/useOrderingActions';
import { Skeleton } from '@/components/ui/skeleton';
import { PAGES_DATA } from '@/data/pagesData';
import { useRouter } from 'next/navigation';
import { OrderStatus } from '@prisma/client';

export default function OngoingOrdersPage() {
	const router = useRouter();
	const { useListOngoingOrders } = useOrderingActions();

	// Get ongoing orders (PENDING, PAID, PREPARING, ASSIGNED)
	const { data: ongoingOrders = [], isLoading } = useListOngoingOrders({
		take: 50,
	});

	const isEmpty = !isLoading && ongoingOrders.length === 0;

	// Map order status to component status
	const getOrderStatus = (
		status: OrderStatus
	): 'pending' | 'preparing' | 'on-the-way' | 'delivered' => {
		if (status === OrderStatus.PENDING || status === OrderStatus.PAID) {
			return 'pending';
		}
		if (
			status === OrderStatus.ACCEPTED ||
			status === OrderStatus.PREPARING ||
			status === OrderStatus.READY
		) {
			return 'preparing';
		}
		if (
			status === OrderStatus.ASSIGNED ||
			status === OrderStatus.OUT_FOR_DELIVERY
		) {
			return 'on-the-way';
		}
		return 'pending';
	};

	// Calculate estimated time (placeholder - could be enhanced with actual delivery time estimates)
	const getEstimatedTime = (status: OrderStatus): string => {
		if (status === OrderStatus.PENDING || status === OrderStatus.PAID) {
			return '10 - 15 mins';
		}
		if (
			status === OrderStatus.ACCEPTED ||
			status === OrderStatus.PREPARING
		) {
			return '10 - 20 mins';
		}
		if (status === OrderStatus.READY) {
			return '5 - 10 mins';
		}
		if (
			status === OrderStatus.ASSIGNED ||
			status === OrderStatus.OUT_FOR_DELIVERY
		) {
			return '5 - 15 mins';
		}
		return '5 - 10 mins';
	};

	if (isLoading) {
		return (
			<div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-5'>
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={i} className='h-40 w-full rounded-md' />
				))}
			</div>
		);
	}

	return (
		<div className='w-full '>
			{/* Empty state */}
			{isEmpty && (
				<div className='w-full max-w-md gap-5 flex flex-col items-center justify-center mx-auto px-5'>
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
						className='w-full  py-5'
						onClick={() => router.push(PAGES_DATA.home_page)}>
						Order now
					</Button>
				</div>
			)}

			{/* With data state */}
			{!isEmpty && (
				<div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-5'>
					{ongoingOrders.map((order) => {
						const itemCount = order.items.reduce(
							(sum, item) => sum + item.quantity,
							0
						);
						const displayOrderId = order.id
							.slice(0, 8)
							.toUpperCase();

						return (
							<OngoingOrderItem
								key={order.id}
								estimatedTime={getEstimatedTime(order.status)}
								itemCount={itemCount}
								orderId={order.id}
								vendorName={order.vendor?.name || 'Vendor'}
								orderStatus={getOrderStatus(order.status)}
								displayOrderId={displayOrderId}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
}
