'use client';

import EditAccountDrawer from '@/components/EditAccountDrawer';
import GoBackButton from '@/components/GoBackButton';
import PageWrapper from '@/components/wrapers/PageWrapper';
import EditNameForm from './EditNameForm';
import EditPhoneForm from './EditPhoneForm';
import EditEmailForm from './EditEmailForm';
import { usePRofileActions } from '@/api-hooks/useProfileActions';
import { getFullName } from '@/lib/commonFunctions';

export default function AccountPage() {
	const {
		data: profileData,
		isLoading: profileLoading,
		refetch,
	} = usePRofileActions().getProfile();
	const updateProfile = usePRofileActions().updateProfile({
		silent: false,
		onSuccess: () => {
			refetch();
		},
	});

	return (
		<PageWrapper className='px-5 flex flex-col items-center'>
			<div className='flex items-center gap-10 w-full'>
				<GoBackButton />
				<p className='font-semibold text-xl'>Account</p>
			</div>
			<div className='py-10 space-y-5 max-w-lg w-full'>
				<div className='space-y-3 w-full'>
					<p className='font-light text-foreground/50'>
						Account name
					</p>
					<div className='flex items-center justify-between p-5 border rounded-md text-foreground/50'>
						<p className=''>
							{profileLoading
								? 'Loading...'
								: getFullName(profileData) || 'Not Yet Set'}
						</p>
						<EditAccountDrawer
							editForm={
								<EditNameForm
									firstName={profileData?.firstName}
									lastName={profileData?.lastName}
									nickname={profileData?.name}
									updateProfile={updateProfile}
								/>
							}
						/>
					</div>
				</div>
				<div className='space-y-3 w-full'>
					<p className='font-light text-foreground/50'>
						Phone number
					</p>
					<div className='flex items-center justify-between p-5 border rounded-md text-foreground/50'>
						<p className=''>
							{profileLoading
								? 'Loading...'
								: profileData?.phone || 'Not Yet Set'}
						</p>
						<EditAccountDrawer
							editForm={
								<EditPhoneForm
									phone={profileData?.phone}
									updateProfile={updateProfile}
								/>
							}
						/>
					</div>
				</div>
				<div className='space-y-3 w-full'>
					<p className='font-light text-foreground/50'>Email</p>
					<div className='flex items-center justify-between p-5 border rounded-md text-foreground/50'>
						<p className=''>
							{profileLoading
								? 'Loading...'
								: profileData?.email || 'Not Yet Set'}
						</p>
						<EditAccountDrawer
							editForm={
								<EditEmailForm
									email={profileData?.email}
									updateProfile={updateProfile}
								/>
							}
						/>
					</div>
				</div>
			</div>
		</PageWrapper>
	);
}
