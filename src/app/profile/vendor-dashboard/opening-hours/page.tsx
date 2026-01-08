'use client';

import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import OpeningHoursSettings from '@/components/OpeningHoursSettings';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { Skeleton } from '@/components/ui/skeleton';

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
		<SectionWrapper className='p-5 max-w-2xl mx-auto'>
			<h2 className='text-xl font-semibold mb-6'>
				Manage Weekly Opening Hours
			</h2>
			<OpeningHoursSettings vendorId={vendor.id} />
		</SectionWrapper>
	);
}
