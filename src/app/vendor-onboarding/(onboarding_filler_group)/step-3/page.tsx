import OnboardingTracker from '@/components/onboarding-components/OnboardingTracker';
import { buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function OnboardingStepThreePage() {
	return (
		<PageWrapper className='flex justify-center items-center py-10 px-5'>
			<div className='flex flex-col items-center max-w-lg w-full gap-5'>
				<div className='px-5 pt-10 flex items-end rounded-xl bg-secondary'>
					<ImageWithFallback
						src={'/assets/vendor-onboarding3.png'}
						className='w-full max-w-sm h-auto object-contain'
						alt='vendor dusiness growth'
					/>
				</div>
				<div className='w-full space-y-2 text-center'>
					<h1 className='font-bold text-xl'>
						Start Selling in Minutes, No Stress
					</h1>
					<p className='font-light text-foreground/50'>
						Set up your restaurant, add your menu, and begin earning
						on FUDEX today.
					</p>
				</div>
				<OnboardingTracker indicator={3} />
				<div className='w-full space-y-2'>
					<Link
						href={
							PAGES_DATA.vendor_onboarding_personal_details_page
						}
						className={cn(
							buttonVariants({
								variant: 'game',
								className: 'w-full py-5',
							})
						)}>
						Create your vendor account
					</Link>
					<Link
						href={PAGES_DATA.login_page}
						className={cn(
							buttonVariants({
								variant: 'outline',
								className:
									'w-full py-5 border-primary text-primary',
							})
						)}>
						Log in
					</Link>
				</div>
			</div>
		</PageWrapper>
	);
}
