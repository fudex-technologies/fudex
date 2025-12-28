'use client';

import MenuListComponent from '@/components/MenuListComponnt';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { signOut } from '@/lib/auth-client';
import {
	Bell,
	CircleQuestionMark,
	Gift,
	Heart,
	LogOut,
	MapPin,
	Trash,
	User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const ProfileMenusSection = () => {
	const router = useRouter();

	const logoutandler = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					toast.success('Logged out');
					router.push(PAGES_DATA.home_page); // redirect to login page
				},
			},
		});
	};
	return (
		<SectionWrapper className='flex flex-col items-center'>
			<div className='max-w-lg w-full space-y-5'>
				<MenuListComponent
					menuTitle='Personal'
					menuItems={[
						{
							icon: <User />,
							title: 'Account',
							link: PAGES_DATA.profile_account_page,
						},
						{
							icon: <MapPin />,
							title: 'Addresses',
							link: PAGES_DATA.profile_addresses_page,
						},
						{
							icon: <Heart />,
							title: 'My Favorite',
							link: PAGES_DATA.profile_favorites_page,
						},
					]}
				/>

				<MenuListComponent
					menuTitle='Services'
					menuItems={[
						{
							icon: <Gift />,
							title: 'Promo codes',
						},
					]}
				/>

				<MenuListComponent
					menuTitle='More'
					menuItems={[
						{
							icon: <Bell />,
							title: 'Notifications',
							link: PAGES_DATA.profile_notifications_page,
						},
						{
							icon: <CircleQuestionMark />,
							title: 'FAQ',
							link: PAGES_DATA.profile_faqs_page,
						},
						{
							icon: <LogOut />,
							title: 'Log Out',
							onClick: () => {
								logoutandler();
							},
						},
						{
							icon: <Trash />,
							title: 'Delete my account and data',
							onClick: () => {},
						},
					]}
				/>
			</div>
		</SectionWrapper>
	);
};

export default ProfileMenusSection;
