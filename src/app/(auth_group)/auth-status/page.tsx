'use client';

import { buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import { useAuthStatusStore } from '@/store/auth-atatus-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthStatusPage() {
	const { type, status, setAuthStatus } = useAuthStatusStore();
	const router = useRouter();

	useEffect(() => {
		if (!type && !status) {
			router.replace(PAGES_DATA.home_page);
		}
	}, [router, status, type]);

	const renderImg = () => {
		return status === 'success'
			? '/assets/successicon.png'
			: '/assets/failureicon.png';
	};
	const renderTitle = () => {
		return type === 'account-creation' && status === 'success'
			? 'Account created successfully!'
			: type === 'password-reset' && status === 'success'
			? 'Password reset successfully!'
			: 'Oops! Something went wrong.';
	};
	const renderbody = () => {
		return type === 'account-creation' && status === 'success'
			? 'Account created! Time to explore fresh meals and quick delivery.'
			: type === 'password-reset' && status === 'success'
			? 'You have successfully reset your password, click below to proceed to order food.'
			: 'Something went wrong while processing your request. Please try again.';
	};
	const renderButtonText = () => {
		return status === 'success' ? 'Proceed to order food' : 'Go back';
	};

	const handleButtonClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (status !== 'success') {
			e.preventDefault();
			router.back();
		}
		setAuthStatus({
			type: undefined,
			status: undefined,
		});
	};

	return (
		<div
			className={cn(
				'w-screen h-screen flex items-center justify-center p-10',
				status === 'success' ? 'bg-success' : 'bg-destructive'
			)}>
			<div className='w-full max-w-md p-5 sm:p-10 rounded-4xl bg-background flex flex-col gap-7 items-center'>
				<ImageWithFallback
					className='w-[100px] h-auto object-contain'
					src={renderImg()}
					alt='status_icon'
				/>
				<div className='space-y-5 text-center'>
					<h1 className='text-3xl font-bold text-foreground'>
						{renderTitle() ?? 'Success!'}
					</h1>
					{renderbody() && (
						<p className='text-foreground/50'>{renderbody()}</p>
					)}
				</div>
				<Link
					href={PAGES_DATA.home_page}
					onClick={handleButtonClick}
					className={cn(
						buttonVariants({
							className: 'w-full py-6 text-lg',
							variant: 'game',
						})
					)}>
					{renderButtonText()}
				</Link>
			</div>
		</div>
	);
}
