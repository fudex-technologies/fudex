'use client';

import { useRiderRequestActions } from '@/api-hooks/useRiderRequestActions';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { formatCurency, formatDate } from '@/lib/commonFunctions';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function AdminSettlementPage() {
	const { useListAdminSettlements, approveSettlements } =
		useRiderRequestActions();
	const {
		data: settlements,
		isLoading,
		refetch: refetchSettlements,
	} = useListAdminSettlements();
	const { mutate: approve, isPending: approving } = approveSettlements({
		onSuccess: () => {
			refetchSettlements();
		},
	});

	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	const toggleSelect = (id: string) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
		);
	};

	const handleApprove = () => {
		if (selectedIds.length === 0) return;
		approve(
			{ requestIds: selectedIds },
			{
				onSuccess: () => {
					setSelectedIds([]);
					refetchSettlements();
				},
			},
		);
	};

	return (
		<PageWrapper>
			<SectionWrapper>
				<div className='flex justify-between items-center mb-6'>
					<h1 className='text-2xl font-bold'>
						Vendor Rider Request Settlements
					</h1>
					<Button
						disabled={selectedIds.length === 0 || approving}
						onClick={handleApprove}
						className='bg-green-600 hover:bg-green-700'>
						{approving ? (
							<Loader2 className='animate-spin' />
						) : (
							`Approve Selected (${selectedIds.length})`
						)}
					</Button>
				</div>

				{isLoading ? (
					<div className='flex justify-center p-10'>
						<Loader2
							className='animate-spin text-primary'
							size={40}
						/>
					</div>
				) : (
					<div className='overflow-x-auto border rounded-xl shadow-sm'>
						<table className='w-full text-left border-collapse'>
							<thead>
								<tr className='bg-muted/50 text-sm font-semibold'>
									<th className='p-4 border-b'>
										<input
											type='checkbox'
											onChange={(e) => {
												if (e.target.checked)
													setSelectedIds(
														settlements?.map(
															(s) => s.id,
														) || [],
													);
												else setSelectedIds([]);
											}}
											checked={
												selectedIds.length ===
													(settlements?.length ||
														0) &&
												settlements?.length !== 0
											}
										/>
									</th>
									<th className='p-4 border-b'>Vendor</th>
									<th className='p-4 border-b'>Date</th>
									<th className='p-4 border-b'>Fee</th>
									<th className='p-4 border-b'>Status</th>
									<th className='p-4 border-b'>Settlement</th>
									<th className='p-4 border-b'>Actions</th>
								</tr>
							</thead>
							<tbody>
								{settlements?.map((s) => (
									<tr
										key={s.id}
										className='hover:bg-muted/30 transition-colors text-sm'>
										<td className='p-4 border-b'>
											<input
												type='checkbox'
												checked={selectedIds.includes(
													s.id,
												)}
												onChange={() =>
													toggleSelect(s.id)
												}
											/>
										</td>
										<td className='p-4 border-b font-medium'>
											{s.vendor.name}
										</td>
										<td className='p-4 border-b'>
											{formatDate(s.createdAt.toString())}
										</td>
										<td className='p-4 border-b font-bold'>
											{formatCurency(s.totalFee)}
										</td>
										<td className='p-4 border-b'>
											<span className='px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold uppercase'>
												{s.status}
											</span>
										</td>
										<td className='p-4 border-b'>
											<span
												className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
													s.settlementStatus ===
													'PENDING_VERIFICATION'
														? 'bg-blue-100 text-blue-700'
														: 'bg-amber-100 text-amber-700'
												}`}>
												{s.settlementStatus.replace(
													'_',
													' ',
												)}
											</span>
										</td>
										<td className='p-4 border-b'>
											<Button
												size='sm'
												variant='outline'
												onClick={() =>
													approve({
														requestIds: [s.id],
													})
												}
												className='text-green-600 border-green-200 hover:bg-green-50'>
												<CheckCircle
													size={14}
													className='mr-1'
												/>{' '}
												Approve
											</Button>
										</td>
									</tr>
								))}
								{(!settlements || settlements.length === 0) && (
									<tr>
										<td
											colSpan={7}
											className='p-10 text-center text-muted-foreground'>
											No pending settlements found.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}
			</SectionWrapper>
		</PageWrapper>
	);
}
