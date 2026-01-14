'use client';

import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import MenuListComponent from '@/components/MenuListComponnt';
import ConfirmLogoutModal from '@/components/Modals/ConfirmLogoutModal';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { FUDEX_PHONE_NUMBER } from '@/lib/staticData/contactData';
import {
	CalendarClock,
	CircleQuestionMark,
	Headset,
	Heart,
	LogOut,
	MapPin,
	User,
	Wallet2,
} from 'lucide-react';
import { useState } from 'react';

const VendorDashboardProfileMenu = () => {
	const [confirmLogout, setConfirmLogout] = useState(false);
	const { useGetMyVendor } = useVendorDashboardActions();
	const { data: vendor } = useGetMyVendor();

	return (
		<SectionWrapper className='flex flex-col items-center'>
			<div className='max-w-lg w-full space-y-5'>
				<MenuListComponent
					menuTitle='Business Info'
					menuItems={[
						{
							icon: <User />,
							title: 'Business details',
							link: PAGES_DATA.vendor_dashboard_profile_details_page,
							protected: true,
							show: true,
						},
						{
							icon: <MapPin />,
							title: 'Addresses & location',
							link: PAGES_DATA.vendor_dashboard_profile_addresses_page,
							protected: true,
							show: true,
						},
						{
							icon: <CalendarClock />,
							title: 'Opening hours',
							link: PAGES_DATA.vendor_dashboard_profile_opening_hours_page,
							protected: true,
							show: true,
						},
					]}
				/>
				<MenuListComponent
					menuTitle='Orders Performance'
					menuItems={[
						{
							icon: <Heart />,
							title: 'Ratings & reviews',
							link: PAGES_DATA.single_vendor_reviews_page(
								vendor?.id || ''
							),
							protected: true,
							show: true,
						},
					]}
				/>
				<MenuListComponent
					menuTitle='Payouts & Earnings'
					menuItems={[
						{
							icon: <Wallet2 />,
							title: 'Bank details',
							link: PAGES_DATA.vendor_dashboard_profile_bank_details_page,
							protected: true,
							show: true,
						},
						{
							icon: <Wallet2 />,
							title: 'Earning summary',
							link: PAGES_DATA.vendor_dashboard_payouts_history_page,
							protected: true,
							show: true,
						},
					]}
				/>
				<MenuListComponent
					menuTitle='More'
					menuItems={[
						{
							icon: <Headset />,
							title: 'Contect support',
							// link: PAGES_DATA.profile_notifications_page,
							protected: false,
							show: true,
							onClick: () => {
								const encodedMessage =
									encodeURIComponent('Hi FUDEX');
								const url = `https://wa.me/${FUDEX_PHONE_NUMBER}${
									encodedMessage
										? `?text=${encodedMessage}`
										: ''
								}`;
								window.open(url, '_blank');
							},
						},
						// {
						// 	icon: <Bell />,
						// 	title: 'Notifications',
						// 	link: PAGES_DATA.profile_notifications_page,
						// 	protected: true,
						// 	show: true,
						// },
						{
							icon: <CircleQuestionMark />,
							title: 'FAQs',
							link: PAGES_DATA.profile_faqs_page,
							show: true,
						},
						{
							icon: <LogOut />,
							title: 'Log Out',
							onClick: () => {
								setConfirmLogout(true);
							},
							protected: true,
							show: false,
						},
						// {
						// 	icon: <Trash />,
						// 	title: 'Delete my account and data',
						// 	onClick: () => {},
						// 	protected: true,
						// 	show: false,
						// },
					]}
				/>
			</div>
			<ConfirmLogoutModal
				open={confirmLogout}
				setOpen={setConfirmLogout}
			/>
		</SectionWrapper>
	);
};

export default VendorDashboardProfileMenu;
