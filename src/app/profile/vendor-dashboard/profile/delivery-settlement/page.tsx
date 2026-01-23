import VendorDashboardDeliverySetlementDetailsSection from '@/component-sections/vendor-dashboard-section-componnts/vendor-delivery-settlemrnt-sections/VendorDashboardDeliverySetlementDetailsSection';
import VendorDashboardDeliverySettlementOrderHistorySection from '@/component-sections/vendor-dashboard-section-componnts/vendor-delivery-settlemrnt-sections/VendorDashboardDeliverySettlementOrderHistorySection';
import VendorDashboardMobileBottomNav from '@/components/navigation-components/VendorDashboardMobileBottomNav';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { Suspense } from 'react';

export default function DeliverySettlementPage() {
	return (
		<PageWrapper>
			<SectionWrapper className='max-w-lg'>
				<h1 className='font-bold text-lg'>Delivery Settlement</h1>
			</SectionWrapper>
			<VendorDashboardDeliverySetlementDetailsSection />
			<VendorDashboardDeliverySettlementOrderHistorySection />
			<Suspense>
				<VendorDashboardMobileBottomNav />
			</Suspense>
		</PageWrapper>
	);
}
