'use client';

import GoBackButton from '@/components/GoBackButton';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';
import { usePackageActions } from '@/api-hooks/usePackageActions';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const PackageTopSection = ({ packageSlug }: { packageSlug: string }) => {
	const { useGetPackageBySlug } = usePackageActions();
	const { data: packageData, isLoading } = useGetPackageBySlug({ slug: packageSlug });

	if (isLoading) {
		return (
			<div className='w-full flex flex-col items-center'>
				<div className='h-[180px] w-full relative'>
					<Skeleton className='w-full h-full' />
				</div>
				<Skeleton className='w-full max-w-sm sm:max-w-md h-16 rounded-b-3xl' />
			</div>
		);
	}

	if (!packageData) {
		return null;
	}

	const coverImage = packageData.coverImage || '/assets/valentinebackground.png';
	const orderCloseDate = packageData.orderCloseDate
		? format(new Date(packageData.orderCloseDate), 'MMMM do')
		: null;

	return (
		<div className='w-full flex flex-col items-center'>
			<div className='h-[180px] w-full relative '>
				<div
					className={cn(
						'w-full h-full relative overflow-hidden bg-muted',
					)}>
					<ImageWithFallback
						src={coverImage}
						alt={packageData.name}
						className={cn('object-cover w-full')}
						// fallbackSrc='/assets/valentinebackground.png'
					/>
				</div>
				<div className='absolute top-0 left-0 w-full p-5 flex justify-between gap-5 text-white z-10'>
					<GoBackButton className='bg-[#0000004D]' />
				</div>
			</div>

			{packageData.description && (
				<div className='w-full max-w-sm sm:max-w-md p-3 rounded-b-3xl bg-[#FF305A] text-white text-center'>
					{packageData.description}
					{orderCloseDate && (
						<span className='block mt-1 text-sm'>
							Orders close {orderCloseDate}.
						</span>
					)}
				</div>
			)}
		</div>
	);
};

export default PackageTopSection;
