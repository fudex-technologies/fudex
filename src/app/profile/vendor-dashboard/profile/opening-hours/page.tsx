'use client';

import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import OpeningHoursSettings from '@/components/OpeningHoursSettings';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { Skeleton } from '@/components/ui/skeleton';
import PageWrapper from '@/components/wrapers/PageWrapper';
import GoBackButton from '@/components/GoBackButton';

export default function OpeningHoursPage() {
	const { useGetMyVendor } = useVendorDashboardActions();
	const { data: vendor, isLoading } = useGetMyVendor();

	if (isLoading) {
		return (
			<SectionWrapper className='p-5'>
				<Skeleton className='h-10 w-48 mb-6' />
				<Skeleton className='h-[400px] w-full' />
			</SectionWrapper>
		);
	}

	if (!vendor) {
		return (
			<SectionWrapper className='p-5'>
				<p className='text-foreground/70 text-center'>
					Vendor not found.
				</p>
			</SectionWrapper>
		);
	}

	return (
		<PageWrapper className='p-5 max-w-2xl mx-auto '>
			<div className='flex items-center gap-5 w-full'>
				<GoBackButton />
				<h1 className='font-semibold text-lg'>Manage Weekly Opening Hours</h1>
			</div>
			<OpeningHoursSettings vendorId={vendor.id} />
		</PageWrapper>
	);
}
