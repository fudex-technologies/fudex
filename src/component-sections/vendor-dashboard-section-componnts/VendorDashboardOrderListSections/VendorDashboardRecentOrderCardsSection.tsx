"use client"

import SectionWrapper from '@/components/wrapers/SectionWrapper';
import VendorDashboardOrderItem from './VendorDashboardOrderCardItem';
import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { Skeleton } from '@/components/ui/skeleton';

const VendorDashboardRecentOrderCardsSection = () => {
	const { useGetMyOrders } = useVendorDashboardActions();
	const {
		data: orders = [],
		isLoading,
		refetch,
	} = useGetMyOrders({
		take: 1,
		status: ['PAID'],
	});

	if (isLoading) {
		return (
			<SectionWrapper className='w-full space-y-2'>
				<Skeleton className='h-32 w-full' />
			</SectionWrapper>
		);
	}

	if (orders.length === 0) {
		return null; // Don't show the "New Order" section if there are none
	}

	return (
		<SectionWrapper className='w-full space-y-2'>
			<div className='w-full'>
				<div className='relative w-full'>
					<div className='absolute w-full max-w-md h-full top bg-muted text-muted-foreground -top-2 -left-2 overflow-hidden rounded-lg shadow-sm'>
						<div className='w-full px-5 py-2 bg-[#24AA9A] text-white'>
							<p>New Order</p>
						</div>
					</div>
					<VendorDashboardOrderItem
						order={orders[0]}
						refetch={refetch}
					/>
				</div>
			</div>
		</SectionWrapper>
	);
};

export default VendorDashboardRecentOrderCardsSection;
