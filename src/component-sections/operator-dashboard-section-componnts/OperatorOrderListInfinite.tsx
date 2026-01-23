'use client';

import { useOperatorActions } from '@/api-hooks/useOperatorActions';
import { OrderStatus } from '@prisma/client';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import OperatorOrderCard from './OperatorOrderCard';
import TabComponent from '@/components/TabComponent';
import { ShoppingBag, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function OperatorOrderListInfinite() {
	const { useInfiniteListOrders, useListRiders } = useOperatorActions();
	const [activeTab, setActiveTab] = useState<string>('active');
	const { ref, inView } = useInView();

	const statusFilter = (tab: string): OrderStatus | undefined => {
		switch (tab) {
			case 'pending':
				return OrderStatus.PENDING;
			case 'delivered':
				return OrderStatus.DELIVERED;
			case 'cancelled':
				return OrderStatus.CANCELLED;
			default:
				return undefined;
		}
	};

	// For 'active' tab, we might want a custom filter in the backend,
	// but for now let's just show all or implement client-side filtering if needed.
	// Actually, let's just use the status tabs properly.

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		refetch,
	} = useInfiniteListOrders({
		limit: 10,
		status: activeTab === 'all' ? undefined : statusFilter(activeTab),
	});

	const { data: riders = [] } = useListRiders();

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	const orders = data?.pages.flatMap((page) => page.items) || [];

	// Client-side filtering for 'active' orders (standard definition: not delivered/cancelled)
	const filteredOrders =
		activeTab === 'active'
			? orders.filter(
					(o) =>
						o.status !== OrderStatus.DELIVERED &&
						o.status !== OrderStatus.CANCELLED,
				)
			: orders;

	return (
		<div className='space-y-6'>
			<div className='sticky top-16 z-20 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-2'>
				<TabComponent
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					tabs={[
						{
							id: 'active',
							label: 'Active',
							icon: <Clock size={16} />,
						},
						{
							id: 'pending',
							label: 'Pending',
							icon: <ShoppingBag size={16} />,
						},
						{
							id: 'delivered',
							label: 'Delivered',
							icon: <CheckCircle2 size={16} />,
						},
						{
							id: 'cancelled',
							label: 'Cancelled',
							icon: <XCircle size={16} />,
						},
						{
							id: 'all',
							label: 'All Orders',
							icon: <ShoppingBag size={16} />,
						},
					]}
					className='border-b-0 px-5'
				/>
			</div>

			<div className='px-5 pb-10 space-y-4'>
				{isLoading ? (
					<div className='space-y-4'>
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton
								key={i}
								className='h-48 w-full rounded-xl'
							/>
						))}
					</div>
				) : filteredOrders.length === 0 ? (
					<div className='text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed'>
						<p className='text-muted-foreground'>
							No orders found in this category
						</p>
					</div>
				) : (
					<>
						{filteredOrders.map((order) => (
							<OperatorOrderCard
								key={order.id}
								order={order}
								riders={riders as any}
								onUpdate={refetch}
							/>
						))}

						{hasNextPage && (
							<div ref={ref} className='py-4 flex justify-center'>
								{isFetchingNextPage ? (
									<Skeleton className='h-20 w-full rounded-xl' />
								) : (
									<div className='h-1' />
								)}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
