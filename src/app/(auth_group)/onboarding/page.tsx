'use client';

import InputField from '@/components/InputComponent';
import { Button, buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import AuthPageWrapper from '@/components/wrapers/AuthPageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import {
	validateEmailRegex,
	validatePhoneNumberRegex,
} from '@/lib/commonFunctions';
import { localStorageStrings } from '@/constants/localStorageStrings';
import { useAuthActions } from '@/api-hooks/useAuthActions';
import ContinueWithGoogleButton, {
	ContinueWithGoogleButtonSkeleton,
} from './ContinueWithGoogleButton';
import { useRouter } from 'next/navigation';

interface IFormData {
	phone: string;
	email: string;
	firstName: string;
	lastName: string;
	referralCode: string;
}

interface IFormTouchedData {
	phone?: boolean;
	email?: boolean;
	firstName?: boolean;
	lastName?: boolean;
	referralCode?: boolean;
}

const initialFormData = {
	phone: '',
	email: '',
	firstName: '',
	lastName: '',
	referralCode: '',
};

export default function OnboardingSignUpPage() {
	const [form, setForm] = useState<IFormData>(initialFormData);
	const [touched, setTouched] = useState<IFormTouchedData>({});
	const router = useRouter()

	const { requestPhoneOtp } = useAuthActions();
	const { mutate, isPending } = requestPhoneOtp({
		silent: false,
		onSuccess: () => {
			// persist temporarily
			localStorage.setItem(
				localStorageStrings.onboardingSignupString,
				JSON.stringify({ ...form })
			);
			router.replace(PAGES_DATA.onboarding_verify_number_page);
		},
	});

	const validate = () => {
		const newErrors: any = {};
		if (!form.firstName) newErrors.firstName = 'First name is required';
		if (!form.lastName) newErrors.lastName = 'Last name is required';
		if (!form.email) newErrors.email = 'Email is required';
		else if (!validateEmailRegex(form.email))
			newErrors.email = 'Invalid email';
		if (!form.phone) newErrors.phone = 'Phone number is required';
		else if (!validatePhoneNumberRegex(form.phone))
			newErrors.phone = 'Invalid phone number format';

		return newErrors;
	};
	const errorsNow = validate();
	const isFormValid = Object.keys(errorsNow).length === 0;

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setTouched({
			firstName: true,
			lastName: true,
			email: true,
			phone: true,
			referralCode: true,
		});
		if (!isFormValid) return;
		mutate({ phone: form.phone });
	}

	const handleChange =
		(field: string) =>
		(e: React.ChangeEvent<HTMLInputElement> | string) => {
			setForm({
				...form,
				[field]: typeof e === 'string' ? e : e.target.value,
			});
			setTouched({ ...touched, [field]: true });
		};

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

				<form className='flex flex-col gap-3' onSubmit={handleSubmit}>
					<InputField
						type='tel'
						label='Phone number'
						value={form.phone}
						onChange={handleChange('phone')}
						placeholder='7012345678'
						icon={
							<ImageWithFallback
								src={'/assets/nigeriaflagicon.svg'}
								className='w-5 h-5'
							/>
						}
						error={touched.phone && errorsNow.phone}
						required
					/>
					<InputField
						type='email'
						label='Email address'
						value={form.email}
						onChange={handleChange('email')}
						placeholder='example@gmail.com'
						error={touched.email && errorsNow.email}
						required
					/>
					<div className='flex gap-2'>
						<InputField
							type='text'
							label='First name'
							value={form.firstName}
							onChange={handleChange('firstName')}
							placeholder='e.g Olaide'
							error={touched.firstName && errorsNow.firstName}
							required
							className=''
						/>
						<InputField
							type='text'
							label='Last name'
							value={form.lastName}
							onChange={handleChange('lastName')}
							placeholder='e.g Igotun'
							error={touched.lastName && errorsNow.lastName}
							required
						/>
					</div>
					<InputField
						type='text'
						label='Referral code'
						value={form.referralCode}
						onChange={handleChange('handleChange')}
						placeholder='Enter a referral code'
						error={touched.referralCode && errorsNow.referralCode}
					/>
					<Button
						type='submit'
						variant={'game'}
						className='w-full py-5'
						disabled={!isFormValid || isPending}>
						{isPending ? 'Sending...' : 'Continue'}
					</Button>
				</form>
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
