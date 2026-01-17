'use client';

import { Button } from '@/components/ui/button';
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from '@/components/ui/input-otp';
import VendorOnboardingFormsWrapper from '@/components/wrapers/VendorOnboardingFormsWrapper';
import { localStorageStrings } from '@/constants/localStorageStrings';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useVendorOnboardingActions } from '@/api-hooks/useVendorOnboardingActions';
import { PAGES_DATA } from '@/data/pagesData';

export default function VendorOnboardingVerifyEmail() {
	const router = useRouter();
	const [otp, setOtp] = useState('');
	const [email, setEmail] = useState('');
	const [countdown, setCountdown] = useState(60);
	const [isCounting, setIsCounting] = useState(true);

	const { requestEmailVerification, verifyEmailOtp } =
		useVendorOnboardingActions();

	const { mutate: requestOtpMutate, isPending: requestOtpLoading } =
		requestEmailVerification({
			onSuccess: () => {
				setCountdown(60);
				setIsCounting(true);
			},
		});

	const { mutate: verifyOtpMutate, isPending: verifyOtpLoading } =
		verifyEmailOtp({
			onSuccess: (data) => {
				// Check if user already exists
				if (data.isExistingUser) {
					// Existing user - skip password creation, go to terms
					router.push('/vendor-onboarding/vendor-terms');
				} else {
					// New user - needs to create password
					router.push('/vendor-onboarding/create-password');
				}
			},
		});

	// Load email from localStorage
	useEffect(() => {
		const raw = localStorage.getItem(
			localStorageStrings.vendorOnboardinPersonalDetailsstring
		);
		if (raw) {
			try {
				const obj = JSON.parse(raw);
				setEmail(obj.email || '');

				// Automatically request OTP when component mounts
				if (obj.email) {
					requestOtpMutate({ email: obj.email });
				}
			} catch (e) {
				console.error('Failed to load email:', e);
				// Redirect back if no data
				router.push('/vendor-onboarding/personal-details');
			}
		} else {
			// Redirect back if no data
			router.push('/vendor-onboarding/personal-details');
		}
	}, []);

	// Countdown timer
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
		if (!email || isCounting || requestOtpLoading) return;
		requestOtpMutate({ email });
	};

	const handleVerify = () => {
		if (!email || !otp || otp.length !== 6) return;
		verifyOtpMutate({ email, otp });
	};

	return (
		<VendorOnboardingFormsWrapper>
			<div className='flex flex-col gap-5 w-full max-w-md'>
				<div className='w-full space-y-2 text-center'>
					<h1 className='font-bold text-xl'>Verify your email</h1>
					<p className='font-light text-foreground/50'>
						Enter the OTP sent to your email{' '}
						<span className='text-primary'>{email}</span>
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
					<Button
						type='button'
						variant={'game'}
						onClick={handleVerify}
						className='w-full py-5'
						disabled={verifyOtpLoading || otp.length !== 6}>
						{verifyOtpLoading ? 'Verifying...' : 'Verify Email'}
					</Button>
				</div>
			</div>
		</VendorOnboardingFormsWrapper>
	);
}
