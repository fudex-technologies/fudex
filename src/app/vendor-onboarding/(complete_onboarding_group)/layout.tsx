'use client';

import { PAGES_DATA } from '@/data/pagesData';
import { useSession } from '@/lib/auth-client';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VendorOnboardingProgressLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, isPending: isSessionLoading } = useSession();
	const router = useRouter();
	const trpc = useTRPC();

	// Fetch onboarding progress
	const { data: progress, isLoading: isProgressLoading } = useQuery(
		trpc.vendors.getVendorOnboardingProgress.queryOptions(undefined, {
			enabled: !!session?.user,
			retry: false,
		}),
	);

	// Redirect if user is not logged in
	useEffect(() => {
		if (!isSessionLoading && !session?.user) {
			router.push(PAGES_DATA.vendor_onboarding_personal_details_page);
		}
	}, [session, isSessionLoading, router]);

	// Redirect if no vendor account exists
	useEffect(() => {
		if (!isProgressLoading && progress && !progress.hasVendor) {
			router.push(PAGES_DATA.vendor_onboarding_personal_details_page);
		}
	}, [progress, isProgressLoading, router]);

	if (isSessionLoading || (session?.user && isProgressLoading)) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<div className='flex flex-col items-center gap-4'>
					<div className='h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
					<p className='text-foreground/60 animate-pulse'>
						Loading your progress...
					</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
