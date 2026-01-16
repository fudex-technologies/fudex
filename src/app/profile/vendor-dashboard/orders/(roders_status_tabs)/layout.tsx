'use client';

import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import VendorDashboardMobileBottomNav from '@/components/navigation-components/VendorDashboardMobileBottomNav';
import TabComponent from '@/components/TabComponent';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { OrderStatus } from '@prisma/client';
import {
	AlarmCheck,
	Clock,
	ShoppingBag,
	Truck,
	CheckCircle,
	XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BsBicycle } from 'react-icons/bs';

export default function VendorOrderListByStatussLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [activeTab, setActiveTab] = useState('new');
	const router = useRouter();
	const { useGetMyVendor, useGetMyOrderCounts } = useVendorDashboardActions();
	const { data: vendor } = useGetMyVendor();
	const { data: counts = [] } = useGetMyOrderCounts();

	const getCount = (statuses: OrderStatus[]) => {
		return counts
			.filter((c) => statuses.includes(c.status))
			.reduce((acc, curr) => acc + curr.count, 0);
	};

	const tabs = [
		{
			id: 'new',
			label: `New (${getCount(['PAID'])})`,
			icon: <ShoppingBag size={18} />,
		},
		{
			id: 'ongoing',
			label: `Ongoing (${getCount(['ACCEPTED', 'PREPARING'])})`,
			icon: <Clock size={18} />,
		},
		{
			id: 'ready',
			label: `Ready (${getCount(['READY'])})`,
			icon: <AlarmCheck size={18} />,
		},
		{
			id: 'given-to-rider',
			label: `Given to rider (${getCount(['ASSIGNED'])})`,
			icon: <BsBicycle size={18} />,
		},
		{
			id: 'out-for-delivery',
			label: `Out for delivery (${getCount(['OUT_FOR_DELIVERY'])})`,
			icon: <Truck size={18} />,
		},
		{
			id: 'completed',
			label: `Completed (${getCount(['DELIVERED'])})`,
			icon: <CheckCircle size={18} />,
		},
		// {
		// 	id: 'cancelled',
		// 	label: `Cancelled (${getCount(['CANCELLED'])})`,
		// 	icon: <XCircle size={18} />,
		// },
	];

	return (
		<PageWrapper>
			<div className='flex items-center gap-10 w-full p-5'>
				<p>Orders</p>
				<p className='font-semibold text-xl'>{vendor?.name || '...'}</p>
			</div>
			{/* Navigation Tabs */}
			<div className='w-full pt-2 sticky top-0 z-10 bg-background my-0!'>
				<TabComponent
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					activeByPathname={true}
					tabs={tabs}
					className={'border-b mb-0! p-0'}
					onTabChange={(id) => {
						router.push(
							`${PAGES_DATA.vendor_dashboard_orders_page}/${id}`
						);
					}}
				/>
			</div>
			{children}
			<VendorDashboardMobileBottomNav />
		</PageWrapper>
	);
}
