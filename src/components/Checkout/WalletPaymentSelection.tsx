'use client';

import { useWalletActions } from '@/api-hooks/useWalletActions';
import { formatCurency } from '@/lib/commonFunctions';
import { Switch } from '@/components/ui/switch';
import { Wallet, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';

interface WalletPaymentSelectionProps {
	onWalletAmountChange: (amount: number) => void;
	walletAmount: number;
	totalAmount: number;
}

export default function WalletPaymentSelection({
	onWalletAmountChange,
	walletAmount,
	totalAmount,
}: WalletPaymentSelectionProps) {
	const { useGetBalance } = useWalletActions();
	const { data: wallet, isLoading } = useGetBalance();

	const balance = wallet?.balance ?? 0;
	const isWalletApplied = walletAmount > 0;

	const handleToggle = (checked: boolean) => {
		if (checked) {
			// Apply min(balance, totalAmount)
			const amountToApply = Math.min(balance, totalAmount);
			onWalletAmountChange(amountToApply);
		} else {
			onWalletAmountChange(0);
		}
	};

	if (isLoading) return <WalletSelectionSkeleton />;

	return (
		<div className='w-full flex flex-col bg-white rounded-xl border border-foreground/5 overflow-hidden'>
			<div className='px-5 py-3 bg-muted/30 flex items-center justify-between border-b border-foreground/5'>
				<div className='flex items-center gap-2'>
					<Wallet size={18} className='text-primary' />
					<span className='font-bold text-sm'>Payment Method</span>
				</div>
				{balance === 0 && (
					<Link
						href={PAGES_DATA.profile_wallet_page}
						className='text-xs text-primary font-bold flex items-center gap-1 hover:underline'>
						<PlusCircle size={14} />
						Fund Wallet
					</Link>
				)}
			</div>

			<div className='p-5 flex items-center justify-between gap-4'>
				<div className='flex flex-col gap-1'>
					<p className='font-semibold text-sm'>Use Wallet Balance</p>
					<p
						className={cn(
							'text-xs font-medium',
							balance > 0 ? 'text-foreground/60' : 'text-red-500',
						)}>
						Available: {formatCurency(balance)}
					</p>
				</div>

				<div className='flex items-center gap-3'>
					{isWalletApplied && (
						<span className='text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full'>
							- {formatCurency(walletAmount)}
						</span>
					)}
					<Switch
						checked={isWalletApplied}
						onCheckedChange={handleToggle}
						disabled={balance <= 0}
					/>
				</div>
			</div>

			{isWalletApplied && balance < totalAmount && (
				<div className='px-5 pb-4'>
					<p className='text-[10px] text-foreground/40 leading-relaxed'>
						Your wallet balance will be used first. The remaining{' '}
						<strong>
							{formatCurency(totalAmount - walletAmount)}
						</strong>{' '}
						will be paid via Paystack.
					</p>
				</div>
			)}
		</div>
	);
}

function WalletSelectionSkeleton() {
	return (
		<div className='w-full flex flex-col bg-white rounded-xl border border-foreground/5 animate-pulse'>
			<div className='px-5 py-3 bg-muted/30 h-10' />
			<div className='p-5 flex items-center justify-between'>
				<div className='space-y-2'>
					<Skeleton className='h-4 w-32' />
					<Skeleton className='h-3 w-20' />
				</div>
				<Skeleton className='h-6 w-10 rounded-full' />
			</div>
		</div>
	);
}
