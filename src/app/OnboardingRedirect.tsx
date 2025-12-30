'use client';

import { PAGES_DATA } from '@/data/pagesData';
import { useSession } from '@/lib/auth-client';
import { useDashboardStore } from '@/store/dashboard-store';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const OnboardingRedirect = () => {
	const { hasSeenOnboarding, setHasSeenOnboarding } = useDashboardStore();
	const { data: session, isPending } = useSession();
	const router = useRouter();
	const pathname = usePathname();

	const isInPath = pathname === '/';

	useEffect(() => {
		if (hasSeenOnboarding || !isInPath) return;
		if (!hasSeenOnboarding && !session && !isPending) {
			router.replace(PAGES_DATA.onboarding_step_one_page);
			setHasSeenOnboarding(true);
		}
	}, [hasSeenOnboarding, session, isPending]);

	if (hasSeenOnboarding || !isInPath) return null;
	if (!session && !hasSeenOnboarding && isPending) {
		return (
			<div className='h-screen w-screen fixed top-0 left-0 flex items-center justify-center bg-foreground/50 bg-blend-saturation'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
				</div>
			</div>
		);
	}
	return null;
};

export default OnboardingRedirect;
