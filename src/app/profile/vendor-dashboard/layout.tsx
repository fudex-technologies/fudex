'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import PageWrapper from '@/components/wrapers/PageWrapper';
import GoBackButton from '@/components/GoBackButton';
import { PAGES_DATA } from '@/data/pagesData';
import { Store, Package, ShoppingBag } from 'lucide-react';
import TabComponent from '@/components/TabComponent';
import { useState } from 'react';
import { usePRofileActions } from '@/api-hooks/useProfileActions';

export default function VendorDashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [activeTab, setActiveTab] = useState('profile');
	const { data: session, isPending } = useSession();
	const router = useRouter();

	// Check if user is a vendor
	const { data: isVendor, isPending: isVendorPending } =
		usePRofileActions().isUserAVendor();

	if (isPending) {
		return (
			<PageWrapper>
				<div className='flex items-center gap-3 px-5 py-4 border-b'>
					<GoBackButton />
					<h1 className='text-xl font-semibold'>Vendor Dashboard</h1>
				</div>
				<div className='p-5'>Loading...</div>
			</PageWrapper>
		);
	}

	if ((!session || !isVendor) && !isVendorPending) {
		redirect(PAGES_DATA.profile_page);
	}

	return (
		<PageWrapper>
			<div className='flex items-center gap-3 px-5 py-4 border-b m-0'>
				<GoBackButton link={PAGES_DATA.profile_page} />
				<h1 className='text-xl font-semibold'>Vendor Dashboard</h1>
			</div>

			{/* Navigation Tabs */}

			<div className='w-full pt-2 sticky top-0 z-10 bg-background my-0!'>
				<TabComponent
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					activeByPathname={true}
					tabs={[
						{
							id: 'profile',
							label: 'Profile',
							icon: <Store size={18} />,
						},
						{
							id: 'products',
							label: 'Products',
							icon: <Package size={18} />,
						},
						{
							id: 'orders',
							label: 'Orders',
							icon: <ShoppingBag size={18} />,
						},
					]}
					className={'border-b mb-0! p-0'}
					onTabChange={(id) =>
						router.push(`${PAGES_DATA.vendor_dashboard_page}/${id}`)
					}
				/>
			</div>

			{children}
		</PageWrapper>
	);
}
