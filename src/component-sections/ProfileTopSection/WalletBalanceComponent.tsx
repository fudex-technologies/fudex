'use client';

import { useWalletActions } from '@/api-hooks/useWalletActions';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Skeleton } from '@/components/ui/skeleton';
import { PAGES_DATA } from '@/data/pagesData';
import { useSession } from '@/lib/auth-client';
import { formatCurency } from '@/lib/commonFunctions';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { BsEyeFill, BsEyeSlashFill } from 'react-icons/bs';
import { ClassNameValue } from 'tailwind-merge';
import { RotateCw } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard-store';

const WalletBalanceComponent = ({
	className,
}: {
	className?: ClassNameValue;
}) => {
	const { showBalance, setShowBalance } = useDashboardStore();
	const { useGetBalance } = useWalletActions();
	const { data: wallet, isLoading, refetch, isFetching } = useGetBalance();
	const { data: session, isPending } = useSession();

	if (isPending || isLoading) {
		return (
			<div
				className={cn(
					'w-fit p-2 rounded-md bg-secondary text-white flex items-center justify-center gap-3 animate-pulse',
					className,
				)}>
				<Skeleton className='h-7 w-7 rounded-full' />
				<Skeleton className='h-7 w-20' />
			</div>
		);
	}
	if (!session) return null;

	const handleRefresh = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		refetch();
	};

	return (
		<div
			className={cn(
				'w-fit p-2 rounded-md bg-secondary text-white font-bold flex items-center justify-center gap-3',
				className,
			)}>
			<ImageWithFallback
				src={'/assets/walleticon.png'}
				className='w-7 h-auto object-contain'
				alt='wallet'
			/>
			<Link href={PAGES_DATA.profile_wallet_page} className='text-[14px]'>
				{showBalance
					? `${formatCurency(wallet?.balance ?? 0)}.00`
					: '••••••'}
			</Link>

			<div className='flex items-center gap-2'>
				{showBalance ? (
					<BsEyeSlashFill
						className='text-background cursor-pointer'
						onClick={() => setShowBalance(!showBalance)}
					/>
				) : (
					<BsEyeFill
						className='text-background cursor-pointer'
						onClick={() => setShowBalance(!showBalance)}
					/>
				)}

				{/* <RotateCw
					size={14}
					className={cn(
						'text-background cursor-pointer transition-transform',
						isFetching && 'animate-spin',
					)}
					onClick={handleRefresh}
				/> */}
			</div>
		</div>
	);
};

export default WalletBalanceComponent;
