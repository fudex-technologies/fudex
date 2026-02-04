'use client';

import { usePayoutActions } from '@/api-hooks/usePayoutActions';
import { useState } from 'react';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { formatCurency } from '@/lib/commonFunctions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Landmark, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminPayoutsPage() {
	const payoutActions = usePayoutActions();
	const [selectedPayoutIds, setSelectedPayoutIds] = useState<string[]>([]);
	const [expandedVendors, setExpandedVendors] = useState<string[]>([]);

	const {
		data: pendingVendors,
		isLoading,
		refetch,
	} = payoutActions.useGetPendingPayouts();

	const initiateTransfers = payoutActions.initiateVendorTransfers({
		onSuccess: (data: any) => {
			setSelectedPayoutIds([]);
			refetch();
		},
	});

	const toggleVendorExpansion = (vendorId: string) => {
		setExpandedVendors((prev) =>
			prev.includes(vendorId)
				? prev.filter((id) => id !== vendorId)
				: [...prev, vendorId],
		);
	};

	const togglePayoutSelection = (payoutId: string) => {
		setSelectedPayoutIds((prev) =>
			prev.includes(payoutId)
				? prev.filter((id) => id !== payoutId)
				: [...prev, payoutId],
		);
	};

	const toggleVendorSelection = (vendorId: string, payoutIds: string[]) => {
		const allSelected = payoutIds.every((id) =>
			selectedPayoutIds.includes(id),
		);
		if (allSelected) {
			setSelectedPayoutIds((prev) =>
				prev.filter((id) => !payoutIds.includes(id)),
			);
		} else {
			setSelectedPayoutIds((prev) => [
				...new Set([...prev, ...payoutIds]),
			]);
		}
	};

	const handleInitiatePayouts = () => {
		if (selectedPayoutIds.length === 0) {
			toast.error('Please select at least one payout');
			return;
		}

		if (
			confirm(
				`Are you sure you want to initiate ${selectedPayoutIds.length} transfers?`,
			)
		) {
			initiateTransfers.mutate({ payoutIds: selectedPayoutIds });
		}
	};

	if (isLoading) {
		return (
			<div className='p-10 flex justify-center'>
				<Loader2 className='animate-spin' />
			</div>
		);
	}

	const totalPending =
		pendingVendors?.reduce((sum, v) => sum + v.totalAmount, 0) || 0;

	return (
		<SectionWrapper className='space-y-6'>
			<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-xl border'>
				<div>
					<h2 className='text-sm font-medium text-muted-foreground uppercase tracking-wider'>
						Total Pending Payouts
					</h2>
					<p className='text-3xl font-bold'>
						{formatCurency(totalPending)}
					</p>
				</div>
				<Button
					size='lg'
					className='w-full sm:w-auto font-bold'
					onClick={handleInitiatePayouts}
					disabled={
						selectedPayoutIds.length === 0 ||
						initiateTransfers.isPending
					}>
					{initiateTransfers.isPending ? (
						<Loader2 className='animate-spin mr-2' size={18} />
					) : (
						<Landmark className='mr-2' size={18} />
					)}
					Pay Selected ({selectedPayoutIds.length})
				</Button>
			</div>

			<div className='space-y-4'>
				{pendingVendors?.length === 0 ? (
					<div className='text-center py-20 border rounded-xl border-dashed'>
						<p className='text-muted-foreground'>
							No pending payouts at the moment.
						</p>
					</div>
				) : (
					pendingVendors?.map((v) => {
						const vendorPayoutIds = v.payouts.map((p: any) => p.id);
						const isAllSelected = vendorPayoutIds.every(
							(id: string) => selectedPayoutIds.includes(id),
						);
						const isExpanded = expandedVendors.includes(
							v.vendor.id,
						);

						return (
							<div
								key={v.vendor.id}
								className='border rounded-xl overflow-hidden bg-background'>
								<div className='p-4 flex items-center justify-between hover:bg-muted/10 transition-colors'>
									<div className='flex items-center gap-3'>
										<Checkbox
											checked={isAllSelected}
											onCheckedChange={() =>
												toggleVendorSelection(
													v.vendor.id,
													vendorPayoutIds,
												)
											}
										/>
										<div
											onClick={() =>
												toggleVendorExpansion(
													v.vendor.id,
												)
											}
											className='cursor-pointer'>
											<h3 className='font-bold text-lg'>
												{v.vendor.name}
											</h3>
											<p className='text-xs text-muted-foreground'>
												{v.vendor.bankName ||
													'No bank name'}{' '}
												•{' '}
												{v.vendor.bankAccountNumber ||
													'No account'}
											</p>
										</div>
									</div>
									<div className='flex items-center gap-4'>
										<div className='text-right'>
											<p className='font-bold'>
												{formatCurency(v.totalAmount)}
											</p>
											<p className='text-xs text-muted-foreground'>
												{v.payouts.length} orders
											</p>
										</div>
										<Button
											variant='ghost'
											size='icon'
											onClick={() =>
												toggleVendorExpansion(
													v.vendor.id,
												)
											}>
											{isExpanded ? (
												<ChevronUp size={20} />
											) : (
												<ChevronDown size={20} />
											)}
										</Button>
									</div>
								</div>

								{isExpanded && (
									<div className='border-t bg-muted/5 divide-y'>
										{v.payouts.map((p: any) => (
											<div
												key={p.id}
												className='p-4 pl-12 flex items-center justify-between whitespace-nowrap overflow-x-auto gap-4'>
												<div className='flex items-center gap-3 min-w-[300px]'>
													<Checkbox
														checked={selectedPayoutIds.includes(
															p.id,
														)}
														onCheckedChange={() =>
															togglePayoutSelection(
																p.id,
															)
														}
													/>
													<div>
														<p className='text-sm font-medium'>
															Order #
															{p.order.id.substring(
																0,
																8,
															)}
														</p>
														<p className='text-xs text-muted-foreground'>
															{new Date(
																p.order
																	.createdAt,
															).toLocaleDateString()}{' '}
															•{' '}
															{new Date(
																p.order
																	.createdAt,
															).toLocaleTimeString()}
														</p>
														<p className='text-xs font-medium text-foreground/80 mt-1'>
															{p.order.user
																?.name ||
																'Unknown Customer'}
														</p>
													</div>
												</div>
												<div className='text-right'>
													<p className='text-sm font-bold'>
														{formatCurency(
															p.amount,
														)}
													</p>
													<p className='text-[10px] text-muted-foreground'>
														Accumulated Items
													</p>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						);
					})
				)}
			</div>
		</SectionWrapper>
	);
}
