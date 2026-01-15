'use client';

import VendorDashboardOrderListInfinite from '@/component-sections/vendor-dashboard-section-componnts/VendorDashboardOrderListSections/VendorDashboardOrderListInfinite';

export default function VendorDashboardReadyOrdersPage() {
	return (
		<VendorDashboardOrderListInfinite
			status={['READY']}
			emptyMessage='No ready orders yet'
			emptySubMessage='Orders marked as ready for pickup will appear here'
		/>
	);
}
