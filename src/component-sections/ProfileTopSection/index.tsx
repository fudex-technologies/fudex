'use client';

import { buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { PAGES_DATA } from '@/data/pagesData';
import { ExtendedUser } from '@/lib/auth';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { BsChatLeftTextFill } from 'react-icons/bs';
import { FUDEX_PHONE_NUMBER } from '@/lib/staticData/contactData';
import {
	getDoodleAvatarUrl,
	getFullName,
	normalizePhoneNumber,
} from '@/lib/commonFunctions';
import { useOrderingActions } from '@/api-hooks/useOrderingActions';
import WalletBalanceComponent from './WalletBalanceComponent';

const ProfileTopSection = () => {
	const { data: session, isPending } = useSession();
	const { useGetNumberOfMyDeliveredOrders } = useOrderingActions();
	const numberOfDeliveredOrders = useGetNumberOfMyDeliveredOrders();
	const avatarUrl = getDoodleAvatarUrl(session?.user?.id);

	if (isPending && !session) {
		return <ProfileTopSectionSkeleton />;
	}
	return (
		<div className='flex flex-col items-center mb-10'>
			<div
				// style={{
				// 	backgroundImage: `url("/assets/profile-background.png")`,
				// }}
				className='min-h-[150px] py-10 w-full bg-center bg-cover flex justify-center relative bg-primary/12'>
				<a
					href={`https://wa.me/${normalizePhoneNumber(
						FUDEX_PHONE_NUMBER,
					)}?text=Hello%20FUDEX%20`}
					target='__blacnk'
					rel='noreferrer'
					className={cn(
						buttonVariants({
							className:
								'absolute top-6 right-5 bg-secondary text-white rounded-full px-5 py-3 mt-3',
						}),
					)}>
					<BsChatLeftTextFill />
					Help
				</a>

				<div className='w-fit flex flex-col gap-3 items-center'>
					<div className='w-[100px] h-[100px] p-1 bg-background rounded-full flex justify-center items-center'>
						<ImageWithFallback
							src={avatarUrl}
							className='rounded-full w-full] h-full object-cover object-center'
						/>
					</div>
					<div className='space-y-3 text-center flex flex-col items-center'>
						{session ? (
							<>
								<h1 className='font-bold text-lg'>
									{getFullName(session?.user as ExtendedUser)}
								</h1>
								<div className='px-3 py-1 w-fit flex items-center justify-center gap-1 border rounded-full bg-background'>
									<ImageWithFallback
										src={'/icons/FUDEX_2t.png'}
										className='w-7 h-auto object-contain'
									/>
									<p className='text-lg'>
										{numberOfDeliveredOrders}
									</p>
								</div>
							</>
						) : (
							<Link
								href={PAGES_DATA.onboarding_signup_page}
								className={cn(
									buttonVariants({
										variant: 'outline',
										className:
											'border-primary text-primary rounded-full px-5 py-3',
									}),
								)}>
								Sign up
							</Link>
						)}
					</div>
				</div>

				<WalletBalanceComponent className="absolute -bottom-5" />
			</div>
		</div>
	);
};

export default ProfileTopSection;

export const ProfileTopSectionSkeleton = () => {
	return (
		<div className='flex flex-col items-center'>
			<div className='h-[150px] w-full bg-gray-200 flex justify-center relative'>
				<div className='w-[100px] h-[100px] p-1 bg-background rounded-full absolute -bottom-[50px] flex justify-center items-center'>
					<Skeleton className='h-full w-full rounded-full' />
				</div>
			</div>

			<div className='mt-12 space-y-3 text-center flex flex-col items-center'>
				<Skeleton className='h-7 w-40' />
				<div className='px-3 py-1 w-fit flex items-center justify-center gap-1 border rounded-full'>
					<Skeleton className='h-7 w-7 rounded-full' />
					<Skeleton className='h-5 w-5' />
				</div>
			</div>
		</div>
	);
};
