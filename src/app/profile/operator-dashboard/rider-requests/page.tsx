'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus } from 'lucide-react';
import { formatCurency, formatDate } from '@/lib/commonFunctions';
import { useState } from 'react';
import { toast } from 'sonner';

export default function OperatorRiderRequestsPage() {
	const trpc = useTRPC();
	const {
		data: requests,
		isLoading,
		refetch,
	} = useQuery(trpc.operators.listRiderRequests.queryOptions({}));
	const { data: riders } = useQuery(
		trpc.operators.listRiders.queryOptions({}),
	);

	const { mutate: assignRider, isPending: assigning } = useMutation(
		trpc.operators.assignRiderToRequest.mutationOptions({
			onSuccess: () => {
				toast.success('Rider assigned successfully');
				refetch();
			},
		}),
	);

	const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

	return (
		<PageWrapper>
			<SectionWrapper>
				<h1 className='text-2xl font-bold mb-6'>
					Manage Rider Requests
				</h1>

				{isLoading ? (
					<div className='flex justify-center p-10'>
						<Loader2
							className='animate-spin text-primary'
							size={40}
						/>
					</div>
				) : (
					<div className='grid grid-cols-1 gap-6'>
						{requests?.items.map((req) => (
							<div
								key={req.id}
								className='border rounded-2xl p-6 bg-card shadow-sm flex flex-col md:flex-row justify-between gap-6'>
								<div className='space-y-2'>
									<div className='flex items-center gap-2'>
										<span className='font-bold text-lg'>
											Request #{req.id.substring(0, 8)}
										</span>
										<span
											className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
												req.status === 'PENDING'
													? 'bg-amber-100 text-amber-700'
													: 'bg-green-100 text-green-700'
											}`}>
											{req.status}
										</span>
									</div>
									<p className='text-sm text-muted-foreground'>
										Vendor:{' '}
										<span className='text-foreground font-medium'>
											{req.vendor.name}
										</span>
									</p>
									<p className='text-sm text-muted-foreground'>
										Date:{' '}
										{formatDate(req.createdAt.toString())}
									</p>
									<p className='text-sm text-muted-foreground'>
										Items: {req.items.length} Customers
									</p>
									<div className='mt-4'>
										<p className='text-xs font-semibold uppercase text-muted-foreground mb-2'>
											Deliveries:
										</p>
										<ul className='space-y-3'>
											{req.items.map((item, idx) => (
												<li
													key={item.id}
													className='border rounded-xl p-3 bg-muted/30'>
													<div className='flex justify-between items-start mb-1'>
														<span className='font-bold text-sm'>
															{idx + 1}.{' '}
															{item.customerName}
														</span>
														<span className='font-bold text-sm text-primary'>
															{formatCurency(
																item.deliveryFee,
															)}
														</span>
													</div>
													<div className='space-y-1 text-xs text-muted-foreground'>
														<p className='flex items-center gap-1 font-medium text-foreground'>
															Phone:{' '}
															{item.customerPhone}
														</p>
														<p className='leading-relaxed'>
															<span className='font-medium text-foreground'>
																Address:
															</span>{' '}
															{
																item.customerAddress
															}{' '}
															({item.area.name})
														</p>
													</div>
												</li>
											))}
										</ul>
									</div>
								</div>

								<div className='flex flex-col justify-between items-end gap-4 min-w-[200px]'>
									<div className='text-right'>
										<p className='text-xs text-muted-foreground uppercase'>
											Total Fee
										</p>
										<p className='text-2xl font-black'>
											{formatCurency(req.totalFee)}
										</p>
									</div>

									{req.status === 'PENDING' ? (
										<div className='w-full space-y-2'>
											<select
												className='w-full p-2 border rounded-lg text-sm'
												onChange={(e) =>
													setSelectedRequest(
														e.target.value,
													)
												}
												defaultValue=''>
												<option value='' disabled>
													Select Rider
												</option>
												{riders?.items.map((r) => (
													<option
														key={r.id}
														value={r.id}>
														{r.name}
													</option>
												))}
											</select>
											<Button
												className='w-full'
												disabled={assigning}
												onClick={() => {
													const riderId = (
														document.querySelector(
															'select',
														) as HTMLSelectElement
													).value;
													if (riderId)
														assignRider({
															requestId: req.id,
															riderId,
														});
												}}>
												<UserPlus
													size={16}
													className='mr-2'
												/>{' '}
												Assign Rider
											</Button>
										</div>
									) : (
										<div className='bg-muted p-4 rounded-xl w-full text-center'>
											<p className='text-xs text-muted-foreground uppercase mb-1'>
												Assigned Rider
											</p>
											<p className='font-bold'>
												{req.assignedRider?.name ||
													'N/A'}
											</p>
										</div>
									)}
								</div>
							</div>
						))}
						{(!requests || requests.items.length === 0) && (
							<div className='text-center p-20 border-2 border-dashed rounded-3xl text-muted-foreground'>
								No active rider requests from vendors.
							</div>
						)}
					</div>
				)}
			</SectionWrapper>
		</PageWrapper>
	);
}
