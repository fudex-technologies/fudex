import SectionWrapper from '@/components/wrapers/SectionWrapper';
import Image from 'next/image';
import PayoutListItem from './PayoutListItem';
import { Separator } from '@/components/ui/separator';
import {  buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';

const VendorDashboardRecentPayoutsSection = () => {
	const isEmpty = false;
	return (
		<SectionWrapper className='max-w-lg w-full p-5 sm:p-0 flex mx-auto'>
			<div className='w-full p-5 shadow-sm rounded-lg border'>
				<h2 className='text-lg font-semibold'>Earnings History</h2>
				<div className='w-full'>
					{isEmpty && (
						<div className='p-5 w-full flex flex-col items-center justify-center text-center'>
							<Image
								src={'/assets/cash-bag.png'}
								width={250}
								height={250}
								alt='Cash back'
							/>
							<p className='font-bold'>No earnings yet</p>
							<p className=''>
								Your earnings will appear here once orders are
								completed
							</p>
						</div>
					)}
					{!isEmpty && (
						<div className='w-full flex flex-col'>
							<PayoutListItem />
							<Separator />
							<PayoutListItem />
							<Separator />
							<PayoutListItem />
							<Separator />
							<PayoutListItem />
							<Separator />
							<PayoutListItem />
						</div>
					)}
				</div>

				<Link
					href={PAGES_DATA.vendor_dashboard_payouts_history_page}
					className={cn(
						buttonVariants({ variant: 'game' }),
						'w-full py-6 mt-2'
					)}>
					View More
				</Link>
			</div>
		</SectionWrapper>
	);
};

export default VendorDashboardRecentPayoutsSection;
