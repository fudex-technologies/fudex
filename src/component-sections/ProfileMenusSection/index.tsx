'use client';

import { useProfileActions } from '@/api-hooks/useProfileActions';
import MenuListComponent from '@/components/MenuListComponnt';
import ConfirmLogoutModal from '@/components/Modals/ConfirmLogoutModal';
import { Skeleton } from '@/components/ui/skeleton';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { useSession } from '@/lib/auth-client';
import {
	Bell,
	CircleQuestionMark,
	Gift,
	Heart,
	LogOut,
	MapPin,
	Trash,
	User,
	Store,
	Shield,
	Settings,
} from 'lucide-react';
import { useState } from 'react';

const ProfileMenusSection = () => {
	const [confirmLogout, setConfirmLogout] = useState(false);
	const { data: session, isPending } = useSession();

	// Check if user is a vendor
	const { data: isVendor } = useProfileActions().isUserAVendor();
	// Check if user is an admin
	const { data: isAdmin } = useProfileActions().isUserAnAdmin();
	// Check if user is an operator
	const { data: isOperator } = useProfileActions().isUserAnOperator();

	if (isPending && !session) {
		return <ProfileMenusSectionSkeleton />;
	}
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
							protected: true,
							show: true,
						},
						{
							icon: <MapPin />,
							title: 'Addresses',
							link: PAGES_DATA.profile_addresses_page,
							protected: true,
							show: true,
						},
						{
							icon: <Heart />,
							title: 'My Favorite',
							link: PAGES_DATA.profile_favorites_page,
							protected: true,
							show: true,
						},
					]}
				/>
				{isVendor && (
					<MenuListComponent
						menuTitle='Vendor'
						menuItems={[
							{
								icon: <Store />,
								title: 'Vendor Dashboard',
								link: PAGES_DATA.vendor_dashboard_page,
								protected: true,
								show: true,
							},
						]}
					/>
				)}
				{isAdmin && (
					<MenuListComponent
						menuTitle='Admin'
						menuItems={[
							{
								icon: <Shield />,
								title: 'Admin Dashboard',
								link: PAGES_DATA.admin_dashboard_page,
								protected: true,
								show: true,
							},
						]}
					/>
				)}
				{isOperator && (
					<MenuListComponent
						menuTitle='Operator'
						menuItems={[
							{
								icon: <Settings />,
								title: 'Operator Dashboard',
								link: PAGES_DATA.operator_dashboard_page,
								protected: true,
								show: true,
							},
						]}
					/>
				)}

				<MenuListComponent
					menuTitle='Services'
					menuItems={[
						{
							icon: <Gift />,
							title: 'Promo codes',
							show: true,
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
							protected: true,
							show: true,
						},
						{
							icon: <CircleQuestionMark />,
							title: 'FAQ',
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
						{
							icon: <Trash />,
							title: 'Delete my account and data',
							onClick: () => {},
							protected: true,
							show: false,
						},
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

export default ProfileMenusSection;

export const ProfileMenusSectionSkeleton = () => {
	return (
		<SectionWrapper className='flex flex-col items-center'>
			<div className='max-w-lg w-full space-y-5'>
				<div className='space-y-3'>
					<Skeleton className='h-5 w-24' />
					<div className='space-y-2'>
						<Skeleton className='h-12 w-full' />
						<Skeleton className='h-12 w-full' />
						<Skeleton className='h-12 w-full' />
					</div>
				</div>

				<div className='space-y-3'>
					<Skeleton className='h-5 w-24' />
					<div className='space-y-2'>
						<Skeleton className='h-12 w-full' />
					</div>
				</div>

				<div className='space-y-3'>
					<Skeleton className='h-5 w-24' />
					<div className='space-y-2'>
						<Skeleton className='h-12 w-full' />
						<Skeleton className='h-12 w-full' />
					</div>
				</div>
			</div>
		</SectionWrapper>
	);
};
