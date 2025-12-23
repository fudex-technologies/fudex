import { Badge } from '../ui/badge';
import { ChevronRight } from 'lucide-react';
import { Separator } from '../ui/separator';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';

const OngoingOrderItem = ({
	vendorName,
	orderStatus,
	itemCount,
	estimatedTime,
	orderId,
}: {
	vendorName: string;
	orderStatus: 'preparing' | 'on-the-way';
	itemCount: number;
	estimatedTime: string;
	orderId: string;
}) => {
	return (
		<Link
			href={PAGES_DATA.order_info_page(orderId)}
			className='p-5 border border-foreground/50 rounded-md flex gap-2'>
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
								'text-chart-3 bg-chart-3/10'
						)}>
						{orderStatus}
					</Badge>
				</div>
				<div className='w-full flex gap-3 justify-between items-center'>
					<div className='font-light'>
						<div className='flex gap-2'>
							<p>{itemCount} items</p>
							<Separator orientation='vertical' />
							<p>{estimatedTime}</p>
						</div>
						<p>Order ID: #{orderId}</p>
					</div>
					<ChevronRight />
				</div>
			</div>
		</Link>
	);
};

export default OngoingOrderItem;
