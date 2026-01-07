'use client';

import { PAGES_DATA } from '@/data/pagesData';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function ProtectedPRofileRouteGroupLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { data: session, isPending, error } = useSession();
	const router = useRouter();

	useEffect(() => {
		// If user is not authenticated, redirect to sign-in
		if ((!session?.user || error) && !isPending) {
			toast.warning('Please Login first!');
			router.push(PAGES_DATA.profile_page);
			return;
		}
	}, [session]);

	// Show loading state while checking authentication and access
	if (!session) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
					<p className='text-gray-600 dark:text-gray-400'>
						Verifying access...
					</p>
				</div>
			</div>
		);
	}
	return <>{children}</>;
}
