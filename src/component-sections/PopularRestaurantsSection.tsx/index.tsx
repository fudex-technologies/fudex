'use client';

import RestaurantCard from '@/components/VendorCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { Skeleton } from '@/components/ui/skeleton';

const PopularRestaurantsSection = () => {
	const { usePopularVendors } = useVendorProductActions();
	const { data: vendors = [], isLoading } = usePopularVendors({ take: 10 });

	if (isLoading) {
		return (
			<div className='w-full flex flex-col gap-3 pb-5'>
				<h2 className='text-lg font-semibold px-5'>Popular Restaurant</h2>
				<ScrollArea className='w-screen max-w-[1400px] whitespace-nowrap'>
					<div className='flex w-max space-x-4 mx-5'>
						{Array.from({ length: 5 }).map((_, index) => (
							<div className='w-[250px]' key={index}>
								<Skeleton className='h-[150px] w-full rounded-lg mb-2' />
								<Skeleton className='h-4 w-3/4 mb-1' />
								<Skeleton className='h-4 w-1/2' />
							</div>
						))}
					</div>
					<ScrollBar orientation='horizontal' hidden />
				</ScrollArea>
			</div>
		);
	}

	return (
		<div className='w-full flex flex-col gap-3 pb-5'>
			<h2 className='text-lg font-semibold px-5'>Popular Restaurant</h2>
			{vendors.length > 0 ? (
				<ScrollArea className='w-screen max-w-[1400px] whitespace-nowrap'>
					<div className='flex w-max space-x-4 mx-5'>
						{vendors.map((vendor) => (
							<div className='w-[250px]' key={vendor.id}>
								<RestaurantCard vendor={vendor} />
							</div>
						))}
					</div>
					<ScrollBar orientation='horizontal' hidden />
				</ScrollArea>
			) : (
				<p className='text-foreground/50 text-center py-4 px-5'>No popular vendors available</p>
			)}
		</div>
	);
};

export default PopularRestaurantsSection;
