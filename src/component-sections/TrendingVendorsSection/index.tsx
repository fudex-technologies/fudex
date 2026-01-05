'use client';

import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import Link from 'next/link';
import React from 'react';

const TrendingVendorsSection = () => {
	const { usePopularVendors } = useVendorProductActions();
	const { data: popularVendors = [], isLoading: popularVendorsIsLoading } =
		usePopularVendors({ take: 7 });

	const renderSkeleton = () =>
		Array.from({ length: 4 }).map((_, index) => (
			<React.Fragment key={index}>
				<li className='flex gap-2 items-center py-3'>
					<Skeleton className='w-3 h-3 rounded-full' />
					<Skeleton className='h-4 w-32' />
				</li>
				{index < 3 && (
					<Separator orientation='horizontal' className='w-full' />
				)}
			</React.Fragment>
		));

	return (
		<SectionWrapper className='my-5'>
			<div className='flex gap-2 items-center'>
				<ImageWithFallback
					src={'/assets/trendingIcon.svg'}
					alt='Trending'
				/>
				<p className='text-xl font-semibold'>Trending Vendors</p>
			</div>
			<ul className='my-5 text-[14px]]'>
				{popularVendorsIsLoading
					? renderSkeleton()
					: popularVendors.map((vendor, index) => (
							<React.Fragment key={vendor.id}>
								<li className='flex gap-2 items-center py-3'>
									<span className='w-3 h-3 rounded-full bg-border' />
									<Link
										href={PAGES_DATA.single_vendor_page(
											vendor.id
										)}>
										<p className='hover:underline'>
											{vendor.name}
										</p>
									</Link>
								</li>
								{index < popularVendors.length - 1 && (
									<Separator
										orientation='horizontal'
										className='w-full'
									/>
								)}
							</React.Fragment>
					  ))}
			</ul>
		</SectionWrapper>
	);
};

export default TrendingVendorsSection;
