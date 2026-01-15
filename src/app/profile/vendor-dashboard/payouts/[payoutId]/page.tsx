'use client';

import { use } from 'react';
import GoBackButton from '@/components/GoBackButton';
import { Separator } from '@/components/ui/separator';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { formatCurency, formatDate } from '@/lib/commonFunctions';
import { usePayoutActions } from '@/api-hooks/usePayoutActions';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
	params: Promise<{ payoutId: string }>;
}

export default function SinglePayoutPage({ params }: Props) {
	const { payoutId } = use(params);
	const payoutActions = usePayoutActions();
	const { data: payout, isLoading } = payoutActions.useGetPayoutDetails({
		payoutId,
	});

	if (isLoading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<Loader2 className='animate-spin text-primary' size={40} />
			</div>
		);
	}

	if (!payout) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				Payout not found
			</div>
		);
	}

	return (
		<PageWrapper
			className={
				'max-w-none w-full bg-secondary p-0 flex justify-center items-center'
			}>
			<div className='w-full max-w-[1400px] flex flex-col'>
				<div className='flex-1 w-full flex md:h-[200px] items-center justify-center p-10 bg-primary/90'>
					<div className='flex items-center gap-10 w-full px-5 text-white'>
						<GoBackButton className='text-primary! bg-white!' />
						<h1 className='font-bold text-2xl'>Payout Details</h1>
					</div>
				</div>
				<div className='flex-2 w-full min-h-[90vh] md:min-h-[calc(100vh-200px)] flex justify-center bg-background rounded-t-4xl p-5 -mt-10 overflow-hidden'>
					<div className='w-full max-w-lg space-y-6 pt-5'>
						<div className='w-full p-8 flex flex-col text-center items-center rounded-3xl bg-card border shadow-xl relative overflow-hidden'>
							<div className='absolute top-0 right-0 p-4'>
								{payout.status === 'SUCCESS' && (
									<CheckCircle2
										className='text-green-500'
										size={32}
									/>
								)}
							</div>
							<p className='text-sm font-medium text-muted-foreground uppercase tracking-widest'>
								Payout Reference
							</p>
							<p className='text-lg font-bold mt-1'>
								#{payout.id.substring(0, 12)}
							</p>
							<p className='font-black text-5xl mt-6 tracking-tighter'>
								{formatCurency(payout.amount)}
							</p>
							<p
								className={`mt-2 font-bold uppercase text-xs tracking-widest ${
									payout.status === 'SUCCESS'
										? 'text-green-600'
										: 'text-amber-600'
								}`}>
								{payout.status}
							</p>

							<div className='w-full py-6 border-t mt-8 space-y-4'>
								<div className='w-full flex justify-between items-center'>
									<p className='text-muted-foreground text-sm font-medium'>
										Payment Date
									</p>
									<p className='font-bold'>
										{formatDate(
											payout.initiatedAt.toString()
										)}
									</p>
								</div>
								<div className='w-full flex justify-between items-center'>
									<p className='text-muted-foreground text-sm font-medium'>
										Transfer Code
									</p>
									<p className='font-mono text-xs'>
										{payout.transferCode || 'N/A'}
									</p>
								</div>
							</div>
						</div>

						<div className='w-full p-6 flex flex-col rounded-3xl bg-card border shadow-sm'>
							<h2 className='mb-4 text-lg font-bold flex items-center gap-2'>
								<span className='w-1.5 h-6 bg-primary rounded-full'></span>
								Related Order
							</h2>
							<div className='w-full flex py-4 justify-between items-center gap-4'>
								<div className='flex-1'>
									<p className='text-sm text-muted-foreground font-medium'>
										Order ID:{' '}
										<span className='text-foreground font-bold'>
											#{payout.order.id.substring(0, 8)}
										</span>
									</p>
									<p className='text-xs text-muted-foreground mt-1'>
										{formatDate(
											payout.order.createdAt.toString()
										)}
									</p>
								</div>

								<p className='text-primary font-bold text-lg'>
									{formatCurency(payout.order.productAmount)}
								</p>
							</div>
							<Separator className='opacity-50' />
							<div className='mt-4 p-4 bg-muted/50 rounded-xl space-y-2'>
								{payout.order.items.map(
									(item: any, idx: number) => (
										<div
											key={idx}
											className='flex justify-between text-xs'>
											<span className='text-muted-foreground'>
												{item.quantity}x{' '}
												{item.productItem.name}
											</span>
											<span className='font-medium'>
												{formatCurency(
													item.price * item.quantity
												)}
											</span>
										</div>
									)
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</PageWrapper>
	);
}
