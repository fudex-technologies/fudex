'use client';

import AuthPageWrapper from '@/components/wrapers/AuthPageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthActions } from '@/api-hooks/useAuthActions';
import { localStorageStrings } from '@/constants/localStorageStrings';
import { Button, buttonVariants } from '@/components/ui/button';
import { validateEmailRegex } from '@/lib/commonFunctions';
import InputField from '@/components/InputComponent';
import GoBackButton from '@/components/GoBackButton';

interface IFormData {
	email: string;
}
interface IFormTouchedData {
	email?: boolean;
}
const initialFormData = {
	email: '',
};
export default function ForgotPasswordPage() {
	const [form, setForm] = useState<IFormData>(initialFormData);
	const [touched, setTouched] = useState<IFormTouchedData>({});
	const router = useRouter();

	const { requestPasswordResetEmail } = useAuthActions();
	const { mutate, isPending } = requestPasswordResetEmail({
		silent: false,
		onSuccess: () => {
			// Store email in localStorage for next step
			localStorage.setItem(
				localStorageStrings.passwordResetEmail,
				form.email
			);
			router.push(PAGES_DATA.onboarding_verify_password_reset_page);
		},
	});

	const validate = () => {
		const newErrors: any = {};
		if (!form.email) newErrors.email = 'Email is required';
		else if (!validateEmailRegex(form.email))
			newErrors.email = 'Invalid email format';

		return newErrors;
	};
	const errorsNow = validate();
	const isFormValid = Object.keys(errorsNow).length === 0;

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		setTouched({
			email: true,
		});
		if (!isFormValid) return;

		mutate({ email: form.email });
	};

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
				<GoBackButton />
				<div className='w-full space-y-2 text-center'>
					<h1 className='font-bold text-xl'>Forgot Password</h1>
					<p className='font-light text-foreground/50'>
						Enter your email address below to receive a password
						reset code.
					</p>
				</div>

				<form
					className='flex flex-col gap-3'
					onSubmit={handleFormSubmit}>
					<InputField
						type='email'
						label='Email address'
						value={form.email}
						onChange={handleChange('email')}
						placeholder='example@gmail.com'
						error={touched.email && errorsNow.email}
						required
					/>
					<Button
						type='submit'
						variant={'game'}
						className='w-full py-5 mt-5'
						disabled={!isFormValid || isPending}>
						{isPending ? 'Sending...' : 'Continue'}
					</Button>
				</form>
				<div className='w-full space-y-2'>
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
