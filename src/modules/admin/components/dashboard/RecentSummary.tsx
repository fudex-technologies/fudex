'use client';

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	formatCurency,
	getFullName,
	getRelativeTime,
} from '@/lib/commonFunctions';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface TopVendorsProps {
	vendors: any[];
}

export function TopVendors({ vendors }: TopVendorsProps) {
	return (
		<Card className='col-span-1'>
			<CardHeader>
				<CardTitle>Top Vendors</CardTitle>
				<CardDescription>Highest revenue generators</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='space-y-6'>
					{vendors.map((vendor) => (
						<div
							key={vendor.id}
							className='flex items-center gap-4'>
							<ImageWithFallback
								src={
									vendor.coverImage ||
									'/assets/placeholder.png'
								}
								alt={vendor.name}
								width={40}
								height={40}
								className='rounded-full object-cover aspect-square'
							/>
							<div className='flex-1 space-y-1'>
								<p className='text-sm font-medium leading-none'>
									{vendor.name}
								</p>
								<p className='text-sm text-muted-foreground'>
									{vendor.orderCount} orders
								</p>
							</div>
							<div className='text-sm font-bold'>
								{formatCurency(vendor.revenue)}
							</div>
						</div>
					))}
					{vendors.length === 0 && (
						<div className='text-center py-4 text-muted-foreground text-sm'>
							No vendor data available
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

export function RecentActivity({ activity }: { activity: any }) {
	const { recentOrders = [] } = activity;

	return (
		<Card className='col-span-1 lg:col-span-2'>
			<CardHeader>
				<CardTitle>Recent Orders</CardTitle>
				<CardDescription>Latest platform transactions</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='space-y-6'>
					{recentOrders.map((order: any) => (
						<div key={order.id} className='flex items-center gap-4'>
							<div className='flex-1 space-y-1'>
								<div className='flex items-center gap-2'>
									<p className='text-sm font-medium leading-none'>
										{getFullName(order.user)} ordered from{' '}
										{order.vendor?.name || 'Unknown'}
									</p>
									<Badge
										variant='outline'
										className='text-[10px] h-4 px-1'>
										{order.status}
									</Badge>
								</div>
								<p className='text-xs text-muted-foreground'>
									{getRelativeTime(order.createdAt)} •{' '}
									{formatCurency(order.totalAmount)}
								</p>
							</div>
						</div>
					))}
					{recentOrders.length === 0 && (
						<div className='text-center py-4 text-muted-foreground text-sm'>
							No recent activity
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
