import { Badge } from '../ui/badge';
import { ChevronRight, Repeat } from 'lucide-react';
import { Separator } from '../ui/separator';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';
import { Button } from '../ui/button';

const OngoingOrderItem = ({
	vendorName,
	orderStatus,
	itemCount,
	estimatedTime,
	orderId,

	deliveryDate,
	deliveryTime,
	deliveryAddress,
	pickupTime,
	pickupAddress,
	displayOrderId,
}: {
	displayOrderId: string;
	vendorName: string;
	orderStatus: 'preparing' | 'on-the-way' | 'delivered';
	itemCount: number;
	estimatedTime: string;
	orderId: string;

	// if orderstatus is delivered
	deliveryDate?: string;
	deliveryTime?: string;
	deliveryAddress?: string;
	pickupTime?: string;
	pickupAddress?: string;
}) => {
	// If orderId is short (8 chars), it's a display ID, otherwise use as-is
	const linkOrderId = orderId.length === 8 ? orderId : orderId;
	
	return (
		<Link
			href={PAGES_DATA.order_info_page(linkOrderId)}
			className='p-5 border border-foreground/50 rounded-md flex flex-col gap-3'>
			<div className='flex gap-2'>
				<div className=''>
					<ImageWithFallback
						width={60}
						height={60}
						src={'/assets/products/prod1.png'}
						className='object-cover rounded-md '
					/>
				</div>

				<div className='flex-1'>
					<div className='w-full flex justify-between'>
						<p className='text-lg font-semibold'>{vendorName}</p>

						<Badge
							className={cn(
								'capitalize',
								orderStatus === 'preparing' &&
									'text-chart-4 bg-chart-4/10',
								orderStatus === 'on-the-way' &&
									'text-chart-3 bg-chart-3/10',
								orderStatus === 'delivered' &&
									'text-primary bg-primary/10'
							)}>
							{orderStatus}
						</Badge>
					</div>
					{orderStatus !== 'delivered' && (
						<div className='w-full flex gap-3 justify-between items-center'>
							<div className='font-light'>
								<div className='flex gap-2'>
									<p>{itemCount} items</p>
									<Separator orientation='vertical' />
									<p>{estimatedTime}</p>
								</div>
								<p>Order ID: #{displayOrderId}</p>
							</div>
							<ChevronRight />
						</div>
					)}
					{orderStatus === 'delivered' && deliveryDate && (
						<p>
							{deliveryDate}{' '}
							{deliveryTime && `at ${deliveryTime}`}
						</p>
					)}
				</div>
			</div>

			{orderStatus === 'delivered' && (
				<>
					<Separator
						orientation='horizontal'
						className='bg-foreground/50'
					/>

					<div className='w-full space-y-2'>
						<div className='w-full flex gap-3 items-center'>
							<ImageWithFallback
								src={'/assets/locationIcon.svg'}
								width={20}
								height={20}
								alt='Location'
							/>
							<div className='flex justify-center gap-1'>
								<span className='w-2 h-2 rounded-full bg-destructive' />
								<span className='w-2 h-2 rounded-full from-destructive to-primary bg-linear-to-tr' />
								<span className='w-2 h-2 rounded-full bg-primary' />
							</div>
							<div className=''>
								<p className='text-light text-foreground/50'>
									Picked up at {pickupTime}
								</p>
								<p className=''>{pickupAddress}</p>
							</div>
						</div>
						<div className='w-full flex gap-3 items-center'>
							<div className='flex justify-center gap-1'>
								<span className='w-2 h-2 rounded-full bg-destructive' />
								<span className='w-2 h-2 rounded-full from-destructive to-primary bg-linear-to-tr' />
								<span className='w-2 h-2 rounded-full bg-primary' />
							</div>
							<ImageWithFallback
								src={'/assets/locationIcon.svg'}
								width={20}
								height={20}
								alt='Location'
							/>
							<div className=''>
								<p className='text-light text-foreground/50'>
									Delivered at {deliveryTime}
								</p>
								<p className=''>{deliveryAddress}</p>
							</div>
						</div>
					</div>

					<Separator
						orientation='horizontal'
						className='bg-foreground/50'
					/>

					<Button
						variant={'outline'}
						className='w-full border-primary text-primary py-5'>
						<Repeat />
						Repeat Order
					</Button>
				</>
			)}
		</Link>
	);
};

export default OngoingOrderItem;
