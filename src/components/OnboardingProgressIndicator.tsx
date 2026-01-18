'use client';

import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';
import { CheckCircle, Clock } from 'lucide-react';

export default function OnboardingProgressIndicator({
	completedSteps,
	totalSteps,
}: {
	completedSteps?: number;
	totalSteps?: number;
}) {
	return (
		<Link
			href={PAGES_DATA.vendor_onboarding_progress_page}
			className='ml-auto flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm'>
			<Clock size={16} className='text-primary' />
			<span className='font-medium text-primary'>
				{completedSteps !== undefined && totalSteps !== undefined
					? `${completedSteps}/${totalSteps} Complete`
					: 'View Progress'}
			</span>
		</Link>
	);
}
