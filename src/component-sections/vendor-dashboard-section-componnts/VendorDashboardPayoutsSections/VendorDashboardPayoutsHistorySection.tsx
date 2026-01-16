'use client';

import SectionWrapper from '@/components/wrapers/SectionWrapper';
import Image from 'next/image';
import PayoutListItem from './PayoutListItem';
import { usePayoutActions } from '@/api-hooks/usePayoutActions';
import { Loader2 } from 'lucide-react';

const VendorDashboardPayoutsHistorySection = () => {
	const payoutActions = usePayoutActions();
	const { data: payouts, isLoading } = payoutActions.useGetMyPayoutHistory();

	const isEmpty = !payouts || payouts.length === 0;

	return (
		<SectionWrapper className='max-w-lg w-full p-5 mx-auto'>
			<div className='w-full '>
				<div className='w-full'>
					{isLoading && (
						<div className='p-10 flex justify-center'>
							<Loader2 className='animate-spin text-primary' />
						</div>
					)}

					{!isLoading && isEmpty && (
						<div className='p-10 w-full flex flex-col items-center justify-center text-center'>
							<Image
								src={'/assets/cash-bag.png'}
								width={250}
								height={250}
								alt='No earnings'
								className='opacity-30 grayscale'
							/>
							<p className='font-bold text-xl mt-6'>
								No earnings history yet
							</p>
							<p className='text-muted-foreground mt-2'>
								Complete orders and they will be listed here
								after being delivered.
							</p>
						</div>
					)}
					{!isLoading && !isEmpty && (
						<div className='w-full flex flex-col p-4 border rounded-2xl bg-card shadow-sm'>
							{payouts.map((p) => (
								<PayoutListItem key={p.id} payout={p} />
							))}
						</div>
					)}
				</div>
			</div>
		</SectionWrapper>
	);
};

export default VendorDashboardPayoutsHistorySection;
