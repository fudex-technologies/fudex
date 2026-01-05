'use client';

import MobileBottomNav from '@/components/navigation-components/MobileBottomNav';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { Suspense } from 'react';
import SearchPageView from '@/component-sections/SearchPageView';

export default function SearchPage() {
	return (
		<PageWrapper className=''>
			<Suspense fallback={'loading...'}>
				<SearchPageView />
			</Suspense>
			<MobileBottomNav />
		</PageWrapper>
	);
}
