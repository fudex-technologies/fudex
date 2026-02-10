'use client';

import { OrderStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { formatCurency } from '@/lib/commonFunctions';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useOperatorActions } from '@/api-hooks/useOperatorActions';
import {
	Calendar,
	Clock,
	MapPin,
	Phone,
	User,
	MessageSquare,
	Gift,
} from 'lucide-react';

interface OperatorPackageOrderCardProps {
	order: any;
	onUpdate?: () => void;
}

export default function OperatorPackageOrderCard({
	order,
	onUpdate,
}: OperatorPackageOrderCardProps) {
	const { updatePackageOrderStatus } = useOperatorActions();

	const updateStatusMutation = updatePackageOrderStatus({
		onSuccess: () => {
			onUpdate?.();
		},
	});

	const handleStatusChange = (status: OrderStatus) => {
		updateStatusMutation.mutate({ id: order.id, status });
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

	const displayOrderId = order.id.slice(0, 8).toUpperCase();

	// Format delivery date
	const deliveryDate = new Date(order.deliveryDate).toLocaleDateString(
		'en-GB',
		{
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		},
	);

	return (
		<div className='border rounded-xl p-5 space-y-4 bg-card shadow-sm hover:shadow-md transition-shadow relative overflow-hidden'>
			{/* Decorative background element */}
			<div className='absolute top-0 right-0 p-20 bg-purple-500/5 rounded-bl-full -mr-10 -mt-10 z-0 pointer-events-none' />

			<div className='flex items-start justify-between border-b pb-4 relative z-10'>
				<div className='space-y-1'>
					<div className='flex items-center gap-2 flex-wrap'>
						<h3 className='font-bold text-lg text-primary flex items-center gap-2'>
							<Gift size={18} className='text-purple-600' />#
							{displayOrderId}
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
					</div>
					<p className='text-sm text-muted-foreground'>
						Ordered on {new Date(order.createdAt).toLocaleString()}
					</p>
				</div>
				<div className='text-right'>
					<p className='font-bold text-2xl text-primary'>
						{formatCurency(order.totalAmount)}
					</p>
					<p className='text-xs text-muted-foreground'>
						via {order.payment?.provider || 'Unknown'}
					</p>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-2 relative z-10'>
				{/* Column 1: Package & Delivery Info */}
				<div className='space-y-4'>
					<div>
						<Label className='text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-1.5 mb-2'>
							<Gift size={12} /> PACKAGE DETAILS
						</Label>
						<div className='bg-muted/30 rounded-lg p-3 space-y-2'>
							<div className='flex items-center gap-3'>
								{order.package?.coverImage && (
									<div
										className='w-12 h-12 rounded-md bg-cover bg-center shrink-0'
										style={{
											backgroundImage: `url(${order.package.coverImage})`,
										}}
									/>
								)}
								<div>
									<p className='font-bold text-sm'>
										{order.package?.name}
									</p>
									<p className='text-xs text-muted-foreground'>
										{order.package?.slug}
									</p>
								</div>
							</div>

							{order.addons && order.addons.length > 0 && (
								<div className='mt-3 pt-2 border-t border-border/50'>
									<p className='text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider'>
										Included Addons:
									</p>
									<div className='space-y-2'>
										{order.addons.map((addon: any) => (
											<div
												key={addon.id}
												className='text-sm bg-background/50 p-2 rounded border border-border/50'>
												<div className='flex justify-between items-start'>
													<p className='font-medium text-xs'>
														<span className='text-primary font-bold'>
															{addon.quantity}x
														</span>{' '}
														{addon.name}
													</p>
												</div>
												<div className='mt-1 text-[10px] text-muted-foreground'>
													<p className='font-medium text-foreground/80'>
														From:{' '}
														{
															addon.productItem
																?.product
																?.vendor?.name
														}
													</p>
													<p>
														{
															addon.productItem
																?.product
																?.vendor
																?.address
														}
													</p>
													<p>
														{
															addon.productItem
																?.product
																?.vendor?.phone
														}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					<div>
						<Label className='text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-1.5 mb-2'>
							<Clock size={12} /> DELIVERY SCHEDULE
						</Label>
						<div className='space-y-1.5'>
							<div className='flex items-center gap-2 text-sm'>
								<Calendar
									size={14}
									className='text-purple-600'
								/>
								<span className='font-medium'>
									{deliveryDate}
								</span>
							</div>
							<div className='flex items-center gap-2 text-sm'>
								<Clock size={14} className='text-purple-600' />
								<span>{order.timeSlot}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Column 2: Recipient Info */}
				<div className='space-y-4'>
					<div>
						<Label className='text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-1.5 mb-2'>
							<User size={12} /> RECIPIENT DETAILS
						</Label>
						<div className='p-3 border rounded-lg bg-background space-y-2'>
							<p className='font-bold text-base'>
								{order.recipientName}
							</p>
							<div className='flex items-start gap-2 text-sm text-muted-foreground'>
								<MapPin size={14} className='mt-0.5 shrink-0' />
								<span>
									{order.recipientAddressLine1}
									{order.recipientAddressLine2 &&
										`, ${order.recipientAddressLine2}`}
									<br />
									{order.recipientCity},{' '}
									{order.recipientState || ''}
								</span>
							</div>
							<div className='flex items-center gap-2 text-sm text-primary font-medium'>
								<Phone size={14} />
								<a
									href={`tel:${order.recipientPhone}`}
									className='hover:underline'>
									{order.recipientPhone}
								</a>
							</div>
						</div>
					</div>

					<div>
						<Label className='text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1'>
							SENDER DETAILS
						</Label>
						<p className='text-sm'>
							<span className='font-medium'>
								{order.senderName ||
									order.user?.firstName +
										' ' +
										order.user?.lastName}
							</span>
							<span className='text-muted-foreground text-xs ml-1'>
								({order.user?.phone})
							</span>
						</p>
					</div>
				</div>

				{/* Column 3: Items & Message */}
				<div className='space-y-4'>
					{order.customCardMessage && (
						<div>
							<Label className='text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-1.5 mb-2'>
								<MessageSquare size={12} /> CARD MESSAGE
							</Label>
							<div className='bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-sm italic text-foreground/80 relative'>
								<span className='absolute top-2 left-2 text-yellow-500/40 text-2xl leading-none'>
									"
								</span>
								<p className='pl-4 relative z-10'>
									{order.customCardMessage}
								</p>
								<span className='absolute bottom-[-10px] right-2 text-yellow-500/40 text-2xl leading-none'>
									"
								</span>
							</div>
						</div>
					)}

					<div>
						<Label className='text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2 block'>
							ORDER NOTE
						</Label>
						{order.notes ? (
							<p className='text-sm text-muted-foreground italic'>
								{order.notes}
							</p>
						) : (
							<p className='text-xs text-muted-foreground'>
								No additional notes
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Status Control */}
			<div className='border-t pt-4 mt-2 relative z-10'>
				<div className='flex items-center gap-4 max-w-xs'>
					<Label className='text-xs whitespace-nowrap font-medium'>
						Update Status:
					</Label>
					<Select
						value={order.status}
						onValueChange={handleStatusChange}>
						<SelectTrigger className='w-full'>
							<SelectValue placeholder='Change Status' />
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
			</div>
		</div>
	);
}
