'use client';

import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurency } from '@/lib/commonFunctions';
import { Skeleton } from '@/components/ui/skeleton';
import {
	ShoppingBag,
	Package,
	CheckCircle,
	XCircle,
	Clock,
} from 'lucide-react';
import { useState } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useTRPC } from '@/trpc/client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';
import { OrderStatus } from '@prisma/client';

const VendorOrdersSection = () => {
	const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(
		'all'
	);
	const { useGetMyOrders } = useVendorDashboardActions();
	const trpc = useTRPC();

	const {
		data: orders = [],
		isLoading,
		refetch,
	} = useGetMyOrders({
		status: statusFilter === 'all' ? undefined : statusFilter,
	});

	const updateOrderStatusMutation = useMutation(
		trpc.orders.updateMyOrderStatus.mutationOptions({
			onSuccess: () => {
				toast.success('Order status updated');
				refetch();
			},
			onError: (err) => {
				toast.error('Failed to update order status', {
					description:
						err instanceof Error ? err.message : 'Unknown error',
				});
			},
		})
	);

	const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
		updateOrderStatusMutation.mutate({
			id: orderId,
			status: newStatus,
		});
	};

	const getStatusBadge = (status: OrderStatus) => {
		const variants: Record<OrderStatus, any> = {
			PENDING: { variant: 'secondary' as const, icon: Clock },
			PAID: { variant: 'default' as const, icon: Package },
			PREPARING: { variant: 'default' as const, icon: Package },
			ASSIGNED: { variant: 'default' as const, icon: Package },
			DELIVERED: { variant: 'default' as const, icon: CheckCircle },
			CANCELLED: { variant: 'destructive' as const, icon: XCircle },
		};
		const config = variants[status] || {
			variant: 'secondary' as const,
			icon: Package,
		};
		const Icon = config.icon;
		return (
			<Badge variant={config.variant} className='flex items-center gap-1'>
				<Icon size={12} />
				{status}
			</Badge>
		);
	};

	if (isLoading) {
		return (
			<div className='p-5 space-y-4'>
				<Skeleton className='h-10 w-full' />
				<Skeleton className='h-32 w-full' />
				<Skeleton className='h-32 w-full' />
			</div>
		);
	}

	return (
		<div className='p-5 space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-2xl font-semibold'>Orders</h2>
					<p className='text-foreground/70 text-sm'>
						Manage and track your orders
					</p>
				</div>
				<Select
					value={statusFilter}
					onValueChange={(value) =>
						setStatusFilter(value as OrderStatus | 'all')
					}>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='Filter by status' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Orders</SelectItem>
						{Object.values(OrderStatus).map((status) => (
							<SelectItem key={status} value={status}>
								{status}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Orders List */}
			<div className='space-y-4'>
				{orders.length === 0 ? (
					<div className='text-center py-10 text-foreground/50'>
						<ShoppingBag
							size={48}
							className='mx-auto mb-4 opacity-50'
						/>
						<p>No orders found</p>
					</div>
				) : (
					orders.map((order: any) => (
						<div
							key={order.id}
							className='p-5 border rounded-lg space-y-4 hover:border-primary transition-colors'>
							{/* Order Header */}
							<div className='flex items-start justify-between'>
								<div className='flex-1'>
									<div className='flex items-center gap-2 mb-2'>
										<h3 className='font-semibold text-lg'>
											Order #{order.id.slice(0, 8)}
										</h3>
										{getStatusBadge(order.status)}
									</div>
									<p className='text-sm text-foreground/70'>
										Customer:{' '}
										{order.user?.name || 'Unknown'}
									</p>
									<p className='text-sm text-foreground/70'>
										{order.user?.email}{' '}
										{order.user?.phone &&
											`• ${order.user.phone}`}
									</p>
									<p className='text-sm text-foreground/70 mt-1'>
										{new Date(
											order.createdAt
										).toLocaleString()}
									</p>
								</div>
								<div className='text-right'>
									<p className='text-lg font-semibold'>
										{formatCurency(order.totalAmount)}
									</p>
									<p className='text-xs text-foreground/50'>
										{order.items.length} item
										{order.items.length !== 1 ? 's' : ''}
									</p>
								</div>
							</div>

							{/* Order Items */}
							<div className='space-y-2 border-t pt-4'>
								<p className='text-sm font-semibold'>Items:</p>
								{order.items.map((item: any) => (
									<div
										key={item.id}
										className='flex items-center justify-between text-sm'>
										<div>
											<p className='font-medium'>
												{item.productItem.name} x
												{item.quantity}
											</p>
											{item.addons &&
												item.addons.length > 0 && (
													<div className='text-xs text-foreground/70 pl-4'>
														{item.addons.map(
															(
																addon: any,
																idx: number
															) => (
																<p key={idx}>
																	+{' '}
																	{
																		addon
																			.addonProductItem
																			.name
																	}{' '}
																	x
																	{
																		addon.quantity
																	}
																</p>
															)
														)}
													</div>
												)}
										</div>
										<p>{formatCurency(item.totalPrice)}</p>
									</div>
								))}
							</div>

							{/* Delivery Address */}
							{order.address && (
								<div className='border-t pt-4'>
									<p className='text-sm font-semibold mb-1'>
										Delivery Address:
									</p>
									<p className='text-sm text-foreground/70'>
										{order.address.line1}
										{order.address.line2 &&
											`, ${order.address.line2}`}
									</p>
									<p className='text-sm text-foreground/70'>
										{order.address.city}
										{order.address.state &&
											`, ${order.address.state}`}
									</p>
								</div>
							)}

							{/* Payment Status */}
							{order.payment && (
								<div className='border-t pt-4'>
									<p className='text-sm font-semibold mb-1'>
										Payment:
									</p>
									<Badge
										variant={
											order.payment.status === 'COMPLETED'
												? 'default'
												: order.payment.status ===
												  'FAILED'
												? 'destructive'
												: 'secondary'
										}>
										{order.payment.status}
									</Badge>
								</div>
							)}

							{/* Actions */}
							<div className='flex gap-2 border-t pt-4'>
								<Select
									value={order.status}
									onValueChange={(value) =>
										handleStatusUpdate(order.id, value)
									}>
									<SelectTrigger className='flex-1'>
										<SelectValue />
									</SelectTrigger>

									<SelectContent>
										{Object.values(OrderStatus).map(
											(status) => (
												<SelectItem
													key={status}
													value={status}>
													{status}
												</SelectItem>
											)
										)}
									</SelectContent>
								</Select>
								<Button variant='outline' asChild>
									<Link
										href={PAGES_DATA.order_info_page(
											order.id
										)}>
										View Details
									</Link>
								</Button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default VendorOrdersSection;
