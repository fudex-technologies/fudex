import { formatCurency, formatDate } from '@/lib/commonFunctions';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { BsBicycle } from 'react-icons/bs';

interface DeliverySettlementOrderItemProps {
	order: {
		id: string;
		totalFee: number;
		status: string;
		settlementStatus: string;
		createdAt: string | Date;
	};
}

const DeliverySettlementOrderItem = ({
	order,
}: DeliverySettlementOrderItemProps) => {
	const statusColors = {
		UNSETTLED: 'bg-amber-100 text-amber-700',
		PENDING_VERIFICATION: 'bg-blue-100 text-blue-700',
		SETTLED: 'bg-green-100 text-green-700',
	};

	const statusIcons = {
		UNSETTLED: <Clock size={16} />,
		PENDING_VERIFICATION: <AlertCircle size={16} />,
		SETTLED: <CheckCircle2 size={16} />,
	};

	return (
		<div className='w-full py-4 flex items-center justify-between gap-3 border-b last:border-0 hover:bg-muted/5 transition-colors'>
			<div className='flex gap-3 items-center'>
				<div
					className={`p-2.5 flex items-center justify-center rounded-full ${
						order.settlementStatus === 'SETTLED'
							? 'bg-primary/10 text-primary'
							: 'bg-muted text-muted-foreground'
					}`}>
					<BsBicycle size={20} />
				</div>
				<div>
					<p className='font-medium'>
						Request #{order.id.substring(0, 8)}
					</p>
					<p className='text-xs text-muted-foreground'>
						{formatDate(order.createdAt.toString())} •{' '}
						{order.status}
					</p>
				</div>
			</div>

			<div className='text-right'>
				<p className='font-bold text-lg leading-tight'>
					{formatCurency(order.totalFee)}
				</p>
				<span
					className={`inline-flex items-center gap-1 mt-1 py-0.5 px-2 rounded-full text-[10px] font-bold uppercase tracking-wider ${
						statusColors[
							order.settlementStatus as keyof typeof statusColors
						] || 'bg-muted text-muted-foreground'
					}`}>
					{statusIcons[
						order.settlementStatus as keyof typeof statusIcons
					] || null}
					{order.settlementStatus.replace('_', ' ')}
				</span>
			</div>
		</div>
	);
};

export default DeliverySettlementOrderItem;
