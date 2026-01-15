'use client';

import SectionWrapper from '@/components/wrapers/SectionWrapper';
import Image from 'next/image';
import PayoutListItem from './PayoutListItem';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import { usePayoutActions } from '@/api-hooks/usePayoutActions';
import { Loader2 } from 'lucide-react';

const VendorDashboardRecentPayoutsSection = () => {
	const payoutActions = usePayoutActions();
	const { data: payouts, isLoading } = payoutActions.useGetMyPayoutHistory();

	const recentPayouts = payouts?.slice(0, 5) || [];
	const isEmpty = recentPayouts.length === 0;

	return (
		<SectionWrapper className='max-w-lg w-full p-5 sm:p-0 flex mx-auto'>
			<div className='w-full p-6 shadow-sm rounded-2xl border bg-card'>
				<h2 className='text-lg font-bold'>Recent Payouts</h2>
				<div className='w-full mt-4'>
					{isLoading && (
						<div className='p-10 flex justify-center'>
							<Loader2 className='animate-spin text-primary' />
						</div>
					)}

					{!isLoading && isEmpty && (
						<div className='p-5 w-full flex flex-col items-center justify-center text-center'>
							<Image
								src={'/assets/cash-bag.png'}
								width={180}
								height={180}
								alt='No payouts'
								className=''
							/>
							<p className='font-bold mt-4'>No payouts yet</p>
							<p className='text-sm text-muted-foreground'>
								Your earnings will appear here once orders are
								delivered and paid.
							</p>
						</div>
					)}
					{!isLoading && !isEmpty && (
						<div className='w-full flex flex-col'>
							{recentPayouts.map((p) => (
								<PayoutListItem key={p.id} payout={p} />
							))}
						</div>
					)}
				</div>

				{!isEmpty && (
					<Link
						href={PAGES_DATA.vendor_dashboard_payouts_history_page}
						className={cn(
							buttonVariants({ variant: 'outline' }),
							'w-full py-6 mt-4 font-bold rounded-xl'
						)}>
						View All Payouts
					</Link>
				)}
			</div>
		</SectionWrapper>
	);
};

export default VendorDashboardRecentPayoutsSection;
