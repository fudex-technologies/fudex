'use client';

import { useState } from 'react';
import { useAuthActions } from '@/api-hooks/useAuthActions';
import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { validatePhoneNumberRegex } from '@/lib/commonFunctions';
import InputField from '@/components/InputComponent';
import { Button, buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';

interface IFormData {
	phone: string;
	password: string;
}
interface IFormTouchedData {
	phone?: boolean;
	password?: boolean;
}
const initialFormData = {
	phone: '',
	password: '',
};
const LoginForm = () => {
	const [form, setForm] = useState<IFormData>(initialFormData);
	const [touched, setTouched] = useState<IFormTouchedData>({});
	const [rememberMe, setRememberMe] = useState(false);
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get('redirect');

	const { login } = useAuthActions();
	const { mutate: loginMutate, isPending: loginLoading } = login({
		password: form.password,
		rememberMe,
		redirect: redirectTo || undefined,
		silent: false,
	});

	const validate = () => {
		const newErrors: any = {};
		if (!form.phone) newErrors.phone = 'Phone number is required';
		else if (!validatePhoneNumberRegex(form.phone))
			newErrors.phone = 'Invalid phone number format';
		if (!form.password) newErrors.password = 'Password is required';

		return newErrors;
	};
	const errorsNow = validate();
	const isFormValid = Object.keys(errorsNow).length === 0;

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		setTouched({
			phone: true,
			password: true,
		});
		if (!isFormValid) return;

		loginMutate({
			phone: form.phone,
		});
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
		<form className='flex flex-col gap-3' onSubmit={handleFormSubmit}>
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
				type='password'
				label='Enter Password'
				value={form.password}
				placeholder='Enter your password here'
				onChange={handleChange('password')}
				error={touched.password && errorsNow.password}
				required
			/>
			<div className='w-full flex justify-between items-center'>
				<div className='flex items-center gap-2'>
					<Checkbox
						id='rememberme'
						onClick={() => setRememberMe((prev) => !prev)}
					/>
					<Label htmlFor='rememberme'>Remember me</Label>
				</div>
				<Link
					href={PAGES_DATA.onboarding_forgot_password_page}
					type='button'
					className={buttonVariants({ variant: 'link', size: 'sm' })}>
					Forgot password?
				</Link>
			</div>
			<Button
				type='submit'
				variant={'game'}
				className='w-full py-5'
				disabled={loginLoading || !isFormValid}>
				{loginLoading ? 'Logging in...' : 'Continue'}
			</Button>
		</form>
	);
};

export default LoginForm;
