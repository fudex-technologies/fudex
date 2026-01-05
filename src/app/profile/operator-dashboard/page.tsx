'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';

export default function OperatorDashboardPage() {
	const router = useRouter();

	useEffect(() => {
		router.push(PAGES_DATA.operator_dashboard_orders_page);
	}, [router]);

	return null;
}

