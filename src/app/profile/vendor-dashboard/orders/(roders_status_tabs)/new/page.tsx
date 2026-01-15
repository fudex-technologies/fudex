'use client';

import VendorDashboardOrderListInfinite from '@/component-sections/vendor-dashboard-section-componnts/VendorDashboardOrderListSections/VendorDashboardOrderListInfinite';

export default function VendorDashboardNewOrdersPage() {
	return (
		<VendorDashboardOrderListInfinite
			status={['PAID']}
			emptyMessage='No New Orders yet'
			emptySubMessage='When customers places an order, it will appear here'
		/>
	);
}
