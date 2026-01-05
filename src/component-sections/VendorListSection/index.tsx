'use client';

import VendorCard from '@/components/VendorCard';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useFilterVendorsQueries } from '@/nuqs-hooks/useFilterVendorsQueries';

const VendorListSection = ({ title }: { title?: string }) => {
	const { useListVendors } = useVendorProductActions();
	const [filterQueries] = useFilterVendorsQueries();
	const selectedRating = filterQueries.rating;
	const { data: vendors, isLoading } = useListVendors({
		take: 50,
		ratingFilter: selectedRating as any,
	});

	// Randomize the order of vendors
	const randomizedVendors = useMemo(() => {
		if (!vendors?.length) return [];
		const shuffled = [...vendors];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}, [vendors]);

	if (isLoading) {
		return (
			<VendorListSectionSkeleton title={title} />
		);
	}

	return (
		<SectionWrapper className='w-full flex flex-col gap-3'>
			{title && <h2 className='text-lg font-semibold '>{title}</h2>}
			{randomizedVendors.length > 0 ? (
				<div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
					{randomizedVendors.map((vendor) => (
						<VendorCard vendor={vendor} key={vendor.id} />
					))}
				</div>
			) : (
				<p className='text-foreground/50 text-center py-8'>
					No vendors available
				</p>
			)}
		</SectionWrapper>
	);
};

export default VendorListSection;


export const VendorListSectionSkeleton = ({ title }: { title?: string }) =>{
	return(
		<SectionWrapper className='w-full flex flex-col gap-3'>
				{title && <h2 className='text-lg font-semibold '>{title}</h2>}
				<div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
					{Array.from({ length: 8 }).map((_, index) => (
						<div key={index} className='flex flex-col gap-2'>
							<Skeleton className='h-[150px] w-full rounded-lg' />
							<Skeleton className='h-4 w-3/4' />
							<Skeleton className='h-4 w-1/2' />
						</div>
					))}
				</div>
			</SectionWrapper>
	)
}