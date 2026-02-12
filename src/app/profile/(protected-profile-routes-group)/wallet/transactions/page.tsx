'use client';

import GoBackButton from '@/components/GoBackButton';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import TransactionItem, {
	TransactionItemSkeleton,
} from '@/components/Wallet/TransactionItem';
import { useWalletActions } from '@/api-hooks/useWalletActions';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Wallet } from 'lucide-react';

export default function TransactionsPage() {
	const { useInfiniteTransactions } = useWalletActions();
	const { ref, inView } = useInView();

	const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useInfiniteTransactions({ limit: 20 });

	useEffect(() => {
		if (inView && hasNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, fetchNextPage]);

	const transactions = data?.pages.flatMap((page) => page.items) || [];

	return (
		<PageWrapper className='flex flex-col items-center bg-foreground/5 min-h-screen'>
			<div className='flex items-center gap-10 w-full px-5 py-4 bg-background border-b sticky top-0 z-20'>
				<GoBackButton />
				<h1 className='font-semibold text-xl'>Transaction History</h1>
			</div>

			<SectionWrapper className='flex flex-col items-center max-w-lg w-full px-5 pt-6 pb-10'>
				<div className='w-full flex flex-col gap-3'>
					{isLoading ? (
						Array.from({ length: 8 }).map((_, i) => (
							<TransactionItemSkeleton key={i} />
						))
					) : transactions.length > 0 ? (
						<>
							{transactions.map((tx: any) => (
								<TransactionItem key={tx.id} transaction={tx} />
							))}

							{/* Load More Trigger */}
							<div
								ref={ref}
								className='w-full py-4 flex justify-center'>
								{isFetchingNextPage && (
									<TransactionItemSkeleton />
								)}
							</div>
						</>
					) : (
						<div className='flex flex-col items-center justify-center py-20 text-foreground/40 gap-4'>
							<div className='w-20 h-20 rounded-full bg-foreground/5 flex items-center justify-center'>
								<Wallet size={32} />
							</div>
							<div className='text-center'>
								<p className='font-bold text-lg text-foreground'>
									No history yet
								</p>
								<p className='text-sm'>
									Your wallet transactions will appear here
								</p>
							</div>
						</div>
					)}
				</div>
			</SectionWrapper>
		</PageWrapper>
	);
}
