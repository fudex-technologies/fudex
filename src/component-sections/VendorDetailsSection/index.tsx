'use client';

import { Separator } from '@/components/ui/separator';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { formatCurency } from '@/lib/commonFunctions';
import { FaBicycle, FaBoltLightning, FaStar } from 'react-icons/fa6';
import { GrAlarm } from 'react-icons/gr';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { Skeleton } from '@/components/ui/skeleton';

const VendorDetailsSection = ({
	vendorId,
	showDetails = true,
}: {
	vendorId: string;
	showDetails?: boolean;
}) => {
	const { useGetVendorById } = useVendorProductActions();
	const { data: vendor, isLoading } = useGetVendorById({ id: vendorId });

	if (isLoading) {
		return (
			<SectionWrapper className='space-y-5'>
				<div className=''>
					<Skeleton className='h-8 w-48 mb-2' />
					<Skeleton className='h-4 w-32' />
				</div>
				{showDetails && (
					<div className='flex flex-col'>
						<Separator orientation={'horizontal'} className='w-full' />
						<div className='w-full flex flex-1 justify-between gap-2 py-5'>
							<Skeleton className='flex-1 h-20' />
							<Skeleton className='flex-1 h-20' />
							<Skeleton className='flex-1 h-20' />
						</div>
						<Separator orientation={'horizontal'} className='w-full' />
					</div>
				)}
			</SectionWrapper>
		);
	}

	if (!vendor) {
		return (
			<SectionWrapper className='space-y-5'>
				<p className='text-foreground/50'>Vendor not found</p>
			</SectionWrapper>
		);
	}

	const rating = vendor.reviewsAverage || 0;
	const reviewCount = vendor.reviewsCount || 0;
	const deliveryPrice = 600; // Default delivery price, can be calculated from area later

	return (
		<SectionWrapper className='space-y-5'>
			<div className=''>
				<h1 className='text-2xl font-bold'>{vendor.name}</h1>
				<div className='flex gap-5 text-[14px]'>
					{rating > 0 && (
						<div className='flex items-center gap-1'>
							<FaStar
								width={15}
								height={15}
								className='text-[#F9C300]'
							/>
							<p className='text-foreground/80'>
								{rating.toFixed(1)}
								{reviewCount > 0 && (
									<span className='text-foreground/60'>({reviewCount})</span>
								)}
							</p>
						</div>
					)}
					{vendor.description && (
						<p className='text-foreground/80'>{vendor.description}</p>
					)}
				</div>
			</div>
			{showDetails && (
				<div className='flex flex-col '>
					<Separator orientation={'horizontal'} className='w-full' />
					<div className='w-full flex flex-1 justify-between gap-2 py-5'>
						<div className='flex-1 flex flex-col items-center justify-center gap-2 border-r'>
							<div className='w-10 h-10 rounded-full flex justify-center items-center  bg-secondary/10 text-secondary'>
								<GrAlarm width={15} height={15} />
							</div>
							<p className=''>25 - 30mins</p>
						</div>
						<div className='flex-1 flex flex-col items-center justify-center gap-2'>
							<div className='w-10 h-10 rounded-full flex justify-center items-center  bg-secondary/10 text-secondary'>
								<FaBicycle />
							</div>
							<p className=''>
								From {formatCurency(deliveryPrice)}
							</p>
						</div>
						<div className='flex-1 flex flex-col items-center justify-center gap-2 border-l'>
							<div className='w-10 h-10 rounded-full flex justify-center items-center  bg-secondary/10 text-secondary'>
								<FaBoltLightning />
							</div>
							<p className=''>25 - 30mins</p>
						</div>
					</div>

					<Separator orientation={'horizontal'} className='w-full' />
				</div>
			)}
		</SectionWrapper>
	);
};

export default VendorDetailsSection;
