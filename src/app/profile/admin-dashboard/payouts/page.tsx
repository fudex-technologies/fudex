'use client';

import { usePayoutActions } from '@/api-hooks/usePayoutActions';
import { useState } from 'react';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { formatCurency } from '@/lib/commonFunctions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
	Landmark,
	Loader2,
	ChevronDown,
	ChevronUp,
	History,
	CreditCard,
	AlertCircle,
} from 'lucide-react';
import ConfirmationAlertDialogue from '@/components/ConfirmationAlertDialogue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/modules/admin/components/dashboard/StatCard';
import PayoutHistory from './PayoutHistory';
import { Vendor } from '@prisma/client';

export default function AdminPayoutsPage() {
	const payoutActions = usePayoutActions();
	const [selectedPayoutIds, setSelectedPayoutIds] = useState<string[]>([]);
	const [expandedVendors, setExpandedVendors] = useState<string[]>([]);
	const [activeTab, setActiveTab] = useState('pending');

	// Confirmation Dialog State
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [confirmationConfig, setConfirmationConfig] = useState<{
		title: string;
		subtitle: string;
		action: () => void;
		actionLabel?: string;
		variant?: string;
	}>({
		title: '',
		subtitle: '',
		action: () => {},
	});

	const {
		data: pendingVendors,
		isLoading,
		refetch,
	} = payoutActions.useGetPendingPayouts();

	const { data: stats, isLoading: statsLoading } =
		payoutActions.useGetPayoutStats();

	const initiateTransfers = payoutActions.initiateVendorTransfers({
		onSuccess: (data: any) => {
			setSelectedPayoutIds([]);
			refetch();
		},
	});

	const markPaidManually = payoutActions.markPayoutAsPaidManually({
		onSuccess: () => {
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

		setConfirmationConfig({
			title: 'Initiate Transfers',
			subtitle: `Are you sure you want to initiate transfers for ${selectedPayoutIds.length} selected payouts?`,
			action: () =>
				initiateTransfers.mutate({ payoutIds: selectedPayoutIds }),
			actionLabel: 'Pay Now',
		});
		setConfirmationOpen(true);
	};

	const handleMarkPaidManually = (payoutId: string) => {
		setConfirmationConfig({
			title: 'Mark as Paid Manually',
			subtitle:
				'Are you sure you want to mark this payout as paid manually? This will skip the Paystack transfer and cannot be undone.',
			action: () => markPaidManually.mutate({ payoutId }),
			actionLabel: 'Mark Paid',
			variant: 'default', // or whatever variant fits
		});
		setConfirmationOpen(true);
	};

	if (isLoading) {
		return (
			<div className='p-10 flex justify-center'>
				<Loader2 className='animate-spin' />
			</div>
		);
	}

	return (
		<SectionWrapper className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Payouts Management</h1>
					<p className='text-muted-foreground'>
						Manage vendor payouts and view transaction history
					</p>
				</div>
			</div>

			{/* Stats Grid */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6'>
				<StatCard
					title='Pending Amount'
					value={formatCurency(stats?.pendingAmount || 0)}
					icon={Landmark}
					description={`${stats?.pendingCount || 0} pending payouts`}
				/>
				<StatCard
					title='Total Paid'
					value={formatCurency(stats?.paidAmount || 0)}
					icon={CreditCard}
					description={`${stats?.paidCount || 0} completed payouts`}
				/>
				<StatCard
					title='Failed Transfers'
					value={stats?.failedCount || 0}
					icon={AlertCircle}
					description='Require attention'
					className='border-red-200'
				/>
				<StatCard
					title='Total Volume'
					value={formatCurency(
						(stats?.paidAmount || 0) + (stats?.pendingAmount || 0),
					)}
					icon={History}
					description='All time volume'
				/>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className='space-y-4'>
				<TabsList>
					<TabsTrigger value='pending'>Pending Actions</TabsTrigger>
					<TabsTrigger value='history'>History & Logs</TabsTrigger>
				</TabsList>

				<TabsContent value='pending' className='space-y-4'>
					<div className='flex gap-3 flex-wrap items-center justify-between'>
						<h2 className='text-lg font-semibold'>
							Pending Vendor Payouts
						</h2>
						{selectedPayoutIds.length > 0 && (
							<Button
								onClick={handleInitiatePayouts}
								disabled={initiateTransfers.isPending}>
								{initiateTransfers.isPending ? (
									<Loader2
										className='animate-spin mr-2'
										size={18}
									/>
								) : (
									<Landmark className='mr-2' size={18} />
								)}
								Initiate {selectedPayoutIds.length} Payouts
							</Button>
						)}
					</div>

					{pendingVendors?.length === 0 ? (
						<div className='flex flex-col items-center justify-center p-10 border rounded-lg bg-card'>
							<Landmark className='h-12 w-12 text-muted-foreground mb-4 opacity-50' />
							<p className='text-lg font-medium text-muted-foreground'>
								No pending payouts
							</p>
							<p className='text-sm text-muted-foreground'>
								All vendors are settled up!
							</p>
						</div>
					) : (
						<div className='space-y-4'>
							{pendingVendors?.map((vendor: any) => {
								const isExpanded = expandedVendors.includes(
									vendor.vendorId,
								);
								const vendorPayoutIds = vendor.payouts.map(
									(p: any) => p.id,
								);
								const allSelected = vendorPayoutIds.every(
									(id: string) =>
										selectedPayoutIds.includes(id),
								);
								const someSelected = vendorPayoutIds.some(
									(id: string) =>
										selectedPayoutIds.includes(id),
								);

								return (
									<div
										key={vendor.vendorId}
										className='border rounded-lg bg-card overflow-hidden'>
										<div
											className='p-4 flex items-center gap-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors'
											onClick={() =>
												toggleVendorExpansion(
													vendor.vendorId,
												)
											}>
											<Checkbox
												checked={
													allSelected ||
													(someSelected &&
														'indeterminate')
												}
												onCheckedChange={() =>
													toggleVendorSelection(
														vendor.vendorId,
														vendorPayoutIds,
													)
												}
												onClick={(e) =>
													e.stopPropagation()
												}
											/>
											<div className='flex-1'>
												<div className='flex items-center gap-2'>
													<h3 className='font-semibold text-lg'>
														{vendor.vendorName}
													</h3>
													<span className='text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary'>
														{vendor.payouts.length}{' '}
														pending
													</span>
												</div>
												<p className='text-sm text-muted-foreground'>
													Total Pending:{' '}
													<span className='font-bold text-foreground'>
														{formatCurency(
															vendor.totalAmount,
														)}
													</span>
												</p>
											</div>
											{isExpanded ? (
												<ChevronUp size={20} />
											) : (
												<ChevronDown size={20} />
											)}
										</div>

										{isExpanded && (
											<div className='border-t divide-y'>
												{vendor.payouts.map(
													(p: any) => (
														<div
															key={p.id}
															className='p-4 pl-12 flex items-center justify-between hover:bg-muted/10'>
															<div className='flex items-center gap-4'>
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
																	<p className='font-medium'>
																		Order #
																		{p.orderId.slice(
																			0,
																			8,
																		)}
																	</p>
																	<p className='text-xs text-muted-foreground'>
																		{new Date(
																			p.initiatedAt,
																		).toLocaleDateString()}
																	</p>
																</div>
															</div>
															<div className='flex items-center gap-4'>
																<div className='text-right'>
																	<p className='text-sm font-bold'>
																		{formatCurency(
																			p.amount,
																		)}
																	</p>
																	<p className='text-[10px] text-muted-foreground uppercase'>
																		{
																			p.status
																		}
																	</p>
																</div>
																<Button
																	variant='outline'
																	size='sm'
																	className='h-8 text-[10px]'
																	onClick={() =>
																		handleMarkPaidManually(
																			p.id,
																		)
																	}
																	disabled={
																		markPaidManually.isPending
																	}>
																	{markPaidManually.isPending ? (
																		<Loader2
																			className='animate-spin'
																			size={
																				12
																			}
																		/>
																	) : (
																		'Mark Paid'
																	)}
																</Button>
															</div>
														</div>
													),
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</TabsContent>

				<TabsContent value='history'>
					<div className='bg-card rounded-lg p-1'>
						<PayoutHistory />
					</div>
				</TabsContent>
			</Tabs>

			<ConfirmationAlertDialogue
				open={confirmationOpen}
				setOpen={setConfirmationOpen}
				title={confirmationConfig.title}
				subtitle={confirmationConfig.subtitle}
				action={confirmationConfig.action}
				buttonActionLabel={confirmationConfig.actionLabel}
				buttonVariant={confirmationConfig.variant}
			/>
		</SectionWrapper>
	);
}
