'use client';

import React, { useState } from 'react';
import { DiscountType } from '@prisma/client';
import { format } from 'date-fns';
import Link from 'next/link';
import { useDiscountActions } from '@/api-hooks/useDiscountActions';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDiscountsPage() {
	const [statusFilter, setStatusFilter] = useState<
		'ALL' | 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'EXHAUSTED'
	>('ALL');
	const [page, setPage] = useState(0);
	const take = 20;

	const {
		useListDiscounts,
		toggleDiscount: toggleDiscountAction,
		deleteDiscount: deleteDiscountAction,
	} = useDiscountActions();

	const {
		data: discounts,
		isLoading,
		refetch,
	} = useListDiscounts({
		take,
		skip: page * take,
		status: statusFilter,
	});

	const toggleMutation = toggleDiscountAction({
		onSuccess: () => {
			refetch();
		},
	});

	const deleteMutation = deleteDiscountAction({
		onSuccess: () => {
			refetch();
		},
	});

	if (isLoading) return <div className='p-8'>Loading discounts...</div>;

	return (
		<SectionWrapper className='p-5 space-y-8'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
				<div>
					<h2 className='text-xl font-semibold text-foreground'>
						Pricing Discounts
					</h2>
					<p className='text-muted-foreground text-sm'>
						Manage platform, vendor, and product discounts.
					</p>
				</div>
				<Button asChild>
					<Link href='/profile/admin-dashboard/discounts/create'>
						<Plus size={18} className='mr-2' />
						Create Discount
					</Link>
				</Button>
			</div>

			<div className='flex gap-2 pb-2 overflow-x-auto'>
				{['ALL', 'ACTIVE', 'SCHEDULED', 'EXPIRED', 'EXHAUSTED'].map(
					(s) => (
						<button
							key={s}
							onClick={() => {
								setStatusFilter(s as any);
								setPage(0);
							}}
							className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
								statusFilter === s
									? 'bg-foreground text-background'
									: 'bg-muted text-muted-foreground hover:bg-muted/80'
							}`}>
							{s}
						</button>
					),
				)}
			</div>

			<div className='bg-background rounded-xl shadow-sm border overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full text-left text-sm text-foreground/70'>
						<thead className='bg-muted/50 text-foreground border-b'>
							<tr>
								<th className='px-6 py-4 font-semibold'>
									Name
								</th>
								<th className='px-6 py-4 font-semibold'>
									Type/Value
								</th>
								<th className='px-6 py-4 font-semibold'>
									Scope
								</th>
								<th className='px-6 py-4 font-semibold'>
									Usage
								</th>
								<th className='px-6 py-4 font-semibold'>
									Duration
								</th>
								<th className='px-6 py-4 font-semibold'>
									Status
								</th>
								<th className='px-6 py-4 font-semibold text-right'>
									Actions
								</th>
							</tr>
						</thead>
						<tbody className='divide-y'>
							{(!discounts ||
								(discounts as any).length === 0) && (
								<tr>
									<td
										colSpan={7}
										className='px-6 py-8 text-center text-muted-foreground'>
										No discounts found matching the current
										filter.
									</td>
								</tr>
							)}
							{(discounts as any)?.map((d: any) => (
								<tr key={d.id} className='hover:bg-muted/30'>
									<td className='px-6 py-4 font-medium text-foreground'>
										{d.name}
									</td>
									<td className='px-6 py-4'>
										{d.type === DiscountType.PERCENTAGE
											? `${d.value}%`
											: `₦${d.value.toLocaleString()}`}
									</td>
									<td className='px-6 py-4'>
										<div className='flex flex-col'>
											<span className='font-medium text-xs bg-muted border px-2 py-0.5 rounded w-fit'>
												{d.scope.replace('_', ' ')}
											</span>
											{d.vendor && (
												<span className='text-xs text-muted-foreground mt-1'>
													{d.vendor.name}
												</span>
											)}
											{d.productItem && (
												<span className='text-xs text-muted-foreground mt-1'>
													{d.productItem.name}
												</span>
											)}
										</div>
									</td>
									<td className='px-6 py-4'>
										{d.usageLimit
											? `${d.usageCount} / ${d.usageLimit}`
											: `${d.usageCount} (∞)`}
									</td>
									<td className='px-6 py-4 text-xs'>
										{format(
											new Date(d.startAt),
											'MMM d, yy h:mm a',
										)}{' '}
										<br />
										<span className='text-muted-foreground'>
											to
										</span>{' '}
										<br />
										{format(
											new Date(d.endAt),
											'MMM d, yy h:mm a',
										)}
									</td>
									<td className='px-6 py-4'>
										<button
											onClick={() =>
												toggleMutation.mutate({
													id: d.id,
													isActive: !d.isActive,
												})
											}
											className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
												d.isActive
													? 'bg-green-500'
													: 'bg-muted'
											}`}>
											<span className='sr-only'>
												Toggle active status
											</span>
											<span
												aria-hidden='true'
												className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
													d.isActive
														? 'translate-x-2'
														: '-translate-x-2'
												}`}
											/>
										</button>
										{!d.isActive && (
											<span className='ml-2 text-xs text-destructive font-medium'>
												Inactive
											</span>
										)}
									</td>
									<td className='px-6 py-4 text-right space-x-3'>
										<Link
											href={`/profile/admin-dashboard/discounts/${d.id}/edit`}
											className='text-primary hover:underline font-medium'>
											Edit
										</Link>
										<button
											onClick={() => {
												if (
													confirm(
														'Are you sure you want to delete this discount?',
													)
												) {
													deleteMutation.mutate({
														id: d.id,
													});
												}
											}}
											className='text-destructive hover:text-destructive/80 font-medium'>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className='px-6 py-4 border-t flex justify-between items-center bg-muted/30'>
					<button
						disabled={page === 0}
						onClick={() => setPage((p) => Math.max(0, p - 1))}
						className='px-4 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-background hover:bg-muted/50 transition-colors'>
						Previous
					</button>
					<span className='text-sm text-muted-foreground'>
						Page {page + 1}
					</span>
					<button
						disabled={
							!discounts || (discounts as any).length < take
						}
						onClick={() => setPage((p) => p + 1)}
						className='px-4 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-background hover:bg-muted/50 transition-colors'>
						Next
					</button>
				</div>
			</div>
		</SectionWrapper>
	);
}
