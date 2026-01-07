'use client';

import { Button } from '@/components/ui/button';
import { PAGES_DATA } from '@/data/pagesData';
import { signIn } from '@/lib/auth-client';
import { FcGoogle } from 'react-icons/fc';
import { useState } from 'react';
import { toast } from 'sonner';
import { ClassNameValue } from 'tailwind-merge';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

const ContinueWithGoogleButton = ({
	className,
}: {
	className?: ClassNameValue;
}) => {
	const [loading, setLoading] = useState(false);
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get('redirect');

	const signInWithGoogle = async () => {
		return await signIn.social({
			provider: 'google',
			callbackURL: redirectTo || PAGES_DATA.home_page,
		});
	};

	const handleClick = async () => {
		try {
			setLoading(true);
			await signInWithGoogle();
			toast.success('Redirecting to Google...');
		} catch (err: any) {
			toast.error('Google sign-in failed', {
				description: err?.message || String(err),
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button
			variant={'outline'}
			className={cn('w-full py-5', className)}
			onClick={handleClick}
			disabled={loading}>
			<FcGoogle />
			Continue With Google
		</Button>
	);
};

export default ContinueWithGoogleButton;

export const ContinueWithGoogleButtonSkeleton = ({
	className,
}: {
	className?: ClassNameValue;
}) => {
	return (
		<Button
			variant={'outline'}
			className={cn('w-full py-5', className)}
			disabled={true}>
			<FcGoogle />
			Continue With Google
		</Button>
	);
};
