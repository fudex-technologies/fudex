import GoBackButton from '@/components/GoBackButton';
import { Button } from '@/components/ui/button';
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from '@/components/ui/input-otp';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthActions } from '@/api-hooks/useAuthActions';
import { useProfileActions } from '@/api-hooks/useProfileActions';
import { PAGES_DATA } from '@/data/pagesData';

const ProfileVerifyPhonePageUi = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [otp, setOtp] = useState('');
	const [countdown, setCountdown] = useState(60);
	const [isCounting, setIsCounting] = useState(true);

	const { verifyProfileOtp, requestProfileOtp } = useAuthActions();
	const { getProfile } = useProfileActions();
	const { data: profile } = getProfile();
	const phone = profile?.phone;
	const redirectUrl = searchParams.get('redirect');

	const { mutate: verifyOtpMutate, isPending: verifyOtpLoading } =
		verifyProfileOtp({
			onSuccess: () => {
				if (redirectUrl) {
					router.push(redirectUrl);
				} else {
					router.push(PAGES_DATA.profile_page);
				}
			},
		});
	const { mutate: requestOtpMutate, isPending: requestOtpLoading } =
		requestProfileOtp({
			onSuccess: () => {
				setCountdown(60);
				setIsCounting(true);
			},
		});

	const otpRequestedRef = useRef(false);

	useEffect(() => {
		if (phone && !otpRequestedRef.current) {
			otpRequestedRef.current = true;
			requestOtpMutate(undefined); // No input needed for protected route
		}
	}, [phone, requestOtpMutate]);

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
		if (phone) {
			requestOtpMutate(undefined);
		}
	};

	const handleVerify = () => {
		if (phone) {
			verifyOtpMutate({ otp });
		}
	};

	return (
		<div className='flex flex-col gap-5 w-full max-w-md'>
			<div className='w-full'>
				<GoBackButton />
			</div>

			<div className='w-full space-y-2 text-center'>
				<h1 className='font-bold text-xl'>Verify phone number</h1>
				<p className='font-light text-foreground/50'>
					We have sent a 6-digit code to {phone} via{' '}
					<span className='text-primary'>SMS</span> and{' '}
					<span className='text-primary'>Whatsapp</span>
				</p>
			</div>

			<div className='flex flex-col gap-5'>
				<div className='w-full text-center gap-3 flex flex-col items-center'>
					<p className='font-light text-foreground/50'>Enter OTP</p>
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
							Didn’t get code?
						</p>
						<Button
							variant='link'
							size='sm'
							className='text-secondary'
							onClick={handleResendCode}
							disabled={isCounting || requestOtpLoading}>
							{requestOtpLoading ? 'Sending...' : 'Resend code'}
						</Button>
					</div>
				</div>
				<Button
					type='button'
					variant={'game'}
					onClick={handleVerify}
					className='w-full py-5'
					disabled={verifyOtpLoading}>
					{verifyOtpLoading ? 'Verifying...' : 'Verify phone number'}
				</Button>
			</div>
		</div>
	);
};

export default ProfileVerifyPhonePageUi;
