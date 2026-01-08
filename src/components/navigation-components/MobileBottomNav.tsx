'use client';

import { GoHome } from 'react-icons/go';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClassNameValue } from 'tailwind-merge';
import { cn } from '@/lib/utils';
import { PAGES_DATA } from '@/data/pagesData';
import { RiSearchLine } from 'react-icons/ri';
import { RiSearchFill } from 'react-icons/ri';
import { GoHomeFill } from 'react-icons/go';
import { RiUser3Line } from 'react-icons/ri';
import { RiUser3Fill } from 'react-icons/ri';
import { RiShoppingBag2Line } from 'react-icons/ri';
import { RiShoppingBag2Fill } from 'react-icons/ri';
import { useCartStore } from '@/store/cart-store';
import { Badge } from '../ui/badge';

const MobileBottomNav = () => {
	const pathname = usePathname();
	const { getTotalVendors, isCartEmpty } = useCartStore();

	const activeStyle = (baseUrl: string): ClassNameValue => {
		if (baseUrl !== PAGES_DATA.home_page && pathname.startsWith(baseUrl)) {
			return 'text-primary';
		} else if (
			baseUrl === PAGES_DATA.home_page &&
			pathname === PAGES_DATA.home_page
		) {
			return 'text-primary';
		} else {
			return 'text-[#858585]';
		}
	};
	const isActive = (baseUrl: string) => {
		if (baseUrl !== PAGES_DATA.home_page && pathname.startsWith(baseUrl)) {
			return true;
		} else if (
			baseUrl === PAGES_DATA.home_page &&
			pathname === PAGES_DATA.home_page
		) {
			return true;
		} else {
			return false;
		}
	};

	return (
		<>
			<div className='mb-[110px]' />
			<div className='fixed z-50 flex  bottom-0 left-0 w-screen bg-background border-t h-20 text-[#858585]'>
				<Link
					href={PAGES_DATA.home_page}
					className={cn(
						'flex flex-1 flex-col justify-start pt-3 pb-5 items-center',
						activeStyle(PAGES_DATA.home_page)
					)}>
					{isActive(PAGES_DATA.home_page) ? (
						<GoHomeFill
							width={20}
							height={20}
							className={cn('w-5 h-5')}
						/>
					) : (
						<GoHome
							width={20}
							height={20}
							className={cn('w-5 h-5')}
							color='#858585'
						/>
					)}
					<p className=''>Home</p>
				</Link>
				<Link
					href={PAGES_DATA.search_page}
					className={cn(
						'flex flex-1 flex-col justify-start pt-3 pb-5 items-center',
						activeStyle(PAGES_DATA.search_page)
					)}>
					{isActive(PAGES_DATA.search_page) ? (
						<RiSearchFill
							width={20}
							height={20}
							className={cn('w-5 h-5')}
						/>
					) : (
						<RiSearchLine
							width={20}
							height={20}
							className={cn('w-5 h-5')}
							color='#858585'
						/>
					)}

					<p className=''>Search</p>
				</Link>
				<Link
					href={PAGES_DATA.tray_page}
					className={cn(
						'flex flex-1 flex-col justify-start pt-3 pb-5 items-center',
						activeStyle(PAGES_DATA.orders_page)
					)}>
					{isActive(PAGES_DATA.orders_page) ? (
						<div className='relative'>
							<RiShoppingBag2Fill
								width={20}
								height={20}
								className={cn('w-5 h-5')}
							/>
						</div>
					) : (
						<div className='relative'>
							{!isCartEmpty() && (
								<Badge
									className='text-xs h-5 min-w-5 rounded-full px-1 font-mono tabular-nums absolute -top-3 -right-3'
									variant='destructive'>
									{getTotalVendors()}
								</Badge>
							)}
							<RiShoppingBag2Line
								width={20}
								height={20}
								className={cn('w-5 h-5')}
								color='#858585'
							/>
						</div>
					)}

					<p className=''>Orders</p>
				</Link>
				<Link
					href={PAGES_DATA.profile_page}
					className={cn(
						'flex flex-1 flex-col justify-start pt-3 pb-5 items-center',
						activeStyle(PAGES_DATA.profile_page)
					)}>
					{isActive(PAGES_DATA.profile_page) ? (
						<RiUser3Fill
							width={20}
							height={20}
							className={cn('w-5 h-5')}
						/>
					) : (
						<RiUser3Line
							width={20}
							height={20}
							className={cn('w-5 h-5')}
							color='#858585'
						/>
					)}

					<p className=''>Profile</p>
				</Link>
			</div>
		</>
	);
};

export default MobileBottomNav;
