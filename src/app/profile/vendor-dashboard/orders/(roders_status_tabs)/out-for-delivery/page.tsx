'use client';

import VendorDashboardOrderListInfinite from '@/component-sections/vendor-dashboard-section-componnts/VendorDashboardOrderListSections/VendorDashboardOrderListInfinite';

export default function VendorDashboardOutForDeliveryOrdersPage() {
	return (
		<VendorDashboardOrderListInfinite
			status={['OUT_FOR_DELIVERY']}
			emptyMessage='No orders out for delivery'
			emptySubMessage='Orders being delivered will appear here'
		/>
	);
}
