'use client';

import { Button } from '@/components/ui/button';
import { PAGES_DATA } from '@/data/pagesData';
import { signIn } from '@/lib/auth-client';
import { FcGoogle } from 'react-icons/fc';
import { useState } from 'react';
import { toast } from 'sonner';

const ContinueWithGoogleButton = () => {
	const [loading, setLoading] = useState(false);

	const signInWithGoogle = async () => {
		return await signIn.social({
			provider: 'google',
			callbackURL: PAGES_DATA.home_page,
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
			className='w-full py-5'
			onClick={handleClick}
			disabled={loading}>
			<FcGoogle />
			Continue With Google
		</Button>
	);
};

export default ContinueWithGoogleButton;
