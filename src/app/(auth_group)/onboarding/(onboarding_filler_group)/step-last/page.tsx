import OnboardingTracker from '@/components/onboarding-components/OnboardingTracker';
import { buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { IoMail } from 'react-icons/io5';
import ContinueWithGoogleButton, {
	ContinueWithGoogleButtonSkeleton,
} from '../../ContinueWithGoogleButton';
import { Suspense } from 'react';
import { Phone } from 'lucide-react';

export default function OnboardingStepThreePage() {
	return (
		<PageWrapper className='flex justify-center items-center py-10 px-5'>
			<div className='flex flex-col items-center max-w-lg w-full gap-5'>
				<ImageWithFallback
					src={'/assets/riderillustration.png'}
					className='w-full max-w-sm h-auto object-contain'
					alt='plate of food'
				/>
				<div className='w-full space-y-2 text-center'>
					<h1 className='font-bold text-3xl'>
						Fast food delivery, right to you.
					</h1>
				</div>
				<div className='w-full space-y-2 my-5'>
					<Suspense
						fallback={
							<ContinueWithGoogleButtonSkeleton
								className={'bg-foreground text-background py-7'}
							/>
						}>
						<ContinueWithGoogleButton
							className={'bg-foreground text-background py-7'}
						/>
					</Suspense>
					<Link
						href={PAGES_DATA.onboarding_signup_page}
						className={cn(
							buttonVariants({
								variant: 'outline',
								className: 'w-full  text-foreground py-7',
							})
						)}>
						<Phone /> Continue with Phone/Email
					</Link>
				</div>
				<div className='w-full text-center flex gap-2 items-center justify-center'>
					<p className='text-sm text-foreground/50'>
						Already have an account?
					</p>
					<Link
						href={PAGES_DATA.login_page}
						className={cn(
							buttonVariants({
								variant: 'link',
								size: 'sm',
							})
						)}>
						Log in
					</Link>
				</div>
			</div>
		</PageWrapper>
	);
}
