'use client';

import { Button } from '@/components/ui/button';
import { formatCurency } from '@/lib/commonFunctions';
import { Plus } from 'lucide-react';
import { WalletBalanceCardSkeleton } from './WalletBalanceCardSkeleton';
import { useWalletActions } from '@/api-hooks/useWalletActions';
import { useState } from 'react';
import FundWalletModal from './FundWalletModal';

export default function WalletBalanceCard() {
	const { useGetBalance } = useWalletActions();
	const { data: wallet, isLoading } = useGetBalance();
	const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);

	if (isLoading) return <WalletBalanceCardSkeleton />;

	return (
		<div className='w-full bg-black text-white p-6 rounded-2xl flex flex-col gap-6 shadow-xl relative overflow-hidden'>
			{/* Background Accent */}
			<div className='absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl' />

			<div className='space-y-1 relative z-10'>
				<p className='text-white/60 text-sm font-medium tracking-wide'>
					Available Balance
				</p>
				<p className='font-bold text-3xl tracking-tight'>
					{formatCurency(wallet?.balance ?? 0)}
				</p>
			</div>

			<Button
				onClick={() => setIsFundingModalOpen(true)}
				className='bg-white text-black hover:bg-white/90 font-semibold h-12 rounded-xl transition-all active:scale-95 group z-10'>
				<Plus className='mr-2 h-5 w-5 transition-transform group-hover:rotate-90' />
				Fund Wallet
			</Button>

			<FundWalletModal
				open={isFundingModalOpen}
				setOpen={setIsFundingModalOpen}
			/>
		</div>
	);
}

export { WalletBalanceCardSkeleton };
