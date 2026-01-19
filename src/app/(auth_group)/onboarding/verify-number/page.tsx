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

export default function VerifyPhonePage() {
	const router = useRouter();
	const [otp, setOtp] = useState('');
	const [phone, setPhone] = useState('');
	const [email, setEmail] = useState('');
	const [countdown, setCountdown] = useState(60);
	const [isCounting, setIsCounting] = useState(true);
	const [method, setMethod] = useState<'sms' | 'email'>('sms');

	const {
		verifyPhoneOtp,
		requestPhoneOtp,
		requestEmailFallbackOtp,
		verifyEmailFallbackOtp,
	} = useAuthActions();

	const { mutate: verifyOtpMutate, isPending: verifyOtpLoading } =
		verifyPhoneOtp({
			silent: false,
			onSuccess: () => {
				router.push(PAGES_DATA.onboarding_create_password_page);
			},
		});

	const { mutate: requestOtpMutate, isPending: requestOtpLoading } =
		requestPhoneOtp({
			silent: false,
			onSuccess: () => {
				setCountdown(60);
				setIsCounting(true);
			},
		});

	const { mutate: requestEmailOtpMutate, isPending: requestEmailOtpLoading } =
		requestEmailFallbackOtp({
			silent: false,
			onSuccess: () => {
				setCountdown(60);
				setIsCounting(true);
			},
		});

	const { mutate: verifyEmailOtpMutate, isPending: verifyEmailOtpLoading } =
		verifyEmailFallbackOtp({
			silent: false,
			onSuccess: () => {
				router.push(PAGES_DATA.onboarding_create_password_page);
			},
		});

	useEffect(() => {
		const raw = localStorage.getItem(
			localStorageStrings.onboardingSignupString,
		);
		if (raw) {
			try {
				const obj = JSON.parse(raw);
				setPhone(obj.phone || '');
				setEmail(obj.email || '');
			} catch (e) {}
		}
	}, []);

	useEffect(() => {
		const raw = localStorage.getItem(
			localStorageStrings.onboardingSignupString,
		);
		if (raw) {
			try {
				const obj = JSON.parse(raw);
				setPhone(obj.phone || '');
				setEmail(obj.email || '');
			} catch (e) {}
		}
	}, []);

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
		if (method === 'sms') {
			requestOtpMutate({ phone });
		} else {
			requestEmailOtpMutate({ email, phone });
		}
	};

	const handleVerify = () => {
		if (method === 'sms') {
			verifyOtpMutate({ otp, phone });
		} else {
			verifyEmailOtpMutate({ otp, email, phone });
		}
	};

	const handleSwitchMethod = () => {
		const newMethod = method === 'sms' ? 'email' : 'sms';
		setMethod(newMethod);
		setOtp('');
		setCountdown(60);
		setIsCounting(true);
		// Trigger resend immediately when switching? Maybe not, or maybe yes.
		// User might switch because they didn't get code.
		// If they switch to email, we should send email OTP.
		if (newMethod === 'email') {
			requestEmailOtpMutate({ email, phone });
		} else {
			requestOtpMutate({ phone });
		}
	};

	const isLoading =
		verifyOtpLoading ||
		requestOtpLoading ||
		requestEmailOtpLoading ||
		verifyEmailOtpLoading;

	return (
		<AuthPageWrapper canSkip={false}>
			<div className='flex flex-col gap-5 w-full max-w-md'>
				<div className='w-full'>
					<GoBackButton />
				</div>

				<div className='w-full space-y-2 text-center'>
					<h1 className='font-bold text-xl'>
						{method === 'sms'
							? 'Verify phone number'
							: 'Verify via Email'}
					</h1>
					<p className='font-light text-foreground/50'>
						We have sent a 6-digit code to{' '}
						{method === 'sms' ? phone : email} via{' '}
						<span className='text-primary'>
							{method === 'sms' ? 'SMS' : 'Email'}
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
						<div className='w-full text-center flex flex-col gap-2 items-center justify-center'>
							<div className='flex gap-2 items-center'>
								<p className='text-sm text-foreground/50'>
									Didn’t get code?
								</p>
								<Button
									variant='link'
									size='sm'
									className='text-secondary'
									onClick={handleResendCode}
									disabled={isCounting || isLoading}>
									{requestOtpLoading || requestEmailOtpLoading
										? 'Sending...'
										: 'Resend code'}
								</Button>
							</div>

							<Button
								variant='link'
								size='sm'
								className='text-primary underline'
								onClick={handleSwitchMethod}
								disabled={isLoading}>
								{method === 'sms'
									? 'Try verifying via Email instead'
									: 'Verify via SMS instead'}
							</Button>
						</div>
					</div>
					<Button
						type='button'
						variant={'game'}
						onClick={handleVerify}
						className='w-full py-5'
						disabled={isLoading}>
						{isLoading
							? 'Verifying...'
							: `Verify ${method === 'sms' ? 'phone number' : 'email'}`}
					</Button>
				</div>
				<div className='w-full space-y-2'>
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
