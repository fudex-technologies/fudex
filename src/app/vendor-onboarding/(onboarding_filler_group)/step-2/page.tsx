import { ContinueButton } from '@/components/onboarding-components/ContinueButton';
import OnboardingTracker from '@/components/onboarding-components/OnboardingTracker';
import { buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function OnboardingStepTwoPage() {
	return (
		<PageWrapper className='flex justify-center items-center py-10 px-5'>
			<div className='flex flex-col items-center max-w-lg w-full gap-5'>
				<div className='px-5 pt-10 flex items-end rounded-xl bg-secondary'>
					<ImageWithFallback
						src={'/assets/vendor-onboarding2.png'}
						className='w-full max-w-sm h-auto object-contain'
						alt='vendor with phone'
					/>
				</div>

				<div className='w-full space-y-2 text-center'>
					<h1 className='font-bold text-xl'>
						Turn Every Order into Real Income
					</h1>
					<p className='font-light text-foreground/50'>
						Accept orders, manage your menu easily, and get paid
						directly to your bank account.
					</p>
				</div>
				<OnboardingTracker indicator={2} />
				<div className='w-full space-y-2'>
					<ContinueButton
						href={PAGES_DATA.vendor_onboarding_step_three_page}
					/>
					<Link
						href={PAGES_DATA.vendor_onboarding_step_three_page}
						className={cn(
							buttonVariants({
								variant: 'link',
								className: 'w-full py-5',
							})
						)}>
						Skip
					</Link>
				</div>
			</div>
		</PageWrapper>
	);
}
