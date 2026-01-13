import GoBackButton from '@/components/GoBackButton';
import { Separator } from '@/components/ui/separator';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { formatCurency } from '@/lib/commonFunctions';

interface Props {
	params: Promise<{ payoutId: string }>;
}

export default async function SinglePayoutPage({ params }: Props) {
	const { payoutId } = await params;
	return (
		<PageWrapper
			className={
				'max-w-none w-full bg-secondary p-0 flex justify-center items-center'
			}>
			<div className='w-full max-w-[1400px] flex flex-col'>
				<div className='flex-1 w-full flex md:h-screen items-center justify-center p-10 md:sticky top-0 '>
					<div className='flex items-center gap-10 w-full px-5 text-white'>
						<GoBackButton className='text-black! bg-white!' />
						<h1 className='font-semibold text-xl'>
							Payout Details
						</h1>
					</div>
				</div>
				<div className='flex-2 w-full min-h-[90vh] md:min-h-screen flex justify-center  bg-background rounded-t-4xl p-5  '>
					<div className='w-full max-w-lg space-y-5'>
						<div className='w-full p-5 flex flex-col text-center items-center rounded-xl shadow-sm'>
							<p className='text-lg'>Payout #123444</p>
							<p className='font-semibold text-3xl'>
								{formatCurency(34000)}
							</p>
							<p className='text-primary text-sm'>Paid</p>
							<div className='w-full py-3 border-t'>
								<div className='w-full flex justify-between'>
									<p className='text-foreground/50 '>
										Payment Date
									</p>
									<p className=''>Jan 20, 2026</p>
								</div>
								<div className='w-full flex justify-between'>
									<p className='text-foreground/50'>
										Total Orders
									</p>
									<p className=''>10</p>
								</div>
							</div>
						</div>

						<div className='w-full p-5 flex flex-col rounded-xl shadow-sm'>
							<h2 className='mb-3 text-lg'>Order Breeakdown</h2>
							<div className='w-full flex py-3 justify-between items-center gap-3'>
								<div className=''>
									<p className='text-foreground/50'>
										Order ID:{' '}
										<span className='text-foreground'>
											#FDX-238491
										</span>
									</p>
									<p className='text-foreground/50 text-sm'>
										Completed - Jan 20, 12:03 PM
									</p>
								</div>

								<p className='text-primary'>
									{formatCurency(34000)}
								</p>
							</div>
							<Separator />
						</div>
					</div>
				</div>
			</div>
		</PageWrapper>
	);
}
