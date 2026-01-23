'use client';

import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { formatCurency } from '@/lib/commonFunctions';
import { Landmark, Loader2 } from 'lucide-react';
import { useRiderRequestActions } from '@/api-hooks/useRiderRequestActions';
import {
	FUDEX_SETTLEMENT_ACCOUNT_NAME,
	FUDEX_SETTLEMENT_ACCOUNT_NUMBER,
	FUDEX_SETTLEMENT_BANK_NAME,
} from '@/lib/staticData/contactData';
import CopyDataComponent from '@/components/CopyDataComponent';

const VendorDashboardDeliverySetlementDetailsSection = () => {
	const { useListMyRiderRequests } = useRiderRequestActions();
	const { data: pendingRiderRequests, isLoading } = useListMyRiderRequests({
		settlementStatus: ['UNSETTLED']
	});

	const totalPending =
		pendingRiderRequests?.reduce((sum, r) => sum + r.totalFee, 0) || 0;

	return (
		<SectionWrapper className='w-full flex justify-center'>
			<div className='w-full max-w-lg flex flex-col items-center gap-3'>
				<div className='w-full p-6 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20'>
					<p className='text-sm font-medium opacity-80 uppercase tracking-wider'>
						Pending Settlements
					</p>
					<p className='text-4xl font-black mt-1'>
						{isLoading ? (
							<Loader2 className='animate-spin' />
						) : (
							formatCurency(totalPending)
						)}
					</p>
					<p className='text-xs mt-4 opacity-90'>
						Total amount to be paid for completed orders today
					</p>
				</div>

				<div className='w-full rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden'>
					<div className='bg-muted/50 p-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
						<Landmark size={14} />
						Payment Account
					</div>
					<div className='p-6 text-center space-y-3'>
						<p className='font-black text-2xl tracking-tighter flex items-center justify-center gap-2'>
							{FUDEX_SETTLEMENT_ACCOUNT_NUMBER}{' '}
							<CopyDataComponent
								data={FUDEX_SETTLEMENT_ACCOUNT_NUMBER}
							/>
						</p>
						<div className='space-y-1'>
							<p className='text-sm font-bold text-muted-foreground'>
								{FUDEX_SETTLEMENT_BANK_NAME}
							</p>
							<p className='text-xs font-medium opacity-70 uppercase'>
								{FUDEX_SETTLEMENT_ACCOUNT_NAME}
							</p>
						</div>
					</div>
					<div className='bg-muted/30 p-3 text-[10px] font-medium text-muted-foreground text-center italic border-t border-dashed'>
						Make payment to this account before the end of the day.
					</div>
				</div>
			</div>
		</SectionWrapper>
	);
};

export default VendorDashboardDeliverySetlementDetailsSection;
