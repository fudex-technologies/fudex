'use client';

import { usePayoutActions } from '@/api-hooks/usePayoutActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurency } from '@/lib/commonFunctions';
import { PayoutTransferStatus } from '@prisma/client';
import { Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

export default function PayoutHistory() {
	const [search, setSearch] = useState('');
	const [debouncedSearch] = useDebounce(search, 1000);
	const [statusFilter, setStatusFilter] = useState<
		PayoutTransferStatus | undefined
	>(undefined);
	const { ref, inView } = useInView();

	const { useInfiniteGetAllPayouts } = usePayoutActions();
	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
	} = useInfiniteGetAllPayouts({
		limit: 20,
		search: debouncedSearch || undefined,
		status: statusFilter,
	});

	useEffect(() => {
		if (inView && hasNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, fetchNextPage]);

	// Refetch when filters change
	useEffect(() => {
		refetch();
	}, [debouncedSearch, statusFilter, refetch]);

	const payouts = data?.pages.flatMap((page) => page.items) || [];

	return (
		<div className='space-y-4'>
			<div className='flex flex-wrap items-center gap-4'>
				<div className='relative flex-1 min-w-[200px]'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4' />
					<Input
						placeholder='Search by Order ID, Reference, or Vendor...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className='pl-9'
					/>
				</div>
				<div className='flex gap-2'>
					<Button
						variant={
							statusFilter === undefined ? 'default' : 'outline'
						}
						size='sm'
						onClick={() => setStatusFilter(undefined)}>
						All
					</Button>
					<Button
						variant={
							statusFilter === 'SUCCESS' ? 'default' : 'outline'
						}
						size='sm'
						onClick={() => setStatusFilter('SUCCESS')}
						className='text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 data-[state=active]:bg-green-600'>
						Paid
					</Button>
					<Button
						variant={
							statusFilter === 'PENDING' ? 'default' : 'outline'
						}
						size='sm'
						onClick={() => setStatusFilter('PENDING')}
						className='text-yellow-600 border-yellow-200 hover:bg-yellow-50 hover:text-yellow-700'>
						Pending
					</Button>
					<Button
						variant={
							statusFilter === 'FAILED' ? 'default' : 'outline'
						}
						size='sm'
						onClick={() => setStatusFilter('FAILED')}
						className='text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700'>
						Failed
					</Button>
				</div>
			</div>

			<div className='border rounded-md'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Date</TableHead>
							<TableHead>Vendor</TableHead>
							<TableHead>Order / Reference</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<Skeleton className='h-4 w-24' />
									</TableCell>
									<TableCell>
										<Skeleton className='h-4 w-32' />
									</TableCell>
									<TableCell>
										<Skeleton className='h-4 w-40' />
									</TableCell>
									<TableCell>
										<Skeleton className='h-4 w-20' />
									</TableCell>
									<TableCell>
										<Skeleton className='h-6 w-16 rounded-full' />
									</TableCell>
								</TableRow>
							))
						) : payouts.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className='h-24 text-center'>
									No payouts found.
								</TableCell>
							</TableRow>
						) : (
							payouts.map((payout) => (
								<TableRow key={payout.id}>
									<TableCell className='font-medium text-xs'>
										<div>
											{new Date(
												payout.initiatedAt,
											).toLocaleDateString()}
										</div>
										<div className='text-muted-foreground'>
											{new Date(
												payout.initiatedAt,
											).toLocaleTimeString()}
										</div>
									</TableCell>
									<TableCell>
										<div className='font-medium'>
											{payout.vendor.name}
										</div>
										<div className='text-xs text-muted-foreground'>
											{payout.vendor.email}
										</div>
									</TableCell>
									<TableCell>
										<div className='text-xs'>
											<span className='font-semibold'>
												Ref:
											</span>{' '}
											{payout.transferRef || 'N/A'}
										</div>
										<div className='text-xs text-muted-foreground'>
											Order #{payout.orderId.slice(0, 8)}
										</div>
									</TableCell>
									<TableCell className='font-bold'>
										{formatCurency(payout.amount)}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												payout.status === 'SUCCESS'
													? 'default'
													: payout.status ===
														  'PENDING'
														? 'secondary'
														: 'destructive'
											}
											className={
												payout.status === 'SUCCESS'
													? 'bg-green-100 text-green-800 hover:bg-green-200 border-none'
													: payout.status ===
														  'PENDING'
														? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none'
														: 'bg-red-100 text-red-800 hover:bg-red-200 border-none'
											}>
											{payout.status}
										</Badge>
									</TableCell>
								</TableRow>
							))
						)}

						{/* Infinite Scroll Loader */}
						{isFetchingNextPage && (
							<TableRow>
								<TableCell
									colSpan={5}
									className='text-center py-4'>
									<div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
										<Loader2 className='h-4 w-4 animate-spin' />
										Loading more...
									</div>
								</TableCell>
							</TableRow>
						)}

						{/* Scroll Anchor */}
						<TableRow ref={ref} className='border-0'>
							<TableCell colSpan={5} className='p-0 border-0' />
						</TableRow>
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
