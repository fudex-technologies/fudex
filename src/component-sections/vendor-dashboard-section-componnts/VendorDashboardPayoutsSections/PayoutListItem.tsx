import { PAGES_DATA } from '@/data/pagesData';
import { formatCurency } from '@/lib/commonFunctions';
import { Wallet2 } from 'lucide-react';
import Link from 'next/link';

const PayoutListItem = () => {
	return (
		<Link
			href={PAGES_DATA.vendor_dashboard_single_payout_page('1')}
			className='w-full py-3 flex items-center justify-between gap-2'>
			<div className='flex gap-2 items-center'>
				<div className='p-3 flex items-center justify-center rounded-full bg-primary/10 text-primary'>
					<Wallet2 />
				</div>
				<div className='space-y-2'>
					<p>Payout #123444</p>
					<p className='text-sm text-foreground/50'>
						Wednesday, Jan 20, 2026
					</p>
				</div>
			</div>

			<div className='text-primary/60 space-y-2'>
				<p>{formatCurency(34000.0)}</p>
				<span className='py-1 px-2 bg-primary/10 rounded-md text-sm'>
					Paid
				</span>
			</div>
		</Link>
	);
};

export default PayoutListItem;
