'use client';

import InputField, { SelectField } from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import VendorOnboardingFormsWrapper from '@/components/wrapers/VendorOnboardingFormsWrapper';
import {
	validateEmailRegex,
	validatePhoneNumberRegex,
} from '@/lib/commonFunctions';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import { localStorageStrings } from '@/constants/localStorageStrings';
import { useSession } from '@/lib/auth-client';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface IFormData {
	phone: string;
	email: string;
	firstName: string;
	lastName: string;
	businessName: string;
	businessType: string;
}

interface IFormTouchedData {
	phone?: boolean;
	email?: boolean;
	firstName?: boolean;
	lastName?: boolean;
	businessName?: boolean;
	businessType?: boolean;
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
	businessName: '',
	businessType: '',
};

export default function VendorOnboardingPersonalDetailsPage() {
	const router = useRouter();
	const trpc = useTRPC();
	const { data: session } = useSession();

	const [form, setForm] = useState<IFormData>(initialFormData);
	const [touched, setTouched] = useState<IFormTouchedData>({});
	const [availabilityErrors, setAvailabilityErrors] =
		useState<IAvailabilityErrors>({});
	const [debouncedPhone, setDebouncedPhone] = useState('');
	const [debouncedEmail, setDebouncedEmail] = useState('');
	const [showExistingUserAlert, setShowExistingUserAlert] = useState(false);
	const [existingUserData, setExistingUserData] = useState<any>(null);

	// Pre-fill form data if user is logged in
	useEffect(() => {
		if (session?.user) {
			setForm({
				email: session.user.email || '',
				phone: (session.user as any).phone || '',
				firstName: (session.user as any).firstName || '',
				lastName: (session.user as any).lastName || '',
				businessName: '',
				businessType: '',
			});
		}
	}, [session]);

	// Check if user already has a vendor account to redirect
	const { data: vendorProgress } = useQuery(
		trpc.vendors.getVendorOnboardingProgress.queryOptions(undefined, {
			enabled: !!session?.user,
			retry: false,
		})
	);

	useEffect(() => {
		if (vendorProgress?.hasVendor) {
			// Already has vendor, redirect to progress or dashboard
			if (vendorProgress.approvalStatus === 'APPROVED') {
				router.push('/vendor/dashboard');
			} else {
				router.push('/vendor-onboarding/progress');
			}
		}
	}, [vendorProgress, router]);

	// Check phone availability
	const { data: phoneCheckData, isLoading: isCheckingPhone } = useQuery(
		trpc.phoneAuth.checkPhoneInUse.queryOptions(
			{ phone: debouncedPhone },
			{
				enabled:
					!!debouncedPhone &&
					validatePhoneNumberRegex(debouncedPhone) &&
					!session?.user,
				retry: false,
			}
		)
	);

	// Check email availability
	const { data: emailCheckData, isLoading: isCheckingEmail } = useQuery(
		trpc.phoneAuth.checkEmailInUse.queryOptions(
			{ email: debouncedEmail },
			{
				enabled:
					!!debouncedEmail &&
					validateEmailRegex(debouncedEmail) &&
					!session?.user,
				retry: false,
			}
		)
	);

	// Check user by email or phone for linking flow
	const { data: userCheckData } = useQuery(
		trpc.phoneAuth.checkUserByEmailOrPhone.queryOptions(
			{
				email: debouncedEmail,
				phone: debouncedPhone,
			},
			{
				enabled:
					(!!debouncedEmail || !!debouncedPhone) &&
					!session?.user &&
					(phoneCheckData?.inUse || emailCheckData?.inUse),
				retry: false,
			}
		)
	);

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
		if (session?.user) return; // Skip if logged in

		if (phoneCheckData?.inUse && userCheckData?.exists) {
			setAvailabilityErrors((prev) => ({
				...prev,
				phone: undefined, // Clear error, show alert instead
			}));
			setShowExistingUserAlert(true);
			setExistingUserData(userCheckData.user);
		} else if (phoneCheckData?.inUse) {
			setAvailabilityErrors((prev) => ({
				...prev,
				phone: 'This phone number is already in use',
			}));
			setShowExistingUserAlert(false);
		} else {
			setAvailabilityErrors((prev) => ({ ...prev, phone: undefined }));
			setShowExistingUserAlert(false);
		}
	}, [phoneCheckData, userCheckData, session?.user]);

	useEffect(() => {
		if (session?.user) return; // Skip if logged in

		if (emailCheckData?.inUse && userCheckData?.exists) {
			setAvailabilityErrors((prev) => ({
				...prev,
				email: undefined, // Clear error, show alert instead
			}));
			setShowExistingUserAlert(true);
			setExistingUserData(userCheckData.user);
		} else if (emailCheckData?.inUse) {
			setAvailabilityErrors((prev) => ({
				...prev,
				email: 'This email is already in use',
			}));
			setShowExistingUserAlert(false);
		} else {
			setAvailabilityErrors((prev) => ({ ...prev, email: undefined }));
			setShowExistingUserAlert(false);
		}
	}, [emailCheckData, userCheckData, session?.user]);

	const validate = () => {
		const newErrors: any = {};
		if (!form.firstName) newErrors.firstName = 'First name is required';
		if (!form.lastName) newErrors.lastName = 'Last name is required';
		if (!form.businessName)
			newErrors.businessName = 'Business name is required';
		if (!form.businessType)
			newErrors.businessType = 'Business type is required';
		if (!form.email) newErrors.email = 'Email is required';
		else if (!validateEmailRegex(form.email))
			newErrors.email = 'Invalid email';
		if (!form.phone) newErrors.phone = 'Phone number is required';
		else if (!validatePhoneNumberRegex(form.phone))
			newErrors.phone = 'Invalid phone number format';

		return newErrors;
	};

	const errorsNow = validate();
	const hasAvailabilityErrors = !!(
		availabilityErrors.phone || availabilityErrors.email
	);
	const isFormValid =
		Object.keys(errorsNow).length === 0 && !hasAvailabilityErrors;

	const handleChange =
		(field: string) =>
		(e: React.ChangeEvent<HTMLInputElement> | string) => {
			setForm({
				...form,
				[field]: typeof e === 'string' ? e : e.target.value,
			});
			setTouched({ ...touched, [field]: true });
		};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isFormValid) return;

		// Store form data in localStorage
		localStorage.setItem(
			localStorageStrings.vendorOnboardinPersonalDetailsstring,
			JSON.stringify(form)
		);

		// Navigate to email verification page
		router.push('/vendor-onboarding/verify-email');
	};

	return (
		<VendorOnboardingFormsWrapper goBack={false}>
			<div className='w-full'>
				<div className='w-full my-3 space-y-2'>
					<h1 className='font-bold text-xl leading-[100%]'>
						Personal details
					</h1>
					<p className='font-light text-foreground/50 leading-[100%]'>
						Let's get you started on Fudex
					</p>
				</div>

				{showExistingUserAlert && existingUserData && (
					<Alert className='mb-4 border-blue-500 bg-blue-50'>
						<Info className='h-4 w-4 text-blue-500' />
						<AlertDescription className='text-sm text-blue-700'>
							An account with this{' '}
							{emailCheckData?.inUse ? 'email' : 'phone'} already
							exists. If this is your account, you can proceed to
							link it as a vendor account.
						</AlertDescription>
					</Alert>
				)}

				<form className='w-full' onSubmit={handleSubmit}>
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
						disabled={!!session?.user}
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
						disabled={!!session?.user}
					/>
					<InputField
						type='text'
						label='Business name'
						value={form.businessName}
						onChange={handleChange('businessName')}
						placeholder='e.g Mama Put'
						error={touched.businessName && errorsNow.businessName}
						required
						className=''
					/>
					<SelectField
						data={[
							{
								label: 'Restaurant',
								value: 'restaurant',
							},
							{
								label: 'Grocery',
								value: 'grocery',
							},
							{
								label: 'Pharmacy',
								value: 'pharmacy',
							},
							{
								label: 'Supermarket',
								value: 'supermarket',
							},
							{
								label: 'Other',
								value: 'other',
							},
						]}
						type='text'
						label='Business Type'
						value={form.businessType}
						onChange={handleChange('businessType')}
						error={touched.businessType && errorsNow.businessType}
						required
					/>

					<Button
						type='submit'
						variant={'game'}
						className='w-full py-5'
						disabled={!isFormValid}>
						Continue
					</Button>
				</form>
			</div>
		</VendorOnboardingFormsWrapper>
	);
}
