'use client';

import InputField from '@/components/InputComponent';
import { Button, buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import AuthPageWrapper from '@/components/wrapers/AuthPageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';

export default function OnboardingSignUpPage() {
	return (
		<AuthPageWrapper>
			<div className='flex flex-col gap-5 w-full max-w-md'>
				<div className='w-full space-y-2 text-center'>
					<h1 className='font-bold text-xl'>Welcome</h1>
					<p className='font-light text-foreground/50'>
						Let’s get you started! Drop your details below to create
						your Fudex account
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
						type='email'
						label='Email address'
						value=''
						onChange={() => {}}
						placeholder='example@gmai.com'
						required
					/>
					<div className='flex gap-2'>
						<InputField
							type='text'
							label='First name'
							value=''
							onChange={() => {}}
							placeholder='e.g Olaide'
							required
							className=''
						/>
						<InputField
							type='text'
							label='Last name'
							value=''
							onChange={() => {}}
							placeholder='e.g Igotun'
							required
						/>
					</div>
					<InputField
						type='text'
						label='Referral code'
						value=''
						onChange={() => {}}
						placeholder='Enter a referral code'
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
			</div>
		</AuthPageWrapper>
	);
}
