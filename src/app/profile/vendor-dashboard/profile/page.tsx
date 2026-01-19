import VendorDashboardProfileMenu from '@/component-sections/vendor-dashboard-section-componnts/VendorDashboardProfileSections/VendorDashboardProfileMenu';
import VendorDashboardProfileTopSection from '@/component-sections/vendor-dashboard-section-componnts/VendorDashboardProfileSections/VendorDashboardProfileTopSection';
import VendorDashboardMobileBottomNav from '@/components/navigation-components/VendorDashboardMobileBottomNav';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { Suspense } from 'react';

export default function VendorProfilePage() {
	return (
		<PageWrapper className='h-full w-full bg-foreground/5 p-0'>
			<VendorDashboardProfileTopSection />
			<VendorDashboardProfileMenu />
			{/* <VendorProfileSection /> */}
			<Suspense>
				<VendorDashboardMobileBottomNav />
			</Suspense>
		</PageWrapper>
	);
}
