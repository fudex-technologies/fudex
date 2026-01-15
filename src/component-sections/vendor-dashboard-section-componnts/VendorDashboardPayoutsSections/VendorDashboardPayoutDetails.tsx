'use client';

import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { formatCurency } from '@/lib/commonFunctions';
import { usePayoutActions } from '@/api-hooks/usePayoutActions';
import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { Loader2, Landmark } from 'lucide-react';

const VendorDashboardPayoutDetails = () => {
	const payoutActions = usePayoutActions();
	const vendorActions = useVendorDashboardActions();
	const { data: summary, isLoading: isSummaryLoading } =
		payoutActions.useGetMyEarningsSummary();
	const { data: vendor, isLoading: isVendorLoading } =
		vendorActions.useGetMyVendor();

	if (isSummaryLoading || isVendorLoading) {
		return (
			<div className='p-10 flex justify-center'>
				<Loader2 className='animate-spin text-primary' />
			</div>
		);
	}

	return (
		<SectionWrapper className='w-full flex justify-center'>
			<div className='w-full max-w-lg flex flex-col items-center gap-3'>
				<div className='w-full p-6 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20'>
					<p className='text-sm font-medium opacity-80 uppercase tracking-wider'>
						Pending Payout
					</p>
					<p className='text-4xl font-black mt-1'>
						{formatCurency(summary?.pending || 0)}
					</p>
					<p className='text-xs mt-4 opacity-90'>
						Total earnings settled so far:{' '}
						<span className='font-bold'>
							{formatCurency(summary?.paid || 0)}
						</span>
					</p>
				</div>

				<div className='w-full rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden'>
					<div className='bg-muted/50 p-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
						<Landmark size={14} />
						Payout Bank Account
					</div>
					<div className='p-6 text-center space-y-3'>
						<p className='font-black text-2xl tracking-tighter'>
							{vendor?.bankAccountNumber || 'N/A'}
						</p>
						<div className='space-y-1'>
							<p className='text-sm font-bold text-muted-foreground'>
								{vendor?.bankName || 'Unknown Bank'}
							</p>
							<p className='text-xs font-medium opacity-70 uppercase'>
								{vendor?.name || 'Vendor Name'}
							</p>
						</div>
					</div>
					<div className='bg-muted/30 p-3 text-[10px] font-medium text-muted-foreground text-center italic border-t border-dashed'>
						Earnings are automatically calculated after each
						successful delivery
					</div>
				</div>
			</div>
		</SectionWrapper>
	);
};

export default VendorDashboardPayoutDetails;
