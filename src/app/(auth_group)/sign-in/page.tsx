'use client';

import InputField from '@/components/InputComponent';
import { Button, buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import AuthPageWrapper from '@/components/wrapers/AuthPageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import ContinueWithGoogleButton from '../onboarding/ContinueWithGoogleButton';
import { useState } from 'react';
import { useAuthActions } from '@/api-hooks/useAuthActions';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { validatePhoneNumberRegex } from '@/lib/commonFunctions';

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

export default function LoginPage() {
	const [form, setForm] = useState<IFormData>(initialFormData);
	const [touched, setTouched] = useState<IFormTouchedData>({});
	const [rememberMe, setRememberMe] = useState(false);

	const router = useRouter();
	const { login } = useAuthActions();
	const { mutate: loginMutate, isPending: loginLoading } = login({
		silent: false,
		onSuccess: () => {
			router.replace('/');
		},
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
			password: form.password,
			rememberMe,
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
		<AuthPageWrapper>
			<div className='flex flex-col gap-5 w-full max-w-md'>
				<div className='w-full space-y-2 text-center'>
					<h1 className='font-bold text-xl'>Log in</h1>
					<p className='font-light text-foreground/50'>
						Hi welcome back. You can log back into your account
						using your phone number.
					</p>
				</div>

				<form
					className='flex flex-col gap-3'
					onSubmit={handleFormSubmit}>
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
						onChange={handleChange('[password]')}
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
						<Button type='button' variant={'link'}>
							Forgot password?
						</Button>
					</div>
					<Button
						type='submit'
						variant={'game'}
						className='w-full py-5'
						disabled={loginLoading || !isFormValid}>
						{loginLoading ? 'Logging in...' : 'Continue'}
					</Button>
				</form>
				<div className='w-full space-y-2'>
					<div className='w-full flex items-center gap-5 text-center text-foreground/50'>
						<div className='flex-1 h-1 bg-muted' /> <p>or</p>
						<div className='flex-1 h-1 bg-muted' />
					</div>
					<ContinueWithGoogleButton />
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
