import VendorDashboardPayoutDetails from '@/component-sections/vendor-dashboard-section-componnts/VendorDashboardPayoutsSections/VendorDashboardPayoutDetails';
import VendorDashboardRecentPayoutsSection from '@/component-sections/vendor-dashboard-section-componnts/VendorDashboardPayoutsSections/VendorDashboardRecentPayoutsSection';
import VendorDashboardMobileBottomNav from '@/components/navigation-components/VendorDashboardMobileBottomNav';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';

export default function VendorDashboardPayoutsPage() {
	return (
		<PageWrapper>
			<SectionWrapper className='max-w-lg'>
				<h1 className='font-bold text-lg'>Earnings & Payouts</h1>
				<p className='text-sm'>
					Payments are sent directly to your bank account
				</p>
			</SectionWrapper>
			<VendorDashboardPayoutDetails />
			<VendorDashboardRecentPayoutsSection />
			<VendorDashboardMobileBottomNav />
		</PageWrapper>
	);
}
