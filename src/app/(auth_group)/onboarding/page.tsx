'use client';

import InputField from '@/components/InputComponent';
import { Button, buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import AuthPageWrapper from '@/components/wrapers/AuthPageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
	validateEmailRegex,
	validatePhoneNumberRegex,
} from '@/lib/commonFunctions';
import { localStorageStrings } from '@/constants/localStorageStrings';
import { useAuthActions } from '@/api-hooks/useAuthActions';
import { useTRPC } from '@/trpc/client';
import ContinueWithGoogleButton, {
	ContinueWithGoogleButtonSkeleton,
} from './ContinueWithGoogleButton';
import { useRouter, useSearchParams } from 'next/navigation';

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

interface IAvailabilityErrors {
	phone?: string;
	email?: string;
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
	const [availabilityErrors, setAvailabilityErrors] =
		useState<IAvailabilityErrors>({});
	const [debouncedPhone, setDebouncedPhone] = useState('');
	const [debouncedEmail, setDebouncedEmail] = useState('');
	const [referralCodeError, setReferralCodeError] = useState<
		string | undefined
	>();
	const router = useRouter();
	const searchParams = useSearchParams();

	const { requestEmailFallbackOtp } = useAuthActions();
	const trpc = useTRPC();

	// Check referral code validity
	const refParam = searchParams?.get('ref');
	const { data: referralCodeData, isLoading: isValidatingReferralCode } =
		useQuery(
			trpc.phoneAuth.validateReferralCode.queryOptions(
				{ referralCode: form.referralCode },
				{
					enabled:
						!!form.referralCode && form.referralCode.length > 0,
					retry: false,
				},
			),
		);

	// Auto-fill referral code from query param on mount
	useEffect(() => {
		if (refParam) {
			setForm((prev) => ({ ...prev, referralCode: refParam }));
			setTouched((prev) => ({ ...prev, referralCode: true }));
		}
	}, [refParam]);

	// Check phone availability
	const { data: phoneCheckData, isLoading: isCheckingPhone } = useQuery(
		trpc.phoneAuth.checkPhoneInUse.queryOptions(
			{ phone: debouncedPhone },
			{
				enabled:
					!!debouncedPhone &&
					validatePhoneNumberRegex(debouncedPhone),
				retry: false,
			},
		),
	);

	// Check email availability
	const { data: emailCheckData, isLoading: isCheckingEmail } = useQuery(
		trpc.phoneAuth.checkEmailInUse.queryOptions(
			{ email: debouncedEmail },
			{
				enabled: !!debouncedEmail && validateEmailRegex(debouncedEmail),
				retry: false,
			},
		),
	);
	const { mutate, isPending } = requestEmailFallbackOtp({
		silent: false,
		onSuccess: () => {
			// persist temporarily
			localStorage.setItem(
				localStorageStrings.onboardingSignupString,
				JSON.stringify({ ...form }),
			);
			router.replace(PAGES_DATA.onboarding_verify_number_page);
		},
	});

	// Debounce phone input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedPhone(form.phone);
		}, 800);

		return () => clearTimeout(timer);
	}, [form.phone]);

	// Debounce email input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedEmail(form.email);
		}, 800);

		return () => clearTimeout(timer);
	}, [form.email]);

	// Update availability errors based on query results
	useEffect(() => {
		if (phoneCheckData?.inUse) {
			setAvailabilityErrors((prev) => ({
				...prev,
				phone: 'This phone number is already in use',
			}));
		} else {
			setAvailabilityErrors((prev) => ({ ...prev, phone: undefined }));
		}
	}, [phoneCheckData]);

	useEffect(() => {
		if (emailCheckData?.inUse) {
			setAvailabilityErrors((prev) => ({
				...prev,
				email: 'This email is already in use',
			}));
		} else {
			setAvailabilityErrors((prev) => ({ ...prev, email: undefined }));
		}
	}, [emailCheckData]);

	// Update referral code error based on validation
	useEffect(() => {
		if (form.referralCode && !referralCodeData?.valid) {
			setReferralCodeError('Invalid referral code');
		} else {
			setReferralCodeError(undefined);
		}
	}, [referralCodeData, form.referralCode]);

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
		if (form.referralCode && referralCodeError)
			newErrors.referralCode = referralCodeError;

		return newErrors;
	};
	const errorsNow = validate();
	const hasAvailabilityErrors = !!(
		availabilityErrors.phone || availabilityErrors.email
	);
	const isFormValid =
		Object.keys(errorsNow).length === 0 &&
		!hasAvailabilityErrors &&
		!isValidatingReferralCode;

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
		mutate({ email: form.email, phone: form.phone });
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
		<AuthPageWrapper canSkip={false}>
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
						error={
							touched.phone &&
							(errorsNow.phone || availabilityErrors.phone)
						}
						hint={
							isCheckingPhone
								? 'Checking availability...'
								: undefined
						}
						required
					/>
					<InputField
						type='email'
						label='Email address'
						value={form.email}
						onChange={handleChange('email')}
						placeholder='example@gmail.com'
						error={
							touched.email &&
							(errorsNow.email || availabilityErrors.email)
						}
						hint={
							isCheckingEmail
								? 'Checking availability...'
								: undefined
						}
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
						onChange={handleChange('referralCode')}
						placeholder='Enter a referral code'
						error={touched.referralCode && errorsNow.referralCode}
						hint={
							isValidatingReferralCode
								? 'Validating code...'
								: undefined
						}
					/>
					<Button
						type='submit'
						variant={'game'}
						className='w-full py-5'
						disabled={
							!isFormValid ||
							isPending ||
							isCheckingPhone ||
							isCheckingEmail ||
							isValidatingReferralCode
						}>
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
								}),
							)}>
							Log in
						</Link>
					</div>
				</div>
			</div>
		</AuthPageWrapper>
	);
}
