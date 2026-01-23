import VendorRiderRequestDetailsSection from '@/component-sections/vendor-dashboard-section-componnts/rider-request-sections/VendorRiderRequestDetailsSection';
import VendorDashboardMobileBottomNav from '@/components/navigation-components/VendorDashboardMobileBottomNav';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import GoBackButton from '@/components/GoBackButton';
import { Suspense } from 'react';

export default function RiderRequestDetailsPage() {
	return (
		<PageWrapper>
			<div className='flex items-center gap-10 w-full px-5 '>
				<GoBackButton className='!' />
				<h1 className='font-bold text-lg'>Request Details</h1>
			</div>
			<VendorRiderRequestDetailsSection />
			<Suspense>
				<VendorDashboardMobileBottomNav />
			</Suspense>
		</PageWrapper>
	);
}
