'use client';

import { useTRPC } from '@/trpc/client';
import { useState } from 'react';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { formatCurency } from '@/lib/commonFunctions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
	Loader2,
	Search,
	ChevronLeft,
	ChevronRight,
	CreditCard,
	Banknote,
	CheckCircle2,
	Clock,
} from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/modules/admin/components/dashboard/StatCard';
import { formatNumber } from '@/lib/commonFunctions';

export default function AdminPaymentsPage() {
	const trpc = useTRPC();
	const [page, setPage] = useState(0);
	const [status, setStatus] = useState<string>('ALL');
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const take = 20;

	// Handle search with debounce manually or just useEffect
	// For simplicity using immediate state update for input, but query checks debouncedSearch
	const handleSearchChange = (val: string) => {
		setSearch(val);
		// In a real app, use a debounce hook. Here we'll just set it.
		// For query performance, relying on tanstack query's key change
		setTimeout(() => setDebouncedSearch(val), 500);
	};

	const { data, isLoading } = useQuery(
		trpc.payments.getAllPayments.queryOptions({
			skip: page * take,
			take,
			status: status === 'ALL' ? undefined : (status as any),
			search: debouncedSearch || undefined,
		}),
	);

	const { data: stats, isLoading: isStatsLoading } = useQuery(
		trpc.payments.getPaymentStats.queryOptions(),
	);

	const totalPages = data ? Math.ceil(data.total / take) : 0;

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'COMPLETED':
				return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
			case 'PENDING':
				return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
			case 'FAILED':
				return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
			case 'REFUNDED':
				return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
			default:
				return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
		}
	};

	return (
		<SectionWrapper className='space-y-6'>
			<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
				<div>
					<h2 className='text-3xl font-bold tracking-tight'>
						Payments
					</h2>
					<p className='text-muted-foreground'>
						View and manage all payment transactions.
					</p>
				</div>
			</div>

			{isStatsLoading ? (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse'>
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className='h-24 bg-muted rounded-lg border'
						/>
					))}
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
					<StatCard
						title='Total Revenue'
						value={formatCurency(stats?.totalRevenue || 0)}
						icon={Banknote}
						description='Lifetime completed payments'
					/>
					<StatCard
						title="Today's Revenue"
						value={formatCurency(stats?.todayRevenue || 0)}
						icon={Banknote}
						description='Completed payments today'
					/>
					<StatCard
						title='Completed'
						value={formatNumber(stats?.completedCount || 0)}
						icon={CheckCircle2}
						className='border-green-500/20'
					/>
					<StatCard
						title='Pending'
						value={formatNumber(stats?.pendingCount || 0)}
						icon={Clock}
						className='border-yellow-500/20'
					/>
					<StatCard
						title='Refunded'
						value={formatNumber(stats?.refundedCount || 0)}
						icon={Banknote}
						className='border-red-500/20'
					/>
				</div>
			)}

			<div className='flex flex-col gap-4 md:flex-row md:items-center justify-between bg-card p-4 rounded-lg border'>
				<div className='relative w-full md:w-96'>
					<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
					<Input
						placeholder='Search references, emails, or Order IDs...'
						className='pl-8'
						value={search}
						onChange={(e) => handleSearchChange(e.target.value)}
					/>
				</div>
				<div className='flex items-center gap-2'>
					<Select
						value={status}
						onValueChange={(val) => {
							setStatus(val);
							setPage(0);
						}}>
						<SelectTrigger className='w-[180px]'>
							<SelectValue placeholder='Filter by Status' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='ALL'>All Statuses</SelectItem>
							<SelectItem value='COMPLETED'>Completed</SelectItem>
							<SelectItem value='PENDING'>Pending</SelectItem>
							<SelectItem value='FAILED'>Failed</SelectItem>
							<SelectItem value='REFUNDED'>Refunded</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className='rounded-md border bg-card'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Overview</TableHead>
							<TableHead>User</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className='text-right'>Date</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className='h-24 text-center'>
									<div className='flex justify-center items-center'>
										<Loader2 className='animate-spin mr-2' />
										Loading payments...
									</div>
								</TableCell>
							</TableRow>
						) : data?.payments.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className='h-24 text-center text-muted-foreground'>
									No payments found.
								</TableCell>
							</TableRow>
						) : (
							data?.payments.map((payment) => (
								<TableRow key={payment.id}>
									<TableCell>
										<div className='flex flex-col'>
											<span className='font-medium'>
												{payment.providerRef}
											</span>
											<span className='text-xs text-muted-foreground'>
												Order #
												{payment.orderId.slice(0, 8)}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<div className='flex flex-col'>
											<span className='font-medium'>
												{payment.user.name}
											</span>
											<span className='text-xs text-muted-foreground'>
												{payment.user.email}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<div className='flex flex-col'>
											<span className='font-bold'>
												{formatCurency(payment.amount)}
											</span>
											<span className='text-xs text-muted-foreground'>
												{/* @ts-ignore - vendor is included in query but type might not infer deeply */}
												From:{' '}
												{payment.order?.vendor?.name ||
													'Unknown Vendor'}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<Badge
											variant='outline'
											className={getStatusColor(
												payment.status,
											)}>
											{payment.status}
										</Badge>
									</TableCell>
									<TableCell className='text-right'>
										<div className='flex flex-col items-end'>
											<span>
												{new Date(
													payment.createdAt,
												).toLocaleDateString()}
											</span>
											<span className='text-xs text-muted-foreground'>
												{new Date(
													payment.createdAt,
												).toLocaleTimeString()}
											</span>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<div className='flex items-center justify-between'>
				<p className='text-sm text-muted-foreground'>
					Showing {data?.payments.length || 0} of {data?.total || 0}{' '}
					entries
				</p>
				<div className='flex items-center gap-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => setPage((p) => Math.max(0, p - 1))}
						disabled={page === 0 || isLoading}>
						<ChevronLeft className='h-4 w-4 mr-2' />
						Previous
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => setPage((p) => p + 1)}
						disabled={
							!data ||
							(page + 1) * take >= data.total ||
							isLoading
						}>
						Next
						<ChevronRight className='h-4 w-4 ml-2' />
					</Button>
				</div>
			</div>
		</SectionWrapper>
	);
}
