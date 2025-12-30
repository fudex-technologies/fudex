'use client';

import { PAGES_DATA } from '@/data/pagesData';
import { useDashboardStore } from '@/store/dashboard-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const OnboardingRedirect = () => {
	const { hasSeenOnboarding, setHasSeenOnboarding } = useDashboardStore();
	const router = useRouter();

	useEffect(() => {
		if (hasSeenOnboarding) return;
		if (!hasSeenOnboarding) {
			router.replace(PAGES_DATA.onboarding_step_one_page);
			setHasSeenOnboarding(true);
		}
	}, [hasSeenOnboarding]);

	return null;
};

export default OnboardingRedirect;
