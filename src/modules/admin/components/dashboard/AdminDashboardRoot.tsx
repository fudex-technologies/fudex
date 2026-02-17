'use client';

import React, { useState } from 'react';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { StatCard } from './StatCard';
import { OverviewCharts, OrdersChart } from './OverviewCharts';
import { TopVendors, RecentActivity } from './RecentSummary';
import {
	Banknote,
	ShoppingCart,
	Users,
	Store,
	Bike,
	UserPlus,
	Calendar,
} from 'lucide-react';
import { formatCurency, formatNumber } from '@/lib/commonFunctions';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

export default function AdminDashboardRoot() {
	const trpc = useTRPC();
	const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>(
		'30d',
	);

	const { data: overview, isLoading: isOverviewLoading } = useQuery(
		trpc.admin.getDashboardOverview.queryOptions(),
	);

	const { data: chartData, isLoading: isChartLoading } = useQuery(
		trpc.admin.getDashboardCharts.queryOptions({ period }),
	);

	const { data: topVendors, isLoading: _isTopVendorsLoading } = useQuery(
		trpc.admin.getTopVendors.queryOptions({ limit: 5 }),
	);

	const { data: recentActivity, isLoading: _isActivityLoading } = useQuery(
		trpc.admin.getRecentActivity.queryOptions(),
	);

	if (isOverviewLoading || isChartLoading) {
		return (
			<div className='p-6 space-y-6 animate-pulse'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className='h-32 bg-muted rounded-xl' />
					))}
				</div>
				<div className='h-[400px] bg-muted rounded-xl' />
			</div>
		);
	}

	return (
		<div className='p-6 space-y-8 bg-background'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
				<div>
					<h2 className='text-3xl font-bold tracking-tight'>
						System Overview
					</h2>
					<p className='text-muted-foreground'>
						Monitor your platform&apos;s health and performance.
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<Calendar className='h-4 w-4 text-muted-foreground' />
					<Select
						value={period}
						onValueChange={(
							val: '7d' | '30d' | '90d' | '1y' | 'all',
						) => setPeriod(val)}>
						<SelectTrigger className='w-[180px]'>
							<SelectValue placeholder='Select period' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='7d'>Last 7 days</SelectItem>
							<SelectItem value='30d'>Last 30 days</SelectItem>
							<SelectItem value='90d'>Last 90 days</SelectItem>
							<SelectItem value='1y'>Last Year</SelectItem>
							<SelectItem value='all'>All time</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Main Performance Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
				<StatCard
					title='Total Revenue'
					value={formatCurency(overview?.totalRevenue || 0)}
					icon={Banknote}
					trend={overview?.revenueTrend}
					description='from last month'
				/>
				<StatCard
					title='Delivered Orders'
					value={formatNumber(overview?.deliveredOrders || 0)}
					icon={ShoppingCart}
					description='Lifetime completed orders'
				/>
				<StatCard
					title='Total Users'
					value={formatNumber(overview?.totalUsers || 0)}
					icon={Users}
					description='registered customers'
				/>
				<StatCard
					title='Active Vendors'
					value={formatNumber(overview?.activeVendors || 0)}
					icon={Store}
					description={`${overview?.totalVendors} total registered`}
				/>
			</div>

			{/* Operational & Actionable Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
				<StatCard
					title='Pending Orders'
					value={formatNumber(overview?.pendingOrders || 0)}
					icon={ShoppingCart}
					description='Awaiting payment/action'
				/>
				<StatCard
					title='Cancelled Orders'
					value={formatNumber(overview?.cancelledOrders || 0)}
					icon={ShoppingCart}
					description='Failed or cancelled'
				/>
				<StatCard
					title='Pending Approvals'
					value={overview?.pendingVendorRequests || 0}
					icon={UserPlus}
					className={
						overview?.pendingVendorRequests ? 'border-primary' : ''
					}
					description='New vendor requests'
				/>
				<StatCard
					title='Lifetime Orders'
					value={formatNumber(overview?.lifetimeOrders || 0)}
					icon={ShoppingCart}
					description='Total attempts made'
				/>
			</div>

			{/* Charts Row */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				<OverviewCharts
					data={chartData || []}
					title='Revenue Growth'
					description={`Platform revenue generated over ${period}`}
				/>
				<OrdersChart data={chartData || []} />
			</div>

			{/* Secondary & Growth Row */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<StatCard
					title='Active Riders'
					value={overview?.totalRiders || 0}
					icon={Bike}
				/>
				<StatCard
					title='Confirmed Referrals'
					value={overview?.confirmedReferrals || 0}
					icon={UserPlus}
					description='platform growth'
				/>
				<StatCard
					title='Processing Orders'
					value={formatNumber(overview?.processingOrders || 0)}
					icon={ShoppingCart}
					description='Currently in pipeline'
				/>
			</div>

			{/* Tables Row */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				<TopVendors vendors={topVendors || []} />
				<RecentActivity activity={recentActivity || {}} />
			</div>
		</div>
	);
}
