'use client';

import { OrderStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useState } from 'react';
import { useOperatorActions } from '@/api-hooks/useOperatorActions';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface OperatorOrderCardProps {
	order: any;
	riders: any[];
	onUpdate?: () => void;
}

export default function OperatorOrderCard({
	order,
	riders,
	onUpdate,
}: OperatorOrderCardProps) {
	const { updateOrderStatus, assignRiderToOrder } = useOperatorActions();
	const [selectedRiderId, setSelectedRiderId] = useState<string>(
		order.assignedRiderId || '',
	);
	const [statusToUpdate, setStatusToUpdate] = useState<OrderStatus | null>(
		null,
	);

	const updateStatusMutation = updateOrderStatus({
		onSuccess: () => {
			onUpdate?.();
			setStatusToUpdate(null);
		},
	});

	const assignRiderMutation = assignRiderToOrder({
		onSuccess: () => {
			onUpdate?.();
		},
	});

	const handleStatusChange = (status: OrderStatus) => {
		setStatusToUpdate(status);
	};

	const confirmStatusChange = () => {
		if (statusToUpdate) {
			updateStatusMutation.mutate({
				currentStatus: order.status,
				orderId: order.id,
				status: statusToUpdate,
			});
		}
	};

	const handleAssignRider = () => {
		if (selectedRiderId) {
			assignRiderMutation.mutate({
				orderId: order.id,
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
			case OrderStatus.READY:
				return 'bg-green-500/10 text-green-500';
			case OrderStatus.ASSIGNED:
				return 'bg-purple-500/10 text-purple-500';
			case OrderStatus.OUT_FOR_DELIVERY:
				return 'bg-indigo-500/10 text-indigo-500';
			case OrderStatus.DELIVERED:
				return 'bg-emerald-500/10 text-emerald-500';
			case OrderStatus.CANCELLED:
				return 'bg-red-500/10 text-red-500';
			default:
				return 'bg-gray-500/10 text-gray-500';
		}
	};

	const itemCount = order.items.reduce(
		(sum: number, item: any) => sum + item.quantity,
		0,
	);
	const displayOrderId = order.id.slice(0, 8).toUpperCase();

	return (
		<div className='border rounded-xl p-5 space-y-4 bg-card shadow-sm hover:shadow-md transition-shadow'>
			<div className='flex items-start justify-between border-b pb-4'>
				<div className='space-y-1'>
					<div className='flex items-center gap-2 flex-wrap'>
						<h3 className='font-bold text-lg text-primary'>
							#{displayOrderId}
						</h3>
						<Badge className={getStatusColor(order.status)}>
							{order.status}
						</Badge>
						{order.payment && (
							<Badge
								variant='outline'
								className={
									order.payment.status === 'COMPLETED'
										? 'border-emerald-500 text-emerald-500 bg-emerald-500/5'
										: 'border-yellow-500 text-yellow-500 bg-yellow-500/5'
								}>
								{order.payment.status === 'COMPLETED'
									? 'PAID'
									: 'UNPAID'}
							</Badge>
						)}
						<Badge
							variant='outline'
							className={
								order.deliveryType === 'PICKUP'
									? 'border-purple-500 text-purple-500 bg-purple-500/5'
									: 'border-blue-500 text-blue-500 bg-blue-500/5'
							}>
							{order.deliveryType}
						</Badge>
					</div>
					<p className='text-sm text-muted-foreground'>
						{new Date(order.createdAt).toLocaleString()}
					</p>
				</div>
				<div className='text-right'>
					<p className='font-bold text-2xl text-primary'>
						{formatCurency(order.totalAmount)}
					</p>
					<p className='text-xs text-muted-foreground'>
						via {order.paymentMethod}
					</p>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-6 py-2'>
				<div className='space-y-3'>
					<div>
						<Label className='text-[10px] text-muted-foreground uppercase tracking-widest font-bold'>
							PICKUP FROM (VENDOR)
						</Label>
						<div className='mt-1'>
							<p className='font-bold text-base leading-tight'>
								{order.vendor?.name}
							</p>
							<p className='text-sm text-muted-foreground leading-snug mt-1'>
								{order.vendor?.address}
								<br />
								{order.vendor?.city}
							</p>
							{order.vendor?.phone && (
								<p className='text-xs text-primary font-medium mt-1 uppercase'>
									📞 {order.vendor.phone}
								</p>
							)}
						</div>
					</div>

					<div>
						<Label className='text-[10px] text-muted-foreground uppercase tracking-widest font-bold'>
							{order.deliveryType === 'PICKUP'
								? 'PICKUP BY (CUSTOMER)'
								: 'DELIVER TO (CUSTOMER)'}
						</Label>
						<div className='mt-1'>
							<p className='font-bold text-base leading-tight'>
								{order.user?.name}
							</p>
							{order.deliveryType === 'DELIVERY' && (
								<p className='text-sm text-muted-foreground leading-snug mt-1'>
									{order.address?.line1}
									{order.address?.line2 &&
										`, ${order.address.line2}`}
									<br />
									{order.address?.customArea ||
										order.address?.area?.name}
									{(order.address?.customArea ||
										order.address?.area?.name) &&
										', '}
									{order.address?.city},{' '}
									{order.address?.state}
								</p>
							)}
							{order.user?.phone && (
								<p className='text-xs text-primary font-medium mt-1 uppercase'>
									📞 {order.user.phone}
								</p>
							)}
						</div>
					</div>
				</div>

				<div className='space-y-4'>
					<div>
						<Label className='text-[10px] text-muted-foreground uppercase tracking-widest font-bold'>
							ORDER ITEMS ({itemCount})
						</Label>
						<div className='mt-2 space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar'>
							{order.items.map((item: any) => {
								const productItem = item.productItem;
								const productName = productItem?.name;
								const isPerUnit =
									productItem?.pricingType === 'PER_UNIT';
								const unitName = productItem?.unitName;
								const parentProduct = item.productItem.product;

								console.log(item);

								return (
									<div
										key={item.id}
										className='text-sm bg-muted/30 p-2 rounded-lg'>
										<div className='flex justify-between items-start'>
											<div className='flex-1'>
												<p>
													Main: {parentProduct.name}
												</p>
												<span className='font-medium'>
													{productName}
													{isPerUnit && unitName && (
														<span className='text-xs text-muted-foreground ml-1 font-normal'>
															({item.quantity}{' '}
															{unitName}
															{item.quantity !== 1
																? 's'
																: ''}
															)
														</span>
													)}
													{!isPerUnit && (
														<span className='text-xs text-muted-foreground ml-1 font-normal'>
															x{item.quantity}
														</span>
													)}
												</span>
												{isPerUnit && unitName && (
													<p className='text-[10px] text-muted-foreground mt-0.5'>
														{formatCurency(
															productItem?.price ||
																0,
														)}{' '}
														per {unitName} (
														{formatCurency(
															(productItem?.price ||
																0) *
																item.quantity,
														)}
														)
														{productItem?.packagingFee &&
														productItem.packagingFee >
															0 ? (
															<span className='ml-1 text-orange-500/80 font-medium'>
																+{' '}
																{formatCurency(
																	productItem.packagingFee,
																)}{' '}
																pack fee
															</span>
														) : null}
													</p>
												)}
											</div>
											<span className='text-xs font-semibold ml-2'>
												{formatCurency(item.totalPrice)}
											</span>
										</div>
										{item.addons?.length > 0 && (
											<div className='pl-4 mt-1 space-y-0.5'>
												{item.addons.map(
													(addon: any) => (
														<div
															key={addon.id}
															className='text-[11px] text-muted-foreground flex justify-between'>
															<span>
																(
																{
																	addon
																		.addonProductItem
																		.product
																		.name
																}
																) +{' '}
																{
																	addon
																		.addonProductItem
																		?.name
																}
																<span className='ml-1'>
																	x
																	{
																		addon.quantity
																	}
																</span>
															</span>
															<span>
																{formatCurency(
																	addon.unitPrice *
																		addon.quantity,
																)}
															</span>
														</div>
													),
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>

					<div className='bg-primary/5 rounded-xl p-3 space-y-1.5'>
						<div className='flex justify-between text-xs'>
							<span className='text-muted-foreground'>
								Product Subtotal
							</span>
							<span>{formatCurency(order.productAmount)}</span>
						</div>
						<div className='flex justify-between text-xs'>
							<span className='text-muted-foreground'>
								Delivery Fee
							</span>
							<span>{formatCurency(order.deliveryFee)}</span>
						</div>
						<div className='flex justify-between text-xs'>
							<span className='text-muted-foreground'>
								Service Fee
							</span>
							<span>{formatCurency(order.serviceFee)}</span>
						</div>
						<div className='flex justify-between font-bold text-sm pt-1 border-t border-primary/10'>
							<span>Total</span>
							<span className='text-primary'>
								{formatCurency(order.totalAmount)}
							</span>
						</div>
					</div>
				</div>
			</div>

			{order.notes && (
				<div className='bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-xl text-sm'>
					<span className='font-bold text-[10px] uppercase text-yellow-600 block mb-1'>
						Customer Notes
					</span>
					<p className='text-foreground italic'>"{order.notes}"</p>
				</div>
			)}

			<div className='flex flex-wrap gap-3 pt-2'>
				<div className='flex-1 min-w-[200px]'>
					<Label className='text-xs mb-1 block'>Status</Label>
					<Select
						value={order.status}
						onValueChange={handleStatusChange}>
						<SelectTrigger className='w-full'>
							<SelectValue placeholder='Change Order Status' />
						</SelectTrigger>
						<SelectContent>
							{Object.values(OrderStatus).map((status) => (
								<SelectItem key={status} value={status}>
									{status}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className='flex-1 min-w-[200px] flex gap-2 items-end'>
					<div className='flex-1'>
						<Label className='text-xs mb-1 block'>Rider</Label>
						<Select
							value={selectedRiderId}
							onValueChange={setSelectedRiderId}>
							<SelectTrigger className='w-full'>
								<SelectValue placeholder='Assign Rider' />
							</SelectTrigger>
							<SelectContent>
								{riders?.length > 0 &&
								riders.filter((r) => r.isActive).length > 0 ? (
									riders
										.filter((r) => r.isActive)
										.map((rider) => (
											<SelectItem
												key={rider.id}
												value={rider.id}>
												{rider.name}{' '}
												{rider.phone &&
													`(${rider.phone})`}
											</SelectItem>
										))
								) : (
									<div className='text-center text-sm text-muted-foreground p-4'>
										No Riders Available
									</div>
								)}
							</SelectContent>
						</Select>
					</div>
					<Button
						variant='outline'
						onClick={handleAssignRider}
						disabled={
							!selectedRiderId ||
							selectedRiderId === order.assignedRiderId ||
							assignRiderMutation.isPending
						}>
						{assignRiderMutation.isPending ? '...' : 'Assign'}
					</Button>
				</div>
			</div>

			<AlertDialog
				open={!!statusToUpdate}
				onOpenChange={(open) => !open && setStatusToUpdate(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Update Order Status?
						</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to change the status of order{' '}
							<span className='font-bold italic'>
								#{displayOrderId}
							</span>{' '}
							to{' '}
							<span className='font-bold uppercase'>
								{statusToUpdate}
							</span>
							?
							{statusToUpdate === OrderStatus.CANCELLED &&
								order.status !== 'PENDING' && (
									<p className='mt-2 text-destructive font-semibold'>
										Note: This will trigger an automatic
										refund to the customer's wallet.
									</p>
								)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							disabled={updateStatusMutation.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								confirmStatusChange();
							}}
							disabled={updateStatusMutation.isPending}
							className={
								statusToUpdate === OrderStatus.CANCELLED
									? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
									: ''
							}>
							{updateStatusMutation.isPending
								? 'Updating...'
								: 'Confirm Change'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
