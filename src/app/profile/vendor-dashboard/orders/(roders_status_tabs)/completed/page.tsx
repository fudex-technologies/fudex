'use client';

import VendorDashboardOrderListInfinite from '@/component-sections/vendor-dashboard-section-componnts/VendorDashboardOrderListSections/VendorDashboardOrderListInfinite';

export default function VendorDashboardCompletedOrdersPage() {
	return (
		<VendorDashboardOrderListInfinite
			status={['DELIVERED']}
			emptyMessage='No completed orders yet'
			emptySubMessage='Your successful deliveries will appear here'
		/>
	);
}
