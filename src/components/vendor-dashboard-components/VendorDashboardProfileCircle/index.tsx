'use client';

import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { shortenText } from '@/lib/commonFunctions';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

const VendorDashboardProfileCircle = () => {
	const { useGetMyVendor } = useVendorDashboardActions();
	const { data: vendor, isLoading } = useGetMyVendor();

	if (isLoading) {
		return (
			<div className='w-fit flex gap-2 items-center'>
				<Skeleton className='w-10 h-10 rounded-full' />
				<div className='space-y-1'>
					<Skeleton className='h-3 w-16' />
					<Skeleton className='h-4 w-24' />
				</div>
			</div>
		);
	}

	return (
		<div className='w-fit flex gap-2 items-center'>
			<ImageWithFallback
				width={40}
				height={40}
				src={
					vendor?.coverImage || '/assets/restaurants/restaurant1.png'
				}
				alt='vendor display image'
				className='rounded-full aspect-square object-cover'
			/>
			<div className='text-start'>
				<p className='text-sm text-foreground/50 m-0'>Welcome back</p>
				<h1 className='text-lg font-bold m-0 leading-[100%]'>
					{shortenText(vendor?.name || 'Vendor', 30)}
				</h1>
			</div>
		</div>
	);
};

export default VendorDashboardProfileCircle;
