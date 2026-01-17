'use client';

import { PAGES_DATA } from '@/data/pagesData';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ChevronRight, FileClock, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function VendorRequestsPage() {
	const trpc = useTRPC();
	const [searchQuery, setSearchQuery] = useState('');

	const { data: result, isLoading } = useQuery(
		trpc.vendors.getPendingVendors.queryOptions({})
	);

	const filteredVendors = result?.vendors.filter((vendor) =>
		vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className='p-5 max-w-4xl mx-auto'>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-xl font-bold'>Vendor Requests</h2>
				<div className='relative w-64'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
					<Input
						placeholder='Search requests...'
						className='pl-9'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			{isLoading ? (
				<div className='space-y-4'>
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className='h-24 w-full bg-secondary/50 animate-pulse rounded-lg'
						/>
					))}
				</div>
			) : filteredVendors && filteredVendors.length > 0 ? (
				<div className='space-y-4'>
					{filteredVendors.map((vendor) => (
						<Link
							key={vendor.id}
							href={PAGES_DATA.admin_dashboard_vendor_request_details_page(
								vendor.id
							)}
							className='block bg-card hover:bg-secondary/50 transition-colors border rounded-lg p-5 shadow-sm'>
							<div className='flex items-center justify-between'>
								<div className='space-y-1'>
									<div className='flex items-center gap-2'>
										<h3 className='font-semibold text-lg'>
											{vendor.name}
										</h3>
										<span className='px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium border border-yellow-200'>
											Pending
										</span>
									</div>
									<p className='text-sm text-muted-foreground'>
										Submitted on{' '}
										{vendor.submittedAt
											? format(
													new Date(
														vendor.submittedAt
													),
													'PPP'
											  )
											: 'N/A'}
									</p>
									<p className='text-sm flex items-center gap-1 text-muted-foreground/80'>
										<FileClock className='h-3 w-3' />
										Wait time:{' '}
										{vendor.submittedAt
											? Math.ceil(
													(new Date().getTime() -
														new Date(
															vendor.submittedAt
														).getTime()) /
														(1000 * 60 * 60 * 24)
											  )
											: 0}{' '}
										days
									</p>
								</div>
								<ChevronRight className='text-muted-foreground' />
							</div>
						</Link>
					))}
				</div>
			) : (
				<div className='flex flex-col items-center justify-center py-20 text-center space-y-3'>
					<div className='bg-secondary/50 p-4 rounded-full'>
						<FileClock className='h-8 w-8 text-muted-foreground' />
					</div>
					<div>
						<h3 className='font-semibold text-lg'>
							No Pending Requests
						</h3>
						<p className='text-muted-foreground max-w-sm'>
							There are no new vendor applications waiting for
							approval at the moment.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
