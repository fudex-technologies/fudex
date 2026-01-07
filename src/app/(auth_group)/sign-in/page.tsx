'use client';

import AuthPageWrapper from '@/components/wrapers/AuthPageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import ContinueWithGoogleButton, {
	ContinueWithGoogleButtonSkeleton,
} from '../onboarding/ContinueWithGoogleButton';
import { Suspense } from 'react';
import LoginForm from '@/component-sections/Auth-forms/LoginForm';
import { buttonVariants } from '@/components/ui/button';

export default function LoginPage() {
	return (
		<AuthPageWrapper>
			<div className='flex flex-col gap-5 w-full max-w-md'>
				<div className='w-full space-y-2 text-center'>
					<h1 className='font-bold text-xl'>Log in</h1>
					<p className='font-light text-foreground/50'>
						Hi welcome back. You can log back into your account
						using your phone number.
					</p>
				</div>

				<Suspense fallback={'Loading...'}>
					<LoginForm />
				</Suspense>
				<div className='w-full space-y-2'>
					<div className='w-full flex items-center gap-5 text-center text-foreground/50'>
						<div className='flex-1 h-1 bg-muted' /> <p>or</p>
						<div className='flex-1 h-1 bg-muted' />
					</div>
					<Suspense fallback={<ContinueWithGoogleButtonSkeleton />}>
						<ContinueWithGoogleButton />
					</Suspense>
					<div className='w-full text-center flex gap-2 items-center justify-center'>
						<p className='text-sm text-foreground/50'>
							Don’t have an account?
						</p>
						<Link
							href={PAGES_DATA.onboarding_signup_page}
							className={cn(
								buttonVariants({
									variant: 'link',
									size: 'sm',
								})
							)}>
							Sign up
						</Link>
					</div>
				</div>
			</div>
		</AuthPageWrapper>
	);
}
