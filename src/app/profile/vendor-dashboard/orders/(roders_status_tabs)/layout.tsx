'use client';

import VendorDashboardMobileBottomNav from '@/components/navigation-components/VendorDashboardMobileBottomNav';
import TabComponent from '@/components/TabComponent';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { AlarmCheck, Clock, ShoppingBag } from 'lucide-react';
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

	return (
		<PageWrapper>
			<div className='flex items-center gap-10 w-full p-5'>
				<p>Orders</p>
				<p className='font-semibold text-xl'>FollyFem</p>
			</div>
			{/* Navigation Tabs */}
			<div className='w-full pt-2 sticky top-0 z-10 bg-background my-0!'>
				<TabComponent
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					activeByPathname={true}
					tabs={[
						{
							id: 'new',
							label: `New (0)`,
							icon: <ShoppingBag size={18} />,
						},
						{
							id: 'ongoing',
							label: `Ongoing (0)`,
							icon: <Clock size={18} />,
						},
						{
							id: 'ready',
							label: `Ready (0)`,
							icon: <AlarmCheck size={18} />,
						},
						{
							id: 'given-to-rider',
							label: `Given to rider (0)`,
							icon: <BsBicycle size={18} />,
						},
					]}
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
