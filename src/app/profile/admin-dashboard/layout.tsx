'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import PageWrapper from '@/components/wrapers/PageWrapper';
import GoBackButton from '@/components/GoBackButton';
import { PAGES_DATA } from '@/data/pagesData';
import { MapPin, Settings, Landmark, FileCheck } from 'lucide-react';
import TabComponent from '@/components/TabComponent';
import { useState, useEffect } from 'react';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { BsBicycle } from 'react-icons/bs';

export default function AdminDashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [activeTab, setActiveTab] = useState('areas');
	const { data: session, isPending } = useSession();
	const router = useRouter();
	const trpc = useTRPC();

	// Check if user is super admin
	const { data: isAdmin, isPending: isAdminPending } = useQuery(
		trpc.users.checkAdminRole.queryOptions(undefined, {
			enabled: !!session,
		})
	);

	useEffect(() => {
		if (router && typeof window !== 'undefined') {
			const path = window.location.pathname;
			if (path.includes('/settings')) {
				setActiveTab('settings');
			} else if (path.includes('/settlements')) {
				setActiveTab('settlements');
			} else if (path.includes('/payouts')) {
				setActiveTab('payouts');
			} else if (path.includes('/vendor-requests')) {
				setActiveTab('requests');
			} else {
				setActiveTab('areas');
			}
		}
	}, [router]);

	if (isPending) {
		return (
			<PageWrapper>
				<div className='flex items-center gap-3 px-5 py-4 border-b'>
					<GoBackButton />
					<h1 className='text-xl font-semibold'>Admin Dashboard</h1>
				</div>
				<div className='p-5'>Loading...</div>
			</PageWrapper>
		);
	}

	// Check admin access
	if (!session || (!isAdmin && !isAdminPending)) {
		redirect(PAGES_DATA.profile_page);
	}

	return (
		<PageWrapper>
			<div className='flex items-center gap-3 px-5 py-4 border-b m-0'>
				<GoBackButton link={PAGES_DATA.profile_page} />
				<h1 className='text-xl font-semibold'>Admin Dashboard</h1>
			</div>

			{/* Navigation Tabs */}
			<div className='w-full pt-2 sticky top-0 z-10 bg-background my-0!'>
				<TabComponent
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					activeByPathname={true}
					tabs={[
						{
							id: 'requests',
							label: 'Verification Requests',
							icon: <FileCheck size={18} />,
						},
						{
							id: 'areas',
							label: 'Areas',
							icon: <MapPin size={18} />,
						},
						{
							id: 'payouts',
							label: 'Payouts',
							icon: <Landmark size={18} />,
						},
						{
							id: 'settlements',
							label: 'Delivery Settlements',
							icon: <BsBicycle size={18} />,
						},
						{
							id: 'settings',
							label: 'Settings',
							icon: <Settings size={18} />,
						},
					]}
					className={'border-b mb-0! p-0'}
					onTabChange={(id) => {
						if (id === 'settings') {
							router.push(
								PAGES_DATA.admin_dashboard_settings_page
							);
						} else if (id === 'payouts') {
							router.push('/profile/admin-dashboard/payouts');
						} else if (id === 'requests') {
							router.push(
								PAGES_DATA.admin_dashboard_vendor_requests_page
							);
						} else if (id === 'settlements') {
							router.push(
								PAGES_DATA.admin_dashboard_settlements_page
							);
						} else {
							router.push(PAGES_DATA.admin_dashboard_areas_page);
						}
					}}
				/>
			</div>

			{children}
		</PageWrapper>
	);
}
