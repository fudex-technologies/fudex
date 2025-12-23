import OngoingOrderItem from '@/components/order-components/OngoingOrderItem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export default function OngoingOrdersPage() {
	const isEmpty = false;
	return (
		<div className='w-full'>
			{/* Empty state */}
			{isEmpty && (
				<div className='w-full p-5 flex flex-col gap-5 items-center justify-center my-20'>
					<ImageWithFallback
						src={'/assets/bike.png'}
						className='w-full'
					/>
					<div className='text-center'>
						<p className='text-sm font-light'>
							We’re waiting for your first order
						</p>
					</div>
					<Button
						variant={'game'}
						size={'lg'}
						className='w-full mt-10 py-5'>
						Order now
					</Button>
				</div>
			)}

			{/* With data state */}
			{!isEmpty && (
				<div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-5'>
					<OngoingOrderItem
						estimatedTime='5 - 10mins'
						itemCount={2}
						orderId='FDX-238491'
						vendorName='Bukolary'
						orderStatus='preparing'
					/>
					<OngoingOrderItem
						estimatedTime='5 - 10mins'
						itemCount={2}
						orderId='FDX-238491'
						vendorName='Bukolary'
						orderStatus='on-the-way'
					/>
				</div>
			)}
		</div>
	);
}
