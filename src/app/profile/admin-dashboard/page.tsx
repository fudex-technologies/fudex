'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';

export default function AdminDashboardPage() {
	const router = useRouter();

	useEffect(() => {
		router.push(PAGES_DATA.admin_dashboard_areas_page);
	}, [router]);

	return null;
}

