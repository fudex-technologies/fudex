'use client';

import MobileBottomNav from '@/components/navigation-components/MobileBottomNav';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClassNameValue } from 'tailwind-merge';

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const pathname = usePathname();
	const isActiveStyle = (path: string): ClassNameValue => {
		if (pathname.startsWith(path))
			return 'bg-primary text-primary-foreground';
		return '';
	};
	return (
		<PageWrapper className=''>
			<div className='p-5'>
				<h1 className='text-center font-bold text-2xl py-5'>Orders</h1>
				<div className='w-full flex justify-between items-center p-3 bg-muted text-muted-foreground/50 rounded-lg gap-3 font-bold'>
					<Link
						href={PAGES_DATA.tray_page}
						className={cn(
							'flex-1 flex px-5 py-3 items-center justify-center rounded-lg',
							isActiveStyle(PAGES_DATA.tray_page)
						)}>
						Tray
					</Link>
					<Link
						href={PAGES_DATA.ongoing_orders_page}
						className={cn(
							'flex-1 flex px-5 py-3 items-center justify-center rounded-lg',
							isActiveStyle(PAGES_DATA.ongoing_orders_page)
						)}>
						Ongoing
					</Link>
					<Link
						href={PAGES_DATA.completed_orders_page}
						className={cn(
							'flex-1 flex px-5 py-3 items-center justify-center rounded-lg',
							isActiveStyle(PAGES_DATA.completed_orders_page)
						)}>
						Completed
					</Link>
				</div>
			</div>
			{children}
			<MobileBottomNav />
		</PageWrapper>
	);
}
