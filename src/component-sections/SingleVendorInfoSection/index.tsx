'use client';

import { Separator } from '@/components/ui/separator';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { FaStar } from 'react-icons/fa';
import { PiMapPinAreaFill } from 'react-icons/pi';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { Skeleton } from '@/components/ui/skeleton';
import { DayOfWeek } from '@prisma/client';

const DAY_ORDER: DayOfWeek[] = [
	'MONDAY',
	'TUESDAY',
	'WEDNESDAY',
	'THURSDAY',
	'FRIDAY',
	'SATURDAY',
	'SUNDAY',
];

const formatTime = (time: string | null) => {
	if (!time) return 'Not set';
	const [hours, minutes] = time.split(':');
	const hour = parseInt(hours);
	const ampm = hour >= 12 ? 'pm' : 'am';
	const displayHour = hour % 12 || 12;
	return `${displayHour}:${minutes} ${ampm}`;
};

const SingleVendorInfoSection = ({ vendorId }: { vendorId: string }) => {
	const { useGetVendorById } = useVendorProductActions();
	const { data: vendor, isLoading } = useGetVendorById({ id: vendorId });

	if (isLoading) {
		return (
			<SectionWrapper className='w-full max-w-lg mx-auto p-0!'>
				<div className='w-full p-5'>
					<Skeleton className='h-8 w-48 mb-4' />
					<div className='w-full flex items-center gap-3 my-5'>
						<Skeleton className='h-5 w-5' />
						<Skeleton className='h-4 flex-1' />
					</div>
				</div>
				<Separator orientation='horizontal' />
				<div className='my-5 w-full'>
					<Skeleton className='h-6 w-32 mx-5 mb-4' />
					<div className='w-full flex justify-between items-center p-5'>
						<Skeleton className='h-5 w-32' />
						<Skeleton className='h-5 w-5' />
					</div>
				</div>
				<Separator orientation='horizontal' />
				<div className='w-full p-5 space-y-3'>
					<Skeleton className='h-6 w-40 mb-4' />
					{[1, 2, 3, 4, 5, 6, 7].map((i) => (
						<div key={i} className='w-full flex justify-between'>
							<Skeleton className='h-4 w-24' />
							<Skeleton className='h-4 w-32' />
						</div>
					))}
				</div>
			</SectionWrapper>
		);
	}

	if (!vendor) {
		return (
			<SectionWrapper className='w-full max-w-lg mx-auto p-5'>
				<p className='text-center text-foreground/70'>
					Vendor not found
				</p>
			</SectionWrapper>
		);
	}

	const rating = vendor.reviewsAverage || 0;
	const reviewCount = vendor.reviewsCount || 0;
	const address = [vendor.address, vendor.city, vendor.country]
		.filter(Boolean)
		.join(', ');

	return (
		<SectionWrapper className='w-full max-w-lg mx-auto p-0!'>
			<div className='w-full p-5'>
				<h1 className='w-full text-xl font-bold'>{vendor.name}</h1>
				{address && (
					<div className='w-full flex items-center gap-3 my-5'>
						<PiMapPinAreaFill className='text-foreground/70 shrink-0' />
						<p className='flex-1 text-wrap text-start text-foreground/80'>
							{address}
						</p>
					</div>
				)}
			</div>
			<Separator orientation='horizontal' />
			<div className='my-5 w-full'>
				<p className='text-lg px-5'>Vendor rating</p>
				<Link
					href={PAGES_DATA.single_vendor_reviews_page(vendorId)}
					className='w-full flex justify-between items-center p-5'>
					<div className='flex items-center gap-1'>
						<FaStar
							width={15}
							height={15}
							className='text-[#F9C300]'
						/>
						<p className='text-foreground/80'>
							{rating > 0 ? rating.toFixed(1) : 'No ratings yet'}
							{reviewCount > 0 && (
								<span className='text-foreground/60'>
									{' '}
									({reviewCount} review
									{reviewCount !== 1 ? 's' : ''})
								</span>
							)}
						</p>
					</div>
					<ChevronRight />
				</Link>
			</div>
			<Separator orientation='horizontal' />
			<div className='w-full p-5 space-y-3'>
				<div className='flex justify-between items-center'>
					<h3 className='font-semibold text-lg'>Opening hours</h3>
					{vendor.availabilityStatus === 'CLOSED' && (
						<span className='text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold uppercase'>
							Temporarily Closed
						</span>
					)}
				</div>
				{vendor.availabilityStatus === 'CLOSED' && (
					<p className='text-sm text-red-600 font-medium px-1'>
						This vendor has manually paused orders for now. Regular
						hours below.
					</p>
				)}
				{vendor.openingHours && vendor.openingHours.length > 0 ? (
					DAY_ORDER.map((day) => {
						const dayHours = vendor.openingHours?.find(
							(h) => h.day === day
						);
						const dayName =
							day.charAt(0) + day.slice(1).toLowerCase();

						return (
							<div
								key={day}
								className='w-full flex justify-between items-center'>
								<p className='font-normal text-foreground/80'>
									{dayName}
								</p>
								<p className='text-foreground/70'>
									{dayHours?.isClosed
										? 'Closed'
										: dayHours?.openTime &&
										  dayHours?.closeTime
										? `${formatTime(
												dayHours.openTime
										  )} - ${formatTime(
												dayHours.closeTime
										  )}`
										: 'Not set'}
								</p>
							</div>
						);
					})
				) : (
					<p className='text-foreground/60 text-sm'>
						Opening hours not set
					</p>
				)}
			</div>
		</SectionWrapper>
	);
};

export default SingleVendorInfoSection;
