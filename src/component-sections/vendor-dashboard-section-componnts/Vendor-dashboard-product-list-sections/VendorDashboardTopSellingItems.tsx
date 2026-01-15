"use client"

import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import VendorDashboardProductListItem from './VendorDashboardProductListItem';
import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { Skeleton } from '@/components/ui/skeleton';

const VendorDashboardTopSellingItems = () => {
	const { useGetMyProductItems } = useVendorDashboardActions();
	const { data: items = [], isLoading } = useGetMyProductItems({
		take: 10,
	});

	if (isLoading) {
		return (
			<div className='w-full flex flex-col gap-3 pb-5'>
				<h2 className='text-lg font-semibold px-5'>
					<span className=''>👑</span> Top Selling Items
				</h2>
				<div className='flex space-x-4 mx-5 overflow-hidden'>
					{[1, 2, 3].map((i) => (
						<Skeleton
							key={i}
							className='h-[200px] w-[250px] shrink-0'
						/>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className='w-full flex flex-col gap-3 pb-5'>
			<h2 className='text-lg font-semibold px-5'>
				<span className=''>👑</span> Top Selling Items
			</h2>
			{items.length > 0 ? (
				<ScrollArea className='w-screen max-w-[1400px] whitespace-nowrap'>
					<div className='flex w-max space-x-4 mx-5'>
						{items.map((item, index) => (
							<div className='w-[250px]' key={index}>
								<VendorDashboardProductListItem
									productItem={item as any}
								/>
							</div>
						))}
					</div>
					<ScrollBar orientation='horizontal' hidden />
				</ScrollArea>
			) : (
				<div className='w-full flex flex-col items-center gap-2 justify-center text-center'>
					<ImageWithFallback
						src={'/assets/plate-illustration.png'}
						className='w-[150px]'
						alt='plate of food'
					/>
					<p className='text-foreground/50 text-center py-4 px-5'>
						Add menu to see top selling items
					</p>
				</div>
			)}
		</div>
	);
};

export default VendorDashboardTopSellingItems;
