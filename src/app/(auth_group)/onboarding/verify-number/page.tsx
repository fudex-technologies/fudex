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
import { useTRPC } from '@/trpc/client';
import { localStorageStrings } from '@/constants/localStorageStrings';
import { useAuthActions } from '@/api-hooks/useAuthActions';
import { useSession } from '@/lib/auth-client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function VerifyPhonePage() {
	const router = useRouter();
	const [otp, setOtp] = useState('');
	const [phone, setPhone] = useState('');
	const [countdown, setCountdown] = useState(60);
	const [isCounting, setIsCounting] = useState(true);

	const { verifyPhoneOtp, requestPhoneOtp } = useAuthActions();
	const trpc = useTRPC();
	const { data: session } = useSession();

	const attachPhoneMut = useMutation(
		trpc.phoneAuth.attachVerifiedPhone.mutationOptions({
			onSuccess: () => {
				toast.success('Phone attached');
				router.replace(PAGES_DATA.profile_page);
			},
			onError: (err: unknown) => {
				toast.error('Failed to attach phone', {
					description: err instanceof Error ? err.message : 'Something went wrong',
				});
			},
			retry: false,
		})
	);

	const { mutate: verifyOtpMutate, isPending: verifyOtpLoading } =
		verifyPhoneOtp({
			silent: false,
			onSuccess: (data) => {
				// data.token is the verification token
				if (session) {
					// user is signed in via Google — attach the verified phone
					attachPhoneMut.mutate({ token: data?.token });
				} else {
					router.push(PAGES_DATA.onboarding_create_password_page);
				}
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

	useEffect(() => {
		const raw = localStorage.getItem(
			localStorageStrings.onboardingSignupString
		);
		if (raw) {
			try {
				const obj = JSON.parse(raw);
				setPhone(obj.phone || '');
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
		requestOtpMutate({ phone });
	};

	const handleVerify = () => {
		verifyOtpMutate({ otp, phone });
	};

	return (
		<AuthPageWrapper>
			<div className='flex flex-col gap-5 w-full max-w-md'>
				<div className='w-full'>
					<GoBackButton />
				</div>

				<div className='w-full space-y-2 text-center'>
					<h1 className='font-bold text-xl'>Verify phone number</h1>
					<p className='font-light text-foreground/50'>
						We have sent a 4-digit code to {phone} via{' '}
						<span className='text-primary'>SMS</span> and{' '}
						<span className='text-primary'>Whatsapp</span>
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
								<InputOTPSlot index={2} />
							</InputOTPGroup>
							<InputOTPSeparator />
							<InputOTPGroup>
								<InputOTPSlot index={3} />
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
								Didn’t get code?
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
						disabled={verifyOtpLoading}>
						{verifyOtpLoading
							? 'Verifying...'
							: 'Verify phone number'}
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
