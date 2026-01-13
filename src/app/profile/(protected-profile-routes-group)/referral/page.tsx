'use client';

import CopyDataComponent from '@/components/CopyDataComponent';
import GoBackButton from '@/components/GoBackButton';
import MobileBottomNav from '@/components/navigation-components/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Label } from '@/components/ui/label';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { cn } from '@/lib/utils';
import { Link } from 'lucide-react';

export default function ReferralPage() {
	return (
		<PageWrapper className='flex flex-col items-center'>
			<div className='flex items-center gap-10 w-full px-5'>
				<GoBackButton />
				<h1 className='font-semibold text-xl'>Refer and Earn</h1>
			</div>
			<SectionWrapper className='flex flex-col items-center max-w-lg px-5!'>
				<div className='w-full space-y-5 '>
					<ImageWithFallback
						src={'/assets/referralillustration.png'}
						className='w-full'
					/>
					<div className='w-full text-center'>
						<h3 className='text-3xl font-bold'>
							{' '}
							Invite friends and earn food credits!
						</h3>
						<p>
							Earn #500 food credits for 5 friends who join FUDEX
							using your referral code
						</p>
					</div>

					<div className='w-full my-5 space-y-2'>
						<p>Referral Code</p>
						<div className='-full p-5 rounded-lg border border-foreground flex items-center justify-between'>
							<p>23434234</p>
							<CopyDataComponent data='23434234' />
						</div>
					</div>

					<div className='w-full flex justify-center'>
						<Button
							variant={'game'}
							size={'lg'}
							className='w-fit p-6'>
							Share Link
							<Link />
						</Button>
					</div>

					<div className='w-full'>
						<p className='text-lg text-gray-500'>Referrals</p>
						<div className='w-full flex gap-5 items-end'>
							<div className='relative flex-1 flex rounded-full h-7 overflow-hidden bg-foreground/10  items-center justify-center'>
								<div
									className={cn(
										'h-full w-[25%] bg-primary absolute top-0 left-0'
									)} />
                                    <p>1/5</p>
							</div>
							<ImageWithFallback
								src={'/assets/gift.png'}
								className='w-[34px] '
							/>
						</div>
					</div>
				</div>
			</SectionWrapper>
            <MobileBottomNav />
		</PageWrapper>
	);
}
