import { PAGES_DATA } from '@/data/pagesData';
import { formatCurency, formatDate } from '@/lib/commonFunctions';
import { Wallet2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PayoutListItemProps {
	payout: {
		id: string;
		amount: number;
		status: string;
		initiatedAt: string | Date;
		completedAt?: string | Date | null;
	};
}

const PayoutListItem = ({ payout }: PayoutListItemProps) => {
	const statusColors = {
		PENDING: 'bg-amber-100 text-amber-700',
		SUCCESS: 'bg-green-100 text-green-700',
		FAILED: 'bg-red-100 text-red-700',
	};

	const statusIcons = {
		PENDING: <Clock size={16} />,
		SUCCESS: <CheckCircle2 size={16} />,
		FAILED: <AlertCircle size={16} />,
	};

	return (
		<Link
			href={PAGES_DATA.vendor_dashboard_single_payout_page(payout.id)}
			className='w-full py-4 flex items-center justify-between gap-3 border-b last:border-0 hover:bg-muted/5 transition-colors'>
			<div className='flex gap-3 items-center'>
				<div
					className={`p-2.5 flex items-center justify-center rounded-full ${
						payout.status === 'SUCCESS'
							? 'bg-primary/10 text-primary'
							: 'bg-muted text-muted-foreground'
					}`}>
					<Wallet2 size={20} />
				</div>
				<div>
					<p className='font-medium'>
						Payout #{payout.id.substring(0, 8)}
					</p>
					<p className='text-xs text-muted-foreground'>
						{formatDate(payout.initiatedAt.toString())}
					</p>
				</div>
			</div>

			<div className='text-right'>
				<p className='font-bold text-lg leading-tight'>
					{formatCurency(payout.amount)}
				</p>
				<span
					className={`inline-flex items-center gap-1 mt-1 py-0.5 px-2 rounded-full text-[10px] font-bold uppercase tracking-wider ${
						statusColors[
							payout.status as keyof typeof statusColors
						] || 'bg-muted text-muted-foreground'
					}`}>
					{statusIcons[payout.status as keyof typeof statusIcons] ||
						null}
					{payout.status}
				</span>
			</div>
		</Link>
	);
};

export default PayoutListItem;
