'use client';

import VendorDashboardOrderListInfinite from '@/component-sections/vendor-dashboard-section-componnts/VendorDashboardOrderListSections/VendorDashboardOrderListInfinite';

export default function VendorDashboardCancelledOrdersPage() {
	return (
		<VendorDashboardOrderListInfinite
			status={['CANCELLED']}
			emptyMessage='No cancelled orders'
			emptySubMessage='Orders you rejected or were cancelled will appear here'
		/>
	);
}
