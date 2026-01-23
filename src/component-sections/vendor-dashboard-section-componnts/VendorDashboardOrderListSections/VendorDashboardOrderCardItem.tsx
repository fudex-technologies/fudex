'use client';

import { ChevronDown, Store, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@prisma/client';
import { useState, useMemo } from 'react';
import { Collapsible, CollapsibleContent } from '@radix-ui/react-collapsible';
import VendorDashboardOrderItemByPack from './VendorDashboardOrderItemByPack';
import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { formatCurency } from '@/lib/commonFunctions';

const VendorDashboardOrderCardItem = ({
	order,
	refetch,
}: {
	order: any;
	refetch: () => void;
}) => {
	const [showMore, setShowMore] = useState(false);
	const { updateOrderStatus, useGetMyOrderCounts } =
		useVendorDashboardActions();
	const status = order.status as OrderStatus;

	const { refetch: refetchCounts } = useGetMyOrderCounts();
	const updateStatusMutation = updateOrderStatus({
		onSuccess: () => {
			refetchCounts();
			refetch();
		},
	});

	const handleUpdateStatus = (newStatus: OrderStatus) => {
		updateStatusMutation.mutate({ id: order.id, status: newStatus });
	};

	// Group items into packs based on groupKey
	const packs = useMemo(() => {
		return (order.items || []).map((it: any) => ({
			mainItem: {
				id: it.productItem?.id,
				name: it.productItem?.name,
				quantity: it.quantity,
				price: it.unitPrice,
			},
			addons: (it.addons || []).map((a: any) => ({
				addonProductItemId: a.addonProductItemId,
				quantity: a.quantity,
				name: a.addonProductItem?.name,
				price: a.unitPrice,
			})),
			packTotal: Number(it.totalPrice),
		}));
	}, [order.items]);

	const addonItems = useMemo(() => {
		const addons: any[] = [];
		for (const it of order.items || []) {
			for (const a of it.addons || []) {
				if (!addons.find((ad) => ad.id === a.addonProductItemId)) {
					addons.push({
						id: a.addonProductItemId,
						name: a.addonProductItem?.name,
					});
				}
			}
		}
		return addons;
	}, [order.items]);

	const totalQuantity = useMemo(() => {
		return (
			order.items?.reduce(
				(sum: number, it: any) => sum + it.quantity,
				0,
			) || 0
		);
	}, [order.items]);

	return (
		<div className='relative min-w-xs w-full h-fit max-w-md rounded-lg  bg-muted text-muted-foreground z-10 overflow-hidden shadow-sm'>
			{status === 'PAID' && (
				<div className='w-full px-5 py-2 bg-[#24AA9A] text-white'>
					<p>New Order</p>
				</div>
			)}
			<div className={cn('w-full p-5')}>
				<div className='w-full space-y-1 border-b'>
					<div className='flex flex-wrap items-center gap-2'>
						{status === 'PAID' && (
							<div className='px-2 w-fit h-fit py-1 rounded-lg bg-[#24AA9A] text-white flex items-center justify-center text-sm'>
								New
							</div>
						)}
						<p className='text-foreground/50'>Order ID:</p>
						<p>#{order.id.slice(-8).toUpperCase()}</p>
						{status === 'ASSIGNED' && (
							<div className='text-xs px-2 w-fit h-fit py-1 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full ml-auto'>
								Rider Assigned
							</div>
						)}
						{status === 'OUT_FOR_DELIVERY' && (
							<div className='text-xs px-2 w-fit h-fit py-1 bg-[#24aa9a3c] text-[#24AA9A] flex items-center justify-center rounded-full ml-auto'>
								Out for delivery
							</div>
						)}
						{status === 'DELIVERED' && (
							<div className='text-xs px-2 w-fit h-fit py-1 bg-green-100 text-green-600 flex items-center justify-center rounded-full ml-auto'>
								Completed
							</div>
						)}
						{status === 'CANCELLED' && (
							<div className='text-xs px-2 w-fit h-fit py-1 bg-red-100 text-red-600 flex items-center justify-center rounded-full ml-auto'>
								Cancelled
							</div>
						)}
						{(status === 'ACCEPTED' ||
							status === 'PREPARING' ||
							status === 'READY') && (
							<div className='text-xs px-2 w-fit h-fit py-1 bg-gray-100 text-gray-600 flex items-center justify-center rounded-full ml-auto'>
								{status.toLowerCase()}
							</div>
						)}
					</div>

					{/* <div className='flex items-center gap-4 text-sm mt-2'>
						<div className='flex items-center gap-1'>
							<User size={14} className='opacity-50' />
							<span>{order.user?.name}</span>
						</div>
						{order.user?.phone && (
							<div
								className='flex items-center gap-1 text-primary cursor-pointer'
								onClick={() =>
									(window.location.href = `tel:${order.user.phone}`)
								}>
								<Phone size={14} />
								<span>{order.user.phone}</span>
							</div>
						)}
					</div> */}

					<div className='w-full flex items-center justify-between flex-wrap gap-2 '>
						<div className='flex gap-2 items-center'>
							<p className='text-foreground/50'>
								{totalQuantity} items:
							</p>
							<p className='font-bold'>
								{formatCurency(order.productAmount)}
							</p>
						</div>

						<Button
							onClick={() => setShowMore((prev) => !prev)}
							variant={'link'}>
							See {showMore ? 'Less' : 'More'}{' '}
							<ChevronDown
								className={cn(
									'transition-all easy-out',
									showMore && 'rotate-180',
								)}
							/>
						</Button>
					</div>
				</div>
				<Collapsible open={showMore} className='border-b'>
					<CollapsibleContent>
						{packs.map((pack: any, index: number) => (
							<VendorDashboardOrderItemByPack
								key={index}
								pack={pack}
								index={index}
								addonItems={addonItems}
								packTotal={pack.packTotal}
							/>
						))}
					</CollapsibleContent>
				</Collapsible>

				<div className='w-full flex gap-2 pt-5'>
					<Store className='shrink-0' />{' '}
					<div className=''>
						<p className='font-semibold'>Note to store</p>
						<p className='text-sm'>
							{order.notes || 'No special instructions'}
						</p>
					</div>
				</div>

				<div className='w-full mt-5 flex flex-wrap gap-x-5 gap-y-3'>
					{status === 'PAID' && (
						<>
							<Button
								className='flex-1 border-destructive text-destructive'
								variant={'outline'}
								disabled={updateStatusMutation.isPending}
								onClick={() => handleUpdateStatus('CANCELLED')}>
								Reject Order
							</Button>
							<Button
								className='flex-1'
								variant={'game'}
								disabled={updateStatusMutation.isPending}
								onClick={() => handleUpdateStatus('ACCEPTED')}>
								Accept Order
							</Button>
						</>
					)}
					{status === 'ACCEPTED' && (
						<>
							<Button
								className='w-full'
								variant={'game'}
								disabled={updateStatusMutation.isPending}
								onClick={() => handleUpdateStatus('PREPARING')}>
								Start Preparing
							</Button>
						</>
					)}
					{status === 'PREPARING' && (
						<>
							<Button
								className='w-full'
								variant={'game'}
								disabled={updateStatusMutation.isPending}
								onClick={() => handleUpdateStatus('READY')}>
								Mark as Ready
							</Button>
							<Button
								className='w-full border-primary text-primary'
								variant={'outline'}>
								Contact Support
							</Button>
						</>
					)}
					{status === 'READY' && (
						<>
							<Button
								className='w-full'
								variant={'game'}
								disabled={updateStatusMutation.isPending}
								onClick={() =>
									handleUpdateStatus('OUT_FOR_DELIVERY')
								}>
								Given to Rider
							</Button>
							<Button
								className='w-full border-primary text-primary'
								variant={'outline'}>
								Contact Support
							</Button>
						</>
					)}
					{(status === 'OUT_FOR_DELIVERY' ||
						status === 'ASSIGNED' ||
						status === 'DELIVERED') && (
						<>
							<Button
								className='w-full border-primary text-primary'
								variant={'outline'}>
								Contact Support
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default VendorDashboardOrderCardItem;
