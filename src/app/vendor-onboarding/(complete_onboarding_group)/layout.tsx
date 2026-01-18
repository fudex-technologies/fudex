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
	const { data: progress } = useQuery(
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
		if (progress && !progress.hasVendor) {
			router.push(PAGES_DATA.vendor_onboarding_personal_details_page);
		}
	}, [progress, router]);

	return <>{children}</>;
}
