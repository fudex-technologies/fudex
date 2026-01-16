'use client';

import VendorDashboardOrderListInfinite from '@/component-sections/vendor-dashboard-section-componnts/VendorDashboardOrderListSections/VendorDashboardOrderListInfinite';

export default function VendorDashboardGivenToRiderOrdersPage() {
	return (
		<VendorDashboardOrderListInfinite
			status={['ASSIGNED']}
			emptyMessage='No orders given to rider yet'
			emptySubMessage='Orders where a rider is assigned will appear here'
		/>
	);
}
