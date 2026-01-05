'use client';

import { useState } from 'react';
import { useOperatorActions } from '@/api-hooks/useOperatorActions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@prisma/client';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { formatCurency } from '@/lib/commonFunctions';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function OperatorOrdersPage() {
	const { useListOrdersInArea, updateOrderStatus, assignRiderToOrder, useListRiders } = useOperatorActions();
	const { data: orders = [], isLoading, refetch } = useListOrdersInArea({ take: 100 });
	const { data: riders = [] } = useListRiders();
	
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const [selectedRiderId, setSelectedRiderId] = useState<string>('');

	const updateStatusMutation = updateOrderStatus({
		onSuccess: () => {
			refetch();
		},
	});

	const assignRiderMutation = assignRiderToOrder({
		onSuccess: () => {
			refetch();
			setSelectedOrderId(null);
			setSelectedRiderId('');
		},
	});

	const handleStatusChange = (orderId: string, status: OrderStatus) => {
		updateStatusMutation.mutate({ orderId, status });
	};

	const handleAssignRider = () => {
		if (selectedOrderId && selectedRiderId) {
			assignRiderMutation.mutate({
				orderId: selectedOrderId,
				riderId: selectedRiderId,
			});
		}
	};

	const getStatusColor = (status: OrderStatus) => {
		switch (status) {
			case OrderStatus.PENDING:
				return 'bg-yellow-500/10 text-yellow-500';
			case OrderStatus.PAID:
				return 'bg-blue-500/10 text-blue-500';
			case OrderStatus.PREPARING:
				return 'bg-orange-500/10 text-orange-500';
			case OrderStatus.ASSIGNED:
				return 'bg-purple-500/10 text-purple-500';
			case OrderStatus.DELIVERED:
				return 'bg-green-500/10 text-green-500';
			case OrderStatus.CANCELLED:
				return 'bg-red-500/10 text-red-500';
			default:
				return 'bg-gray-500/10 text-gray-500';
		}
	};

	if (isLoading) {
		return (
			<SectionWrapper className='p-5'>
				<div className='space-y-4'>
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className='h-32 w-full' />
					))}
				</div>
			</SectionWrapper>
		);
	}

	return (
		<SectionWrapper className='p-5'>
			<h2 className='text-xl font-semibold mb-5'>Orders in Your Area</h2>

			{orders.length === 0 ? (
				<p className='text-foreground/50 text-center py-8'>No orders in your area</p>
			) : (
				<div className='space-y-4'>
					{orders.map((order) => {
						const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
						const displayOrderId = order.id.slice(0, 8).toUpperCase();

						return (
							<div
								key={order.id}
								className='border rounded-lg p-4 space-y-3'>
								<div className='flex items-start justify-between'>
									<div className='flex-1'>
										<div className='flex items-center gap-2 mb-2'>
											<h3 className='font-semibold'>Order #{displayOrderId}</h3>
											<Badge className={getStatusColor(order.status)}>
												{order.status}
											</Badge>
										</div>
										<p className='text-sm text-foreground/70'>
											Vendor: {order.vendor?.name || 'N/A'}
										</p>
										<p className='text-sm text-foreground/70'>
											Customer: {order.user?.name || 'N/A'}
										</p>
										<p className='text-sm text-foreground/70'>
											{itemCount} item{itemCount !== 1 ? 's' : ''} • {formatCurency(order.totalAmount)}
										</p>
										{order.assignedRider && (
											<p className='text-sm text-primary mt-1'>
												Rider: {order.assignedRider.name}
											</p>
										)}
									</div>
								</div>

								<div className='flex gap-2 flex-wrap'>
									<Select
										value={order.status}
										onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}>
										<SelectTrigger className='w-[180px]'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.values(OrderStatus).map((status) => (
												<SelectItem key={status} value={status}>
													{status}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<Dialog>
										<DialogTrigger asChild>
											<Button
												variant='outline'
												size='sm'
												onClick={() => setSelectedOrderId(order.id)}>
												{order.assignedRider ? 'Change Rider' : 'Assign Rider'}
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Assign Rider to Order</DialogTitle>
											</DialogHeader>
											<div className='space-y-4'>
												<div>
													<Label>Select Rider</Label>
													<Select
														value={selectedRiderId}
														onValueChange={setSelectedRiderId}>
														<SelectTrigger>
															<SelectValue placeholder='Select a rider' />
														</SelectTrigger>
														<SelectContent>
															{riders
																.filter((r) => r.isActive)
																.map((rider) => (
																	<SelectItem key={rider.id} value={rider.id}>
																		{rider.name} {rider.phone && `(${rider.phone})`}
																	</SelectItem>
																))}
														</SelectContent>
													</Select>
												</div>
												<div className='flex gap-2 justify-end'>
													<Button
														variant='outline'
														onClick={() => {
															setSelectedOrderId(null);
															setSelectedRiderId('');
														}}>
														Cancel
													</Button>
													<Button
														onClick={handleAssignRider}
														disabled={!selectedRiderId || assignRiderMutation.isPending}>
														{assignRiderMutation.isPending ? 'Assigning...' : 'Assign'}
													</Button>
												</div>
											</div>
										</DialogContent>
									</Dialog>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</SectionWrapper>
	);
}

