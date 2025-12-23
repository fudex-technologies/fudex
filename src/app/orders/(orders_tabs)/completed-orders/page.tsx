import OngoingOrderItem from '@/components/order-components/OngoingOrderItem';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

export default function CompletedOrdersPage() {
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
						orderStatus='delivered'
						deliveryDate='14 Jan 2025'
						deliveryTime='5:30 PM'
						deliveryAddress='Road 5, Iworoko rd, Ekiti'
						pickupTime='4:42 PM'
						pickupAddress='God is good, Phase 2, Ekiti'
					/>
					<OngoingOrderItem
						estimatedTime='5 - 10mins'
						itemCount={2}
						orderId='FDX-238491'
						vendorName='Bukolary'
						orderStatus='delivered'
						deliveryDate='14 Jan 2025'
						deliveryTime='5:30 PM'
						deliveryAddress='Road 5, Iworoko rd, Ekiti'
						pickupTime='4:42 PM'
						pickupAddress='God is good, Phase 2, Ekiti'
					/>
				</div>
			)}
		</div>
	);
}
