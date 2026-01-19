'use client';

import GoBackButton from '@/components/GoBackButton';
import { Button, buttonVariants } from '@/components/ui/button';
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from '@/components/ui/input-otp';
import AuthPageWrapper from '@/components/wrapers/AuthPageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { localStorageStrings } from '@/constants/localStorageStrings';
import { useAuthActions } from '@/api-hooks/useAuthActions';
import InputField from '@/components/InputComponent';
import { toast } from 'sonner';

export default function VerifyPasswordResetPage() {
	const router = useRouter();
	const [otp, setOtp] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [countdown, setCountdown] = useState(60);
	const [isCounting, setIsCounting] = useState(true);

	const { requestPasswordResetEmail, resetPasswordWithEmailOTP } =
		useAuthActions();

	const { mutate: resetPasswordMutate, isPending: resetPasswordLoading } =
		resetPasswordWithEmailOTP({
			silent: false,
			onSuccess: () => {
				localStorage.removeItem(localStorageStrings.passwordResetEmail);
				router.replace(PAGES_DATA.login_page);
			},
		});

	const { mutate: requestOtpMutate, isPending: requestOtpLoading } =
		requestPasswordResetEmail({
			silent: false,
			onSuccess: () => {
				setCountdown(60);
				setIsCounting(true);
			},
		});

	useEffect(() => {
		const storedEmail = localStorage.getItem(
			localStorageStrings.passwordResetEmail
		);
		if (storedEmail) {
			setEmail(storedEmail);
		} else {
			// No email found, redirect back
			router.replace(PAGES_DATA.onboarding_forgot_password_page);
		}
	}, [router]);

	useEffect(() => {
		if (!isCounting) return;

		const interval = setInterval(() => {
			setCountdown((prevCountdown) => {
				if (prevCountdown <= 1) {
					clearInterval(interval);
					setIsCounting(false);
					return 0;
				}
				return prevCountdown - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [isCounting]);

	const handleResendCode = () => {
		requestOtpMutate({ email });
	};

	const handleResetPassword = () => {
		if (password !== confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}
		resetPasswordMutate({ otp, email, newPassword: password });
	};

	return (
		<AuthPageWrapper canSkip={false}>
			<div className='flex flex-col gap-5 w-full max-w-md'>
				<div className='w-full'>
					<GoBackButton />
				</div>

				<div className='w-full space-y-2 text-center'>
					<h1 className='font-bold text-xl'>Reset your password</h1>
					<p className='font-light text-foreground/50'>
						We have sent a 6-digit code to{' '}
						<span className='font-semibold text-foreground'>
							{email}
						</span>
					</p>
				</div>

				<div className='flex flex-col gap-5'>
					<div className='w-full text-center gap-3 flex flex-col items-center'>
						<p className='font-light text-foreground/50'>
							Enter OTP
						</p>
						<InputOTP
							value={otp}
							onChange={(v: string) => setOtp(v)}
							maxLength={6}
							pattern=''>
							<InputOTPGroup>
								<InputOTPSlot index={0} />
								<InputOTPSlot index={1} />
							</InputOTPGroup>
							<InputOTPSeparator />
							<InputOTPGroup>
								<InputOTPSlot index={2} />
								<InputOTPSlot index={3} />
							</InputOTPGroup>
							<InputOTPSeparator />
							<InputOTPGroup>
								<InputOTPSlot index={4} />
								<InputOTPSlot index={5} />
							</InputOTPGroup>
						</InputOTP>

						<p className='text-foreground/50'>
							Code expires in{' '}
							<span className='font-bold text-foreground'>
								{Math.floor(countdown / 60)}:
								{countdown % 60 < 10 ? '0' : ''}
								{countdown % 60}s
							</span>{' '}
						</p>
						<div className='w-full text-center flex gap-2 items-center justify-center'>
							<p className='text-sm text-foreground/50'>
								Didn't get code?
							</p>
							<Button
								variant='link'
								size='sm'
								className='text-secondary'
								onClick={handleResendCode}
								disabled={isCounting || requestOtpLoading}>
								{requestOtpLoading
									? 'Sending...'
									: 'Resend code'}
							</Button>
						</div>
					</div>

					<InputField
						label='New Password'
						type='password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder='********'
						required
					/>

					<InputField
						label='Confirm New Password'
						type='password'
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder='********'
						required
					/>

					<Button
						type='button'
						variant={'game'}
						onClick={handleResetPassword}
						className='w-full py-5'
						disabled={
							resetPasswordLoading ||
							otp.length !== 6 ||
							!password ||
							!confirmPassword
						}>
						{resetPasswordLoading
							? 'Resetting...'
							: 'Reset Password'}
					</Button>
				</div>
				<div className='w-full space-y-2'>
					<div className='w-full text-center flex gap-2 items-center justify-center'>
						<p className='text-sm text-foreground/50'>
							Remember your password?
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
