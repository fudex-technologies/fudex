import { redirect } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';

export default function VendorDashboardPage() {
	// Redirect to profile tab by default
	redirect(PAGES_DATA.vendor_dashboard_profile_page);
}

