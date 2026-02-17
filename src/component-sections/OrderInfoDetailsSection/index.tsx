'use client';

import CancelOrderModal from '@/components/Modals/CancelOrderModal';
import OrderInfoItem from '@/components/order-components/OrderInfoItem';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOrderingActions } from '@/api-hooks/useOrderingActions';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatus } from '@prisma/client';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Loader2 } from 'lucide-react';

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
				<p className='text-center text-foreground/50'>
					Order not found
				</p>
			</div>
		);
	}

	// Determine status indicators based on order status
	const getStatusIndicators = () => {
		const status = order.status;
		const isPickup = (order as any).deliveryType === 'PICKUP';

		const isDone = (targetStatus: OrderStatus[]) =>
			targetStatus.includes(status) || status === OrderStatus.DELIVERED;

		const isInProgress = (targetStatus: OrderStatus[]) =>
			targetStatus.includes(status);

		return [
			{
				status: 'done' as const,
				title: 'Order placed',
			},
			{
				status: (status === OrderStatus.ACCEPTED ||
				status === OrderStatus.PREPARING ||
				status === OrderStatus.READY ||
				status === OrderStatus.ASSIGNED ||
				status === OrderStatus.OUT_FOR_DELIVERY ||
				status === OrderStatus.DELIVERED
					? 'done'
					: status === OrderStatus.PAID
						? 'in-progress'
						: 'pending') as 'done' | 'in-progress' | 'pending',
				title: 'Confirmed by vendor',
			},
			{
				status: (status === OrderStatus.READY ||
				status === OrderStatus.ASSIGNED ||
				status === OrderStatus.OUT_FOR_DELIVERY ||
				status === OrderStatus.DELIVERED
					? 'done'
					: status === OrderStatus.ACCEPTED ||
						  status === OrderStatus.PREPARING
						? 'in-progress'
						: 'pending') as 'done' | 'in-progress' | 'pending',
				title: 'Preparing your order',
			},
			{
				status: (status === OrderStatus.DELIVERED
					? 'done'
					: status === OrderStatus.READY ||
						  status === OrderStatus.ASSIGNED ||
						  status === OrderStatus.OUT_FOR_DELIVERY
						? 'in-progress'
						: 'pending') as 'done' | 'in-progress' | 'pending',
				title: isPickup
					? 'Ready for pickup'
					: status === OrderStatus.OUT_FOR_DELIVERY ||
						  status === OrderStatus.DELIVERED
						? 'Rider is on the way'
						: 'Rider is being assigned',
				isLast: true,
			},
		];
	};

	const statusIndicators = getStatusIndicators();
	const displayOrderId = order.id.slice(0, 8).toUpperCase();

	// Calculate estimated time (placeholder)
	const getEstimatedTime = () => {
		const isPickup = (order as any).deliveryType === 'PICKUP';
		if (order.status === OrderStatus.DELIVERED) {
			return isPickup ? 'Picked up' : 'Delivered';
		}
		if (order.status === OrderStatus.ASSIGNED) {
			return isPickup ? 'Ready for pickup' : 'Rider on the way';
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

				<motion.div
					initial='initial'
					animate='animate'
					variants={{
						animate: {
							transition: {
								staggerChildren: 0.1,
							},
						},
					}}
					className='w-full flex flex-col gap-14 px-5'>
					{statusIndicators.map((indicator, index) => (
						<StatusIndicator
							key={index}
							status={indicator.status}
							title={indicator.title}
							isLast={indicator.isLast}
						/>
					))}
				</motion.div>

				<div className='mt-10'>
					<p className='text-lg mb-5'>Items ordered</p>
					<div className='w-full grid grid-cols-1 gap-5'>
						{order.items.map((item, index) => {
							const mainName =
								item.productItem.product?.name ||
								item.productItem.name;
							const additions =
								item.addons?.map((addon) => ({
									name:
										addon.addonProductItem.product?.name ||
										addon.addonProductItem.name,
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
										pricingType:
											item.productItem.pricingType,
										additions:
											additions.length > 0
												? additions
												: undefined,
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
							<CancelOrderModal
								orderId={order.id}
								status={order.status}
							/>
							<Button
								variant={'outline'}
								className='flex-1 max-w-sm py-6 border-primary text-primary'>
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
	const variants = {
		initial: { opacity: 0, x: -10 },
		animate: { opacity: 1, x: 0 },
	};

	return (
		<motion.div
			variants={variants}
			className='flex gap-4 items-center relative'>
			<div className='flex flex-col items-center relative h-full'>
				<motion.div
					initial={false}
					animate={{
						scale: status === 'in-progress' ? [1, 1.05, 1] : 1,
						borderColor:
							status === 'done'
								? 'var(--primary)'
								: status === 'in-progress'
									? 'var(--destructive)'
									: 'var(--border)',
					}}
					transition={{
						scale:
							status === 'in-progress'
								? { repeat: Infinity, duration: 2 }
								: { duration: 0.3 },
					}}
					className={cn(
						'w-8 h-8 border-2 flex items-center justify-center rounded-full relative z-10 bg-background transition-colors',
					)}>
					<AnimatePresence mode='wait'>
						{status === 'done' ? (
							<motion.div
								key='done'
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0, opacity: 0 }}>
								<Check
									className='w-4 h-4 text-primary'
									strokeWidth={3}
								/>
							</motion.div>
						) : status === 'in-progress' ? (
							<motion.div
								key='in-progress'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}>
								<Loader2 className='w-4 h-4 text-destructive animate-spin' />
							</motion.div>
						) : (
							<motion.div
								key='pending'
								className='w-2 h-2 rounded-full bg-foreground/10'
							/>
						)}
					</AnimatePresence>
				</motion.div>
				{!isLast && (
					<motion.div
						initial={false}
						animate={{
							backgroundColor:
								status === 'done'
									? 'var(--primary)'
									: 'var(--border)',
						}}
						className={cn(
							'absolute w-0.5 h-[60px] z-0 top-8 left-1/2 -translate-x-1/2',
						)}
					/>
				)}
			</div>
			<div className='flex flex-col justify-center gap-1'>
				<motion.p
					initial={false}
					animate={{
						opacity: status === 'pending' ? 0.5 : 1,
						fontWeight: status === 'pending' ? 400 : 700,
						color:
							status === 'in-progress'
								? 'var(--destructive)'
								: 'var(--foreground)',
					}}
					className={cn('text-lg transition-all')}>
					{title}
				</motion.p>
			</div>
		</motion.div>
	);
};
