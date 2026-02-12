'use client';

import { useAdminActions } from '@/api-hooks/useAdminActions';
import { useWalletActions } from '@/api-hooks/useWalletActions';
import { formatCurency } from '@/lib/commonFunctions';
import { format } from 'date-fns';
import {
	Search,
	Wallet,
	ArrowUpDown,
	User,
	ExternalLink,
	RefreshCcw,
	Plus,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TabComponent from '@/components/TabComponent';
import { Skeleton } from '@/components/ui/skeleton';
import CreditWalletModal from '@/components/Wallet/CreditWalletModal';
import TransactionItem, {
	TransactionItemSkeleton,
} from '@/components/Wallet/TransactionItem';

export default function AdminWalletsSection() {
	const [activeSubTab, setActiveSubTab] = useState('transactions');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedUser, setSelectedUser] = useState<any>(null);
	const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

	const {
		useInfiniteListWalletTransactions,
		useInfiniteListUsersWithBalances,
	} = useAdminActions();

	return (
		<div className='flex flex-col w-full min-h-screen bg-background pb-20'>
			<div className='p-5 space-y-4'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-2xl font-bold'>
							Wallet Management
						</h1>
						<p className='text-sm text-foreground/60'>
							Audit transactions and manage user balances
						</p>
					</div>
				</div>

				<TabComponent
					activeTab={activeSubTab}
					setActiveTab={setActiveSubTab}
					tabs={[
						{
							id: 'transactions',
							label: 'All Transactions',
							icon: <ArrowUpDown size={16} />,
						},
						{
							id: 'balances',
							label: 'User Balances',
							icon: <User size={16} />,
						},
					]}
					className='border-b'
				/>

				<div className='relative'>
					<Search
						className='absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40'
						size={18}
					/>
					<Input
						placeholder={
							activeSubTab === 'transactions'
								? 'Search by User ID...'
								: 'Search users by name, email or phone...'
						}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='pl-10 h-11 rounded-xl'
					/>
				</div>

				{activeSubTab === 'transactions' ? (
					<TransactionsList query={searchQuery} />
				) : (
					<BalancesList
						query={searchQuery}
						onCredit={(user) => {
							setSelectedUser(user);
							setIsCreditModalOpen(true);
						}}
					/>
				)}
			</div>

			<CreditWalletModal
				open={isCreditModalOpen}
				setOpen={setIsCreditModalOpen}
				user={selectedUser}
				onSuccess={() => {
					// Refetching is handled by the lists themselves typically via invalidate
				}}
			/>
		</div>
	);
}

function TransactionsList({ query }: { query: string }) {
	const { useInfiniteListWalletTransactions } = useAdminActions();
	const { ref, inView } = useInView();

	// Debounce query handling could be added here
	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
	} = useInfiniteListWalletTransactions({
		limit: 20,
		userId: query.length > 20 ? query : undefined, // Simple check to see if it's likely a UUID
	});

	useEffect(() => {
		if (inView && hasNextPage) fetchNextPage();
	}, [inView, hasNextPage, fetchNextPage]);

	const transactions = data?.pages.flatMap((p) => p.items) || [];

	if (isLoading)
		return (
			<div className='space-y-3 pt-4'>
				{Array.from({ length: 10 }).map((_, i) => (
					<TransactionItemSkeleton key={i} />
				))}
			</div>
		);

	return (
		<div className='space-y-3 pt-4'>
			<div className='flex justify-between items-center px-1'>
				<p className='text-xs font-bold text-foreground/40 uppercase tracking-wider'>
					Transaction History
				</p>
				<Button
					variant='ghost'
					size='sm'
					onClick={() => refetch()}
					className='h-8 text-xs gap-2'>
					<RefreshCcw size={14} /> Refresh
				</Button>
			</div>

			{transactions.length > 0 ? (
				<>
					{transactions.map((tx) => (
						<div key={tx.id} className='relative group'>
							<TransactionItem transaction={tx as any} />
							<div className='absolute right-4 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity'>
								<p className='text-[10px] text-foreground/40'>
									{tx.wallet.user.name ||
										tx.wallet.user.email}
								</p>
							</div>
						</div>
					))}
					<div ref={ref} className='py-4 flex justify-center'>
						{isFetchingNextPage && <TransactionItemSkeleton />}
					</div>
				</>
			) : (
				<EmptyState
					icon={<ArrowUpDown />}
					message='No transactions found'
				/>
			)}
		</div>
	);
}

function BalancesList({
	query,
	onCredit,
}: {
	query: string;
	onCredit: (user: any) => void;
}) {
	const { useInfiniteListUsersWithBalances } = useAdminActions();
	const { ref, inView } = useInView();

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteListUsersWithBalances({ limit: 20, q: query });

	useEffect(() => {
		if (inView && hasNextPage) fetchNextPage();
	}, [inView, hasNextPage, fetchNextPage]);

	const users = data?.pages.flatMap((p) => p.items) || [];

	if (isLoading)
		return (
			<div className='space-y-3 pt-4'>
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className='h-20 w-full rounded-xl' />
				))}
			</div>
		);

	return (
		<div className='space-y-3 pt-4'>
			<div className='flex justify-between items-center px-1'>
				<p className='text-xs font-bold text-foreground/40 uppercase tracking-wider'>
					User Portfolio
				</p>
			</div>

			{users.length > 0 ? (
				<>
					{users.map((user) => (
						<div
							key={user.id}
							className='p-4 bg-white rounded-xl border border-foreground/5 flex items-center justify-between hover:border-foreground/10 transition-colors'>
							<div className='flex items-center gap-4'>
								<div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold'>
									{(user.name || user.email)[0].toUpperCase()}
								</div>
								<div className='flex flex-col'>
									<p className='font-bold text-sm'>
										{user.name || 'Unnamed User'}
									</p>
									<p className='text-xs text-foreground/50'>
										{user.email}
									</p>
								</div>
							</div>

							<div className='flex items-center gap-6'>
								<div className='flex flex-col items-end'>
									<p className='font-bold text-base text-primary'>
										{formatCurency(user.walletBalance)}
									</p>
									<Badge
										variant={
											user.walletActive
												? 'outline'
												: 'secondary'
										}
										className='text-[10px] px-1.5 h-4'>
										{user.walletActive
											? 'Active'
											: 'Inactive'}
									</Badge>
								</div>

								<Button
									size='sm'
									variant='outline'
									onClick={() => onCredit(user)}
									className='h-9 rounded-lg gap-2 border-primary/20 text-primary hover:bg-primary/5'>
									<Plus size={14} /> Credit
								</Button>
							</div>
						</div>
					))}
					<div ref={ref} className='py-4'>
						{isFetchingNextPage && (
							<Skeleton className='h-20 w-full rounded-xl' />
						)}
					</div>
				</>
			) : (
				<EmptyState icon={<User />} message='No users found' />
			)}
		</div>
	);
}

function EmptyState({
	icon,
	message,
}: {
	icon: React.ReactNode;
	message: string;
}) {
	return (
		<div className='flex flex-col items-center justify-center py-20 text-foreground/30 gap-4'>
			<div className='p-5 rounded-full bg-foreground/5'>{icon}</div>
			<p className='text-sm font-medium'>{message}</p>
		</div>
	);
}
