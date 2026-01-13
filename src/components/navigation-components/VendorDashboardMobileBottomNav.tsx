'use client';

import { GoHome } from 'react-icons/go';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClassNameValue } from 'tailwind-merge';
import { cn } from '@/lib/utils';
import { PAGES_DATA } from '@/data/pagesData';
import { GoHomeFill } from 'react-icons/go';
import { RiUser3Line } from 'react-icons/ri';
import { RiUser3Fill } from 'react-icons/ri';
import { RiShoppingBag2Line } from 'react-icons/ri';
import { RiShoppingBag2Fill } from 'react-icons/ri';
import { IoWalletOutline } from 'react-icons/io5';
import { IoWallet } from 'react-icons/io5';
import { PiHamburgerFill } from 'react-icons/pi';
import { PiHamburger } from 'react-icons/pi';

const VendorDashboardMobileBottomNav = () => {
	const pathname = usePathname();

	const activeStyle = (baseUrl: string): ClassNameValue => {
		if (
			baseUrl !== PAGES_DATA.vendor_dashboard_page &&
			pathname.startsWith(baseUrl)
		) {
			return 'text-primary';
		} else if (
			baseUrl === PAGES_DATA.vendor_dashboard_page &&
			pathname === PAGES_DATA.vendor_dashboard_page
		) {
			return 'text-primary';
		} else {
			return 'text-[#858585]';
		}
	};
	const isActive = (baseUrl: string) => {
		if (
			baseUrl !== PAGES_DATA.vendor_dashboard_page &&
			pathname.startsWith(baseUrl)
		) {
			return true;
		} else if (
			baseUrl === PAGES_DATA.vendor_dashboard_page &&
			pathname === PAGES_DATA.vendor_dashboard_page
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
					href={PAGES_DATA.vendor_dashboard_page}
					className={cn(
						'flex flex-1 flex-col justify-start pt-3 pb-5 items-center',
						activeStyle(PAGES_DATA.vendor_dashboard_page)
					)}>
					{isActive(PAGES_DATA.vendor_dashboard_page) ? (
						<GoHomeFill
							width={25}
							height={25}
							className={cn('w-5 h-5')}
						/>
					) : (
						<GoHome
							width={25}
							height={25}
							className={cn('w-5 h-5')}
							color='#858585'
						/>
					)}
					<p className='text-[14px]'>Home</p>
				</Link>

				<Link
					href={PAGES_DATA.vendor_dashboard_new_orders_page}
					className={cn(
						'flex flex-1 flex-col justify-start pt-3 pb-5 items-center',
						activeStyle(PAGES_DATA.vendor_dashboard_orders_page)
					)}>
					{isActive(PAGES_DATA.vendor_dashboard_orders_page) ? (
						<div className='relative'>
							<RiShoppingBag2Fill
								width={25}
								height={25}
								className={cn('w-5 h-5')}
							/>
						</div>
					) : (
						<div className='relative'>
							{/* {(!isCartEmpty() || numberofOngoingOrders > 0) && (
                                <Badge
                                    className='text-xs h-5 min-w-5 rounded-full px-1 font-mono tabular-nums absolute -top-3 -right-3'
                                    variant='destructive'>
                                    {getTotalVendors() + numberofOngoingOrders}
                                </Badge>
                            )} */}
							<RiShoppingBag2Line
								width={25}
								height={25}
								className={cn('w-5 h-5')}
								color='#858585'
							/>
						</div>
					)}

					<p className='text-[14px]'>Orders</p>
				</Link>

				<Link
					href={PAGES_DATA.vendor_dashboard_payouts_page}
					className={cn(
						'flex flex-1 flex-col justify-start pt-3 pb-5 items-center',
						activeStyle(PAGES_DATA.vendor_dashboard_payouts_page)
					)}>
					{isActive(PAGES_DATA.vendor_dashboard_payouts_page) ? (
						<div className='relative'>
							<IoWallet
								width={25}
								height={25}
								className={cn('w-5 h-5')}
							/>
						</div>
					) : (
						<div className='relative'>
							{/* {(!isCartEmpty() || numberofOngoingOrders > 0) && (
                                <Badge
                                    className='text-xs h-5 min-w-5 rounded-full px-1 font-mono tabular-nums absolute -top-3 -right-3'
                                    variant='destructive'>
                                    {getTotalVendors() + numberofOngoingOrders}
                                </Badge>
                            )} */}
							<IoWalletOutline
								width={25}
								height={25}
								className={cn('w-5 h-5')}
								color='#858585'
							/>
						</div>
					)}

					<p className='text-[14px]'>Payouts</p>
				</Link>

				<Link
					href={PAGES_DATA.vendor_dashboard_products_page}
					className={cn(
						'flex flex-1 flex-col justify-start pt-3 pb-5 items-center',
						activeStyle(PAGES_DATA.vendor_dashboard_products_page)
					)}>
					{isActive(PAGES_DATA.vendor_dashboard_products_page) ? (
						<div className='relative'>
							<PiHamburgerFill
								width={25}
								height={25}
								className={cn('w-5 h-5')}
							/>
						</div>
					) : (
						<div className='relative'>
							{/* {(!isCartEmpty() || numberofOngoingOrders > 0) && (
                                <Badge
                                    className='text-xs h-5 min-w-5 rounded-full px-1 font-mono tabular-nums absolute -top-3 -right-3'
                                    variant='destructive'>
                                    {getTotalVendors() + numberofOngoingOrders}
                                </Badge>
                            )} */}
							<PiHamburger
								width={25}
								height={25}
								className={cn('w-5 h-5')}
								color='#858585'
							/>
						</div>
					)}

					<p className='text-[14px]'>Menu</p>
				</Link>

				<Link
					href={PAGES_DATA.vendor_dashboard_profile_page}
					className={cn(
						'flex flex-1 flex-col justify-start pt-3 pb-5 items-center',
						activeStyle(PAGES_DATA.vendor_dashboard_profile_page)
					)}>
					{isActive(PAGES_DATA.vendor_dashboard_profile_page) ? (
						<RiUser3Fill
							width={25}
							height={25}
							className={cn('w-5 h-5')}
						/>
					) : (
						<RiUser3Line
							width={25}
							height={25}
							className={cn('w-5 h-5')}
							color='#858585'
						/>
					)}

					<p className='text-[14px]'>Profile</p>
				</Link>
			</div>
		</>
	);
};

export default VendorDashboardMobileBottomNav;
