import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import VendorDashboardProfileCircle from '@/components/vendor-dashboard-components/VendorDashboardProfileCircle';
import VendorAvailabilityStatusSwitch from '@/components/vendor-dashboard-components/VendorAvailabilityStatusSwitch';
import VendorDashboardOrdertats from '@/component-sections/vendor-dashboard-section-componnts/VendorDashboardOrderStats';
import VendorDashboardQuickActionsSection from '@/component-sections/vendor-dashboard-section-componnts/VendorDashboardQuickActionsSection';
import VendorDashboardTopSellingItems from '@/component-sections/vendor-dashboard-section-componnts/Vendor-dashboard-product-list-sections/VendorDashboardTopSellingItems';
import VendorDashboardAvailableItems from '@/component-sections/vendor-dashboard-section-componnts/Vendor-dashboard-product-list-sections/VendorDashboardAvailableItems';
import VendorDashboardMobileBottomNav from '@/components/navigation-components/VendorDashboardMobileBottomNav';
import VendorDashboardRecentOrderCardsSection from '@/component-sections/vendor-dashboard-section-componnts/VendorDashboardOrderListSections/VendorDashboardRecentOrderCardsSection';

export default function VendorDashboardPage() {
	return (
		<PageWrapper>
			<SectionWrapper className='w-full flex items-center gap-5 justify-between'>
				<VendorDashboardProfileCircle />
				<VendorAvailabilityStatusSwitch />
			</SectionWrapper>
			<VendorDashboardOrdertats />
			<VendorDashboardRecentOrderCardsSection />
			<VendorDashboardQuickActionsSection />
			<VendorDashboardTopSellingItems />
			<VendorDashboardAvailableItems />
			<VendorDashboardMobileBottomNav />
		</PageWrapper>
	);
}
