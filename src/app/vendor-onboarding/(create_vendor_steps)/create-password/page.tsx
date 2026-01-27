'use client';

import InputField from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import VendorOnboardingFormsWrapper from '@/components/wrapers/VendorOnboardingFormsWrapper';
import { localStorageStrings } from '@/constants/localStorageStrings';
import { validatepasswordRegex } from '@/lib/commonFunctions';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVendorOnboardingActions } from '@/api-hooks/useVendorOnboardingActions';
import { PAGES_DATA } from '@/data/pagesData';
import { toast } from 'sonner';

interface IFormData {
	password: string;
	confirm: string;
}

interface IFormTouchedData {
	password?: string;
	confirm?: string;
}

const initialFormData = {
	password: '',
	confirm: '',
};

export default function VendorOnboardingCreatePasswordPage() {
	const router = useRouter();
	const [form, setForm] = useState<IFormData>(initialFormData);
	const [touched, setTouched] = useState<IFormTouchedData>({});
	const [personalDetails, setPersonalDetails] = useState<any>(null);

	const { setPasswordAndSignUp } = useVendorOnboardingActions();

	const { mutate: createAccountMutate, isPending } = setPasswordAndSignUp({
		onSuccess: () => {
			// Navigate to vendor terms
			router.push(PAGES_DATA.vendor_onboarding_terms_page);
		},
		silent: false,
		password: form.password,
		email: personalDetails?.email || '',
		firstName: personalDetails?.firstName || '',
		lastName: personalDetails?.lastName || '',
	});

	// Load personal details from localStorage
	useEffect(() => {
		const detailsRaw = localStorage.getItem(
			localStorageStrings.vendorOnboardinPersonalDetailsstring,
		);

		if (!detailsRaw) {
			// Redirect back if missing data
			toast.error(
				'Something went wrong while onboarding please start again',
			);
			router.push(PAGES_DATA.vendor_onboarding_personal_details_page);
			return;
		}

		try {
			setPersonalDetails(JSON.parse(detailsRaw));
		} catch (e) {
			toast.error(
				'Something went wrong while onboarding please start again',
			);
			console.error('Failed to load onboarding data:', e);
			router.push(PAGES_DATA.vendor_onboarding_personal_details_page);
		}
	}, [router]);

	const validate = () => {
		const newErrors: any = {};
		if (!form.password) newErrors.password = 'Password is required';
		else if (!validatepasswordRegex(form.password))
			newErrors.password =
				'Password must contain uppercase, lowercase, number, and special character (min. 8 characters).';
		if (!form.confirm)
			newErrors.confirm = 'You have to confirm your password';
		else if (form.password !== form.confirm)
			newErrors.confirm = 'Passwords do not match';

		return newErrors;
	};

	const errorsNow = validate();
	const isFormValid = Object.keys(errorsNow).length === 0;

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

		if (!isFormValid || !personalDetails) return;
		createAccountMutate();
	};

	return (
		<VendorOnboardingFormsWrapper>
			<div className='flex flex-col gap-5 w-full max-w-md'>
				<div className='w-full space-y-2 text-center'>
					<h1 className='font-bold text-xl'>Create Password</h1>
					<p className='font-light text-foreground/50'>
						Create your log in password below to complete your
						registration.
					</p>
				</div>

				<form className='flex flex-col gap-3' onSubmit={handleSubmit}>
					<InputField
						type='password'
						label='Create password'
						value={form.password}
						onChange={handleChange('password')}
						placeholder='Enter preferred password'
						error={touched.password && errorsNow.password}
						hint='Password must contain uppercase, lowercase, number, and special character (min. 8 characters).'
						required
					/>
					<InputField
						type='password'
						label='Confirm password'
						value={form.confirm}
						onChange={handleChange('confirm')}
						placeholder='Enter preferred password again'
						error={touched.confirm && errorsNow.confirm}
						required
					/>
					<Button
						type='submit'
						variant={'game'}
						className='w-full py-5'
						disabled={!isFormValid || isPending}>
						{isPending
							? 'Completing registration...'
							: 'Complete registration'}
					</Button>
				</form>
			</div>
		</VendorOnboardingFormsWrapper>
	);
}
