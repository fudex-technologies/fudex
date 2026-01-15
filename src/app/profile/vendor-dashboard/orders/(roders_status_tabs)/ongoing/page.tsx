'use client';

import VendorDashboardOrderListInfinite from '@/component-sections/vendor-dashboard-section-componnts/VendorDashboardOrderListSections/VendorDashboardOrderListInfinite';

export default function VendorDashboardOngoingOrdersPage() {
	return (
		<VendorDashboardOrderListInfinite
			status={['ACCEPTED', 'PREPARING']}
			emptyMessage='No ongoing orders yet'
			emptySubMessage='Orders in preparation will appear here'
		/>
	);
}
