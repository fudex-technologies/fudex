"use client"

import { Button } from '@/components/ui/button';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import DeliverySettlementOrderItem from './DeliverySettlementOrderItem';
import { useRiderRequestActions } from '@/api-hooks/useRiderRequestActions';

const VendorDashboardDeliverySettlementOrderHistorySection = () => {
	const { useListMyRiderRequests, notifySettlementPayment } =
		useRiderRequestActions();
	const { data: pendingRiderRequests, isLoading } = useListMyRiderRequests({
		settlementStatus: ['UNSETTLED', 'PENDING_VERIFICATION'],
	});

	const { mutate: notifyPayment, isPending: notifying } =
		notifySettlementPayment();

	const unsettledRequests =
		pendingRiderRequests?.filter(
			(r) => r.settlementStatus === 'UNSETTLED',
		) || [];
	const isEmpty = !pendingRiderRequests || pendingRiderRequests.length === 0;

	return (
		<SectionWrapper className='max-w-lg w-full p-5 sm:p-0 flex mx-auto'>
			<div className='w-full p-6 shadow-sm rounded-2xl border bg-card'>
				<h2 className='text-lg font-bold'>Pending Orders Breakdown</h2>
				<div className='w-full mt-4'>
					{isLoading && (
						<div className='p-10 flex justify-center'>
							<Loader2 className='animate-spin text-primary' />
						</div>
					)}

					{!isLoading && isEmpty && (
						<div className='p-5 w-full flex flex-col items-center justify-center text-center'>
							<Image
								src={'/assets/riderillustration.png'}
								width={200}
								height={200}
								alt='No payouts'
								className=''
							/>
							<p className='font-bold mt-4'>
								No pending settlements
							</p>
							<p className='text-sm text-muted-foreground'>
								Your settlement details will appear here once
								your delivery bike starts completing orders.
							</p>
						</div>
					)}
					{!isLoading && !isEmpty && (
						<div className='w-full flex flex-col gap-3'>
							{pendingRiderRequests?.map((p) => (
								<DeliverySettlementOrderItem
									key={p.id}
									order={p}
								/>
							))}
						</div>
					)}
				</div>

				{unsettledRequests.length > 0 && (
					<Button
						disabled={notifying}
						onClick={() =>
							notifyPayment({
								requestIds: unsettledRequests.map((r) => r.id),
							})
						}
						className={cn('w-full py-6 mt-4 font-bold rounded-xl')}>
						{notifying ? (
							<Loader2 className='animate-spin' />
						) : (
							'I’ve Made the Payment'
						)}
					</Button>
				)}
			</div>
		</SectionWrapper>
	);
};

export default VendorDashboardDeliverySettlementOrderHistorySection;
