'use client';

import GoBackButton from '@/components/GoBackButton';
import InputField from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import AuthPageWrapper from '@/components/wrapers/AuthPageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { useState, useEffect } from 'react';
import { localStorageStrings } from '@/constants/localStorageStrings';
import { validatepasswordRegex } from '@/lib/commonFunctions';
import { useAuthActions } from '@/api-hooks/useAuthActions';

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

export default function CreatePasswordPage() {
	const [form, setForm] = useState<IFormData>(initialFormData);

	const [touched, setTouched] = useState<IFormTouchedData>({});
	const [token, setToken] = useState<string | null>(null);
	const [signupPayload, setSignupPayload] = useState<any>(null);

	const { setPasswordAndCompleteSignUp } = useAuthActions();
	const { mutate, isPending } = setPasswordAndCompleteSignUp({
		password: form.password,
		token: token as string,
		redirectTo: PAGES_DATA.onboarding_set_address_page,
		onSuccess: () => {
			localStorage.removeItem(localStorageStrings.onboardingSignupString);
			localStorage.removeItem(
				localStorageStrings.onboardingVerificationToken
			);
		},
	});

	useEffect(() => {
		const t = localStorage.getItem(
			localStorageStrings.onboardingVerificationToken
		);
		setToken(t);
		const raw = localStorage.getItem(
			localStorageStrings.onboardingSignupString
		);
		if (raw) setSignupPayload(JSON.parse(raw));
	}, []);

	const validate = () => {
		const newErrors: any = {};
		if (!form.password) newErrors.password = 'Password is required';
		else if (!validatepasswordRegex(form.password))
			newErrors.phone =
				'Password must contain uppercase, lowercase, number, and special character (min. 8 characters).';
		if (!form.confirm)
			newErrors.confirm = 'You have to confirm your password';
		else if (form.password !== form.confirm)
			newErrors.confirm = 'Passwords do not match';

		return newErrors;
	};

	const errorsNow = validate();
	const isFormValid = Object.keys(errorsNow).length === 0;

	async function handleComplete(e: React.FormEvent) {
		e.preventDefault();
		if (!token) return;
		if (!isFormValid) return;
		const password = form.password;
		mutate({
			token,
			password,
			email: signupPayload?.email,
			firstName: signupPayload?.firstName,
			lastName: signupPayload?.lastName,
		});
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
				<div className='w-full'>
					<GoBackButton link={PAGES_DATA.onboarding_signup_page} />
				</div>

				<div className='w-full space-y-2 text-center'>
					<h1 className='font-bold text-xl'>Create Password</h1>
					<p className='font-light text-foreground/50'>
						Create your log in password below to complete your
						registration.
					</p>
				</div>

				<form className='flex flex-col gap-3' onSubmit={handleComplete}>
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
		</AuthPageWrapper>
	);
}
