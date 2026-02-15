'use client';

import GoBackButton from '@/components/GoBackButton';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import WalletBalanceCard from '@/components/Wallet/WalletBalanceCard';
import TransactionItem, {
	TransactionItemSkeleton,
} from '@/components/Wallet/TransactionItem';
import { useWalletActions } from '@/api-hooks/useWalletActions';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';
import { ChevronRight } from 'lucide-react';

export default function WalletPage() {
	const { useGetTransactions } = useWalletActions();
	const { data: transactions, isLoading } = useGetTransactions({ limit: 7 });

	return (
		<PageWrapper className='flex flex-col items-center  min-h-screen'>
			<div className='flex items-center gap-10 w-full px-5 py-4 bg-background border-b'>
				<GoBackButton />
				<h1 className='font-semibold text-xl'>My Wallet</h1>
			</div>

			<SectionWrapper className='flex flex-col items-center max-w-lg w-full px-5 pt-6'>
				<div className='w-full space-y-8'>
					{/* Balance Card */}
					<WalletBalanceCard />

					{/* Transaction History Preview */}
					<div className='space-y-4'>
						<div className='flex items-center justify-between px-1'>
							<h2 className='font-bold text-lg'>
								Recent Transactions
							</h2>
							{transactions && transactions.items.length > 0 && (
								<Link
									href={
										PAGES_DATA.profile_wallet_transactions_page
									}
									className='text-primary text-sm font-semibold flex items-center gap-1 hover:underline'>
									View All
									<ChevronRight size={14} />
								</Link>
							)}
						</div>

						<div className='flex flex-col gap-3'>
							{isLoading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<TransactionItemSkeleton key={i} />
								))
							) : transactions &&
							  transactions.items.length > 0 ? (
								transactions.items.map((tx: any) => (
									<TransactionItem
										key={tx.id}
										transaction={tx}
									/>
								))
							) : (
								<div className='flex flex-col items-center justify-center py-10 text-foreground/40 gap-2'>
									<div className='w-16 h-16 rounded-full  flex items-center justify-center'>
										<ChevronRight
											size={24}
											className='rotate-90'
										/>
									</div>
									<p className='text-sm font-medium'>
										No transactions yet
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</SectionWrapper>
		</PageWrapper>
	);
}
