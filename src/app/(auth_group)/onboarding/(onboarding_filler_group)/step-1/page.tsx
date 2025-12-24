import { ContinueButton } from '@/components/onboarding-components/ContinueButton';
import OnboardingTracker from '@/components/onboarding-components/OnboardingTracker';
import { buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function OnboardingStepOnePage() {
	return (
		<PageWrapper className='flex justify-center items-center py-10 px-5'>
			<div className='flex flex-col items-center max-w-lg w-full gap-5'>
				<ImageWithFallback
					src={'/assets/rider-illustration.png'}
					className='w-full h-auto object-contain'
					alt='rider'
				/>
				<div className='w-full space-y-2 text-center'>
					<h1 className='font-bold text-xl'>
						Food at Your Door in Minutes
					</h1>
					<p className='font-light text-foreground/50'>
						Order from your favourite restaurants and get your meal
						delivered in minutes-fresh, fast, and reliable.
					</p>
				</div>
                <OnboardingTracker indicator={1} />
				<div className='w-full space-y-2'>
					<ContinueButton href={PAGES_DATA.onboarding_step_two_page} />
					<Link
						href={PAGES_DATA.onboarding_signup_page}
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
