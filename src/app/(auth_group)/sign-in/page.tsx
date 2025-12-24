'use client';

import InputField from '@/components/InputComponent';
import { Button, buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import AuthPageWrapper from '@/components/wrapers/AuthPageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
	return (
		<AuthPageWrapper>
			<div className='flex flex-col gap-5 w-full max-w-md'>
				<div className='w-full space-y-2 text-center'>
					<h1 className='font-bold text-xl'>Log in</h1>
					<p className='font-light text-foreground/50'>
						Hi welcome back Olaide. You can log back into your
						account using your phone number.
					</p>
				</div>

				<form className='flex flex-col gap-3'>
					<InputField
						type='tel'
						label='Phone number'
						value=''
						onChange={() => {}}
						placeholder='7012345678'
						icon={
							<ImageWithFallback
								src={'/assets/nigeriaflagicon.svg'}
								className='w-5 h-5'
							/>
						}
						required
					/>
					<InputField
						type='password'
						label='Enter Password'
						value=''
						onChange={() => {}}
						placeholder='Enter your password here'
						required
					/>
					<Button
						type='submit'
						variant={'game'}
						className='w-full py-5'>
						Continue
					</Button>
				</form>
				<div className='w-full space-y-2'>
					<div className='w-full flex items-center gap-5 text-center text-foreground/50'>
						<div className='flex-1 h-1 bg-muted' /> <p>or</p>
						<div className='flex-1 h-1 bg-muted' />
					</div>
					<Button variant={'outline'} className='w-full py-5'>
						<FcGoogle />
						Continue With Google
					</Button>
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
