'use client';

import CancelOrderModal from '@/components/Modals/CancelOrderModal';
import OrderInfoItem from '@/components/order-components/OrderInfoItem';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOrderingActions } from '@/api-hooks/useOrderingActions';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatus } from '@prisma/client';

const OrderInfoDetailsSection = ({ orderId }: { orderId: string }) => {
	const { useGetOrder } = useOrderingActions();
	const { data: order, isLoading } = useGetOrder({ id: orderId });

	if (isLoading) {
		return (
			<div className='w-full max-w-lg p-5 space-y-5'>
				<Skeleton className='h-20 w-full' />
				<Skeleton className='h-64 w-full' />
				<Skeleton className='h-40 w-full' />
			</div>
		);
	}

	if (!order) {
		return (
			<div className='w-full max-w-lg p-5'>
				<p className='text-center text-foreground/50'>Order not found</p>
			</div>
		);
	}

	// Determine status indicators based on order status
	const getStatusIndicators = () => {
		const status = order.status;
		return [
			{
				status: 'done' as const,
				title: 'Order placed',
			},
			{
				status: (status === OrderStatus.PREPARING || status === OrderStatus.PAID || status === OrderStatus.ASSIGNED || status === OrderStatus.DELIVERED ? 'done' : status === OrderStatus.PENDING ? 'in-progress' : 'pending') as 'done' | 'in-progress' | 'pending',
				title: 'Preparing your order',
			},
			{
				status: (status === OrderStatus.ASSIGNED || status === OrderStatus.DELIVERED ? 'done' : status === OrderStatus.PREPARING ? 'in-progress' : 'pending') as 'done' | 'in-progress' | 'pending',
				title: 'Rider is on the way',
			},
			{
				status: (status === OrderStatus.DELIVERED ? 'done' : status === OrderStatus.ASSIGNED ? 'in-progress' : 'pending') as 'done' | 'in-progress' | 'pending',
				title: 'Delivered',
				isLast: true,
			},
		];
	};

	const statusIndicators = getStatusIndicators();
	const displayOrderId = order.id.slice(0, 8).toUpperCase();

	// Calculate estimated time (placeholder)
	const getEstimatedTime = () => {
		if (order.status === OrderStatus.DELIVERED) {
			return 'Delivered';
		}
		if (order.status === OrderStatus.ASSIGNED) {
			return 'Rider on the way';
		}
		if (order.status === OrderStatus.PREPARING) {
			return 'Estimated ready in 5 minutes';
		}
		return 'Estimated ready in 10 minutes';
	};

	return (
		<>
			<div className='w-full max-w-lg p-5 space-y-5'>
				<div className='text-center'>
					<p className='font-light'>Order ID</p>
					<p className='font-semibold text-xl'>#{displayOrderId}</p>
					<p>{getEstimatedTime()}</p>
				</div>

				<div className='w-full flex flex-col gap-14 px-5'>
					{statusIndicators.map((indicator, index) => (
						<StatusIndicator
							key={index}
							status={indicator.status}
							title={indicator.title}
							isLast={indicator.isLast}
						/>
					))}
				</div>

				<div className='mt-10'>
					<p className='text-lg mb-5'>Items ordered</p>
					<div className='w-full grid grid-cols-1 gap-5'>
						{order.items.map((item, index) => {
							const mainName = item.productItem.product?.name || item.productItem.name;
							const additions = item.addons?.map((addon) => ({
								name: addon.addonProductItem.product?.name || addon.addonProductItem.name,
								number: addon.quantity,
							})) || [];

							return (
								<OrderInfoItem
									key={item.id}
									index={index + 1}
									orderDetails={{
										main: mainName,
										quantity: item.quantity,
										unitName: item.productItem.unitName,
										pricingType: item.productItem.pricingType,
										additions: additions.length > 0 ? additions : undefined,
										totalAmount: item.totalPrice,
									}}
								/>
							);
						})}
					</div>
				</div>
			</div>

			<>
				<div className='mb-[110px]' />
				<div className='bottom-0 left-0 fixed w-screen flex justify-center'>
					<div className='w-full max-w-lg bg-background border-t border-t-[#85858540] h-[100px] text-[#858585] px-5 flex justify-center'>
						<div className='w-full h-full flex items-center justify-between max-w-[1400px] gap-5'>
							<CancelOrderModal />
							<Button
								variant={'outline'}
								className='flex-1 max-w-xs py-6 border-primary text-primary'>
								Contact support
							</Button>
						</div>
					</div>
				</div>
			</>
		</>
	);
};

export default OrderInfoDetailsSection;

const StatusIndicator = ({
	status,
	title,
	isLast = false,
}: {
	status: 'done' | 'pending' | 'in-progress';
	title: string;
	isLast?: boolean;
}) => {
	return (
		<div className='flex gap-2 items-center'>
			<div
				className={cn(
					'w-[25px] h-[25px] border flex items-center justify-center rounded-full relative z-10 bg-background',
					status === 'done' && 'border-primary',
					status === 'pending' && 'border-foreground/10',
					status === 'in-progress' && 'border-destructive'
				)}>
				<div
					className={cn(
						'w-[80%] h-[80%] rounded-full',
						status === 'done' && 'bg-primary',
						status === 'pending' && 'bg-background',
						status === 'in-progress' && 'bg-destructive'
					)}></div>
				{!isLast && (
					<div
						className={cn(
							'absolute w-0.5 h-[60px] z-0 top-6',
							status === 'done' && 'bg-primary',
							status === 'pending' && 'bg-foreground/10',
							status === 'in-progress' && 'bg-foreground/10'
						)}
					/>
				)}
			</div>
			<p
				className={cn(
					'text-lg',
					status === 'done' && 'font-semibold text-foreground',
					status === 'pending' && 'font-light text-foreground/50',
					status === 'in-progress' && 'font-semibold text-foreground'
				)}>
				{title}
			</p>
		</div>
	);
};
