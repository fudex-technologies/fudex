'use client';

import { GoHome } from 'react-icons/go';
import { GoSearch } from 'react-icons/go';
import { GoPackage } from 'react-icons/go';
import { FaRegUser } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClassNameValue } from 'tailwind-merge';
import { cn } from '@/lib/utils';
import { PAGES_DATA } from '@/data/pagesData';

const MobileBottomNav = () => {
	const pathname = usePathname();
	const isActive = (baseUrl: string): ClassNameValue => {
		if (baseUrl !== PAGES_DATA.home_page && pathname.startsWith(baseUrl)) {
			return 'text-primary';
		} else if (
			baseUrl === PAGES_DATA.home_page &&
			pathname === PAGES_DATA.home_page
		) {
			return 'text-primary';
		} else {
			return 'text-foreground';
		}
	};

	return (
		<>
			<div className='mb-[110px]' />
			<div className='fixed flex md:hidden bottom-0 left-0 w-screen bg-background border-t border-t-[#85858540] h-[100px] text-[#858585]'>
				<Link
					href={PAGES_DATA.home_page}
					className={cn(
						'flex flex-1 flex-col justify-center items-center',
						isActive(PAGES_DATA.home_page)
					)}>
					<GoHome width={20} height={20} className='w-5 h-5' />
					<p className=''>Home</p>
				</Link>
				<Link
					href={PAGES_DATA.search_page}
					className={cn(
						'flex flex-1 flex-col justify-center items-center',
						isActive(PAGES_DATA.search_page)
					)}>
					<GoSearch width={20} height={20} className='w-5 h-5' />
					<p className=''>Search</p>
				</Link>
				<Link
					href={PAGES_DATA.orders_page}
					className={cn(
						'flex flex-1 flex-col justify-center items-center',
						isActive(PAGES_DATA.orders_page)
					)}>
					<GoPackage width={20} height={20} className='w-5 h-5' />
					<p className=''>Orders</p>
				</Link>
				<Link
					href={PAGES_DATA.profile_page}
					className={cn(
						'flex flex-1 flex-col justify-center items-center',
						isActive(PAGES_DATA.profile_page)
					)}>
					<FaRegUser width={20} height={20} className='w-5 h-5' />
					<p className=''>Profile</p>
				</Link>
			</div>
		</>
	);
};

export default MobileBottomNav;
