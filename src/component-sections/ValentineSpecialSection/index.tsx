'use client';

import VendorCard from '@/components/VendorCard';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function ValentineSpecialSection() {
	const { useInfiniteListVendors } = useVendorProductActions();

	// Fetch cake vendors specifically
	const { data, isLoading } = useInfiniteListVendors({
		limit: 10,
		openedSort: true,
		categorySlug: 'cakes', // The special valentine category
	});

	const vendors = useMemo(() => {
		return data?.pages.flatMap((page) => page.items) ?? [];
	}, [data]);

	if (isLoading) {
		// return <ValentineSpecialSkeleton />;
		return null;
	}

	// Don't show if no cake vendors
	if (vendors.length === 0) return null;

	return (
		<div className='w-full flex flex-col gap-3'>
			<div className='px-5 flex flex-col gap-1'>
				<div className='flex items-center gap-2'>
					<h2 className='text-lg font-bold text-pink-600'>
						Valentine&apos;s Specials 💘
					</h2>
					{/* <div className='h-px flex-1 bg-pink-200'></div> */}
				</div>
				<p className='text-xs text-muted-foreground'>
					Get the sweetest treats for your loved ones
				</p>
			</div>

			<ScrollArea className='w-screen max-w-[1400px] whitespace-nowrap'>
				<div className='flex w-max space-x-4 mx-5 pb-4'>
					{vendors.map((vendor) => (
						<div key={vendor.id} className='w-[280px]'>
							<VendorCard vendor={vendor} />
						</div>
					))}
				</div>
				<ScrollBar orientation='horizontal' hidden />
			</ScrollArea>
		</div>
	);
}

function ValentineSpecialSkeleton() {
	return (
		<div className='w-full flex flex-col gap-3'>
			<div className='px-5'>
				<Skeleton className='h-6 w-48 mb-1' />
				<Skeleton className='h-3 w-64' />
			</div>
			<div className='px-5 w-full flex gap-4 overflow-hidden'>
				{Array.from({ length: 4 }).map((_, index) => (
					<div
						key={index}
						className='min-w-[280px] w-[280px] flex flex-col gap-2'>
						<Skeleton className='h-[150px] w-full rounded-lg' />
						<Skeleton className='h-4 w-3/4' />
						<Skeleton className='h-4 w-1/2' />
					</div>
				))}
			</div>
		</div>
	);
}
