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
import { normalizePhoneNumber } from '@/lib/commonFunctions';

const ProfileTopSection = () => {
	const { data: session, isPending } = useSession();

	const fullName =
		session?.user?.name ||
		`${(session?.user as ExtendedUser)?.lastName} ${
			(session?.user as ExtendedUser)?.firstName
		}`;

	const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(
		session?.user?.id || 3
	)}&backgroundColor=D63C12`;

	if (isPending && !session) {
		return <ProfileTopSectionSkeleton />;
	}
	return (
		<div className='flex flex-col items-center'>
			<div
				style={{
					backgroundImage: `url("/assets/profile-background.png")`,
				}}
				className='h-[150px] w-full bg-center bg-cover flex justify-center relative '>
				<a
					href={`https://wa.me/${normalizePhoneNumber(
						FUDEX_PHONE_NUMBER
					)}?text=Hello%20FUDEX%20`}
					target='__blacnk'
					rel='noreferrer'
					className={cn(
						buttonVariants({
							className:
								'absolute top-6 right-5 bg-background text-foreground rounded-full px-5 py-3 mt-3',
						})
					)}>
					<BsChatLeftTextFill />
					Help
				</a>

				<div className='w-[100px] h-[100px] p-1 bg-background rounded-full absolute -bottom-[50px] flex justify-center items-center'>
					<ImageWithFallback
						src={avatarUrl}
						className='rounded-full w-full] h-full object-cover object-center'
					/>
				</div>
			</div>

			<div className='mt-12 space-y-3 text-center flex flex-col items-center'>
				{session ? (
					<>
						<h1 className='font-bold text-lg'>{fullName}</h1>
						<div className='px-5 py-3 w-fit flex items-center justify-center gap-1 border rounded-full'>
							<ImageWithFallback
								src={'/icons/FUDEX_2t.png'}
								className='w-7 h-auto object-contain'
							/>
							<p className='text-lg'>2</p>
						</div>
					</>
				) : (
					<Link
						href={PAGES_DATA.onboarding_signup_page}
						className={cn(
							buttonVariants({
								variant: 'outline',
								className:
									'border-primary text-primary rounded-full px-5 py-3 mt-3',
							})
						)}>
						Sign up
					</Link>
				)}
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
				<div className='px-5 py-3 w-fit flex items-center justify-center gap-1 border rounded-full'>
					<Skeleton className='h-7 w-7 rounded-full' />
					<Skeleton className='h-5 w-5' />
				</div>
			</div>
		</div>
	);
};
