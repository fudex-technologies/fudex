'use client';

import { useOrderingActions } from '@/api-hooks/useOrderingActions';
import MobileBottomNav from '@/components/navigation-components/MobileBottomNav';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClassNameValue } from 'tailwind-merge';

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { getTotalVendors, isCartEmpty } = useCartStore();
	const { useGetNumberOfMyOngoingOrders } = useOrderingActions();
	const numberofOngoingOrders = useGetNumberOfMyOngoingOrders();

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
				<div className='w-full flex justify-between items-center p-3 bg-muted text-muted-foreground/50 rounded-lg gap-3 font-semibold'>
					<Link
						href={PAGES_DATA.tray_page}
						className={cn(
							'flex-1 flex px-3 py-3 items-center justify-center rounded-lg text-nowrap whitespace-nowrap',
							isActiveStyle(PAGES_DATA.tray_page)
						)}>
						Tray {!isCartEmpty() && `(${getTotalVendors()})`}
					</Link>
					<Link
						href={PAGES_DATA.ongoing_orders_page}
						className={cn(
							'flex-1 flex px-3 py-3 items-center justify-center rounded-lg text-nowrap whitespace-nowrap',
							isActiveStyle(PAGES_DATA.ongoing_orders_page)
						)}>
						Ongoing{' '}
						{numberofOngoingOrders > 0 &&
							`(${numberofOngoingOrders})`}
					</Link>
					<Link
						href={PAGES_DATA.completed_orders_page}
						className={cn(
							'flex-1 flex px-3 py-3 items-center justify-center rounded-lg text-nowrap whitespace-nowrap',
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
