import VendorDashboardPayoutsHistorySection from '@/component-sections/vendor-dashboard-section-componnts/VendorDashboardPayoutsSections/VendorDashboardPayoutsHistorySection';
import GoBackButton from '@/components/GoBackButton';
import VendorDashboardMobileBottomNav from '@/components/navigation-components/VendorDashboardMobileBottomNav';
import PageWrapper from '@/components/wrapers/PageWrapper';

export default async function EarningsHistoryPage() {
	return (
		<PageWrapper>
			<div className='flex items-center gap-10 w-full px-5'>
				<GoBackButton />
				<h1 className='font-semibold text-xl'>Earning History</h1>
			</div>
			<VendorDashboardPayoutsHistorySection />
			<VendorDashboardMobileBottomNav />
		</PageWrapper>
	);
}
