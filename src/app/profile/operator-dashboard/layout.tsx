'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import PageWrapper from '@/components/wrapers/PageWrapper';
import GoBackButton from '@/components/GoBackButton';
import { PAGES_DATA } from '@/data/pagesData';
import { ShoppingBag, Users, Tag, Store } from 'lucide-react';
import TabComponent from '@/components/TabComponent';
import { useState, useEffect } from 'react';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';

export default function OperatorDashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [activeTab, setActiveTab] = useState('orders');
	const { data: session, isPending } = useSession();
	const router = useRouter();
	const trpc = useTRPC();

	// Check if user is an operator
	const { data: isOperator, isPending: isOperatorPending } = useQuery(
		trpc.operators.checkOperatorRole.queryOptions(undefined, {
			enabled: !!session,
		})
	);

	useEffect(() => {
		if (router && typeof window !== 'undefined') {
			const path = window.location.pathname;
			if (path.includes('/riders')) {
				setActiveTab('riders');
			} else if (path.includes('/categories')) {
				setActiveTab('categories');
			} else if (path.includes('/vendors')) {
				setActiveTab('vendors');
			} else {
				setActiveTab('orders');
			}
		}
	}, [router]);

	if (isPending) {
		return (
			<PageWrapper>
				<div className='flex items-center gap-3 px-5 py-4 border-b'>
					<GoBackButton />
					<h1 className='text-xl font-semibold'>Operator Dashboard</h1>
				</div>
				<div className='p-5'>Loading...</div>
			</PageWrapper>
		);
	}

	// Check operator access
	if (!session || (!isOperator && !isOperatorPending)) {
		redirect(PAGES_DATA.profile_page);
	}

	return (
		<PageWrapper>
			<div className='flex items-center gap-3 px-5 py-4 border-b m-0'>
				<GoBackButton link={PAGES_DATA.profile_page} />
				<h1 className='text-xl font-semibold'>Operator Dashboard</h1>
			</div>

			{/* Navigation Tabs */}
			<div className='w-full pt-2 sticky top-0 z-10 bg-background my-0!'>
				<TabComponent
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					activeByPathname={true}
					tabs={[
						{
							id: 'orders',
							label: 'Orders',
							icon: <ShoppingBag size={18} />,
						},
						{
							id: 'riders',
							label: 'Riders',
							icon: <Users size={18} />,
						},
						{
							id: 'categories',
							label: 'Categories',
							icon: <Tag size={18} />,
						},
						{
							id: 'vendors',
							label: 'Vendors',
							icon: <Store size={18} />,
						},
					]}
					className={'border-b mb-0! p-0'}
					onTabChange={(id) => {
						router.push(`${PAGES_DATA.operator_dashboard_page}/${id}`);
					}}
				/>
			</div>

			{children}
		</PageWrapper>
	);
}

