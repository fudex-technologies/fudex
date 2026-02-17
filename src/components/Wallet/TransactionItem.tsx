'use client';

import { WalletTransactionSource, WalletTransactionType } from '@prisma/client';
import { format } from 'date-fns';
import { formatCurency } from '@/lib/commonFunctions';
import {
	ArrowDownLeft,
	ArrowUpRight,
	ShieldCheck,
	Wallet,
	ShoppingBag,
	Box,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionItemProps {
	transaction: {
		id: string;
		amount: number;
		type: WalletTransactionType;
		sourceType: WalletTransactionSource;
		reference: string;
		createdAt: Date;
		wallet?: {
			user: {
				name: string | null;
				email: string | null;
			};
		};
	};
	showUser?: boolean;
}

const getSourceIcon = (source: WalletTransactionSource) => {
	switch (source) {
		case WalletTransactionSource.WALLET_FUNDING:
			return <Wallet className='w-5 h-5 text-green-600' />;
		case WalletTransactionSource.ORDER_PAYMENT:
			return <ShoppingBag className='w-5 h-5 text-blue-600' />;
		case WalletTransactionSource.PACKAGE_PAYMENT:
			return <Box className='w-5 h-5 text-purple-600' />;
		case WalletTransactionSource.REFUND:
			return <ArrowDownLeft className='w-5 h-5 text-orange-600' />;
		case WalletTransactionSource.ADMIN_ADJUSTMENT:
			return <ShieldCheck className='w-5 h-5 text-gray-600' />;
		default:
			return <Wallet className='w-5 h-5 text-gray-600' />;
	}
};

const getSourceLabel = (source: WalletTransactionSource) => {
	return source
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function TransactionItem({
	transaction,
	showUser,
}: TransactionItemProps) {
	const isCredit = transaction.type === WalletTransactionType.CREDIT;

	return (
		<div className='w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors group'>
			<div className='flex items-center gap-4'>
				<div
					className={cn(
						'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
						isCredit
							? 'bg-green-500/10 group-hover:bg-green-500/20'
							: 'bg-red-500/10 group-hover:bg-red-500/20',
					)}>
					{getSourceIcon(transaction.sourceType)}
				</div>
				<div className='flex flex-col'>
					<div className='flex items-center gap-2'>
						<p className='font-semibold text-sm text-foreground'>
							{getSourceLabel(transaction.sourceType)}
						</p>
						{showUser && transaction.wallet?.user && (
							<span className='text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground'>
								{transaction.wallet.user.name ||
									transaction.wallet.user.email}
							</span>
						)}
					</div>
					<p className='text-xs text-muted-foreground'>
						{format(
							new Date(transaction.createdAt),
							'MMM d, yyyy • h:mm a',
						)}
					</p>
				</div>
			</div>

			<div className='flex flex-col items-end gap-1'>
				<p
					className={cn(
						'font-bold text-sm',
						isCredit ? 'text-green-600' : 'text-red-600',
					)}>
					{isCredit ? '+' : '-'}
					{formatCurency(transaction.amount)}
				</p>
				<p className='text-[10px] text-muted-foreground font-mono'>
					Ref: {transaction.reference.split('-').pop()}
				</p>
			</div>
		</div>
	);
}

export function TransactionItemSkeleton() {
	return (
		<div className='w-full flex items-center justify-between p-4 bg-white rounded-xl border border-foreground/5 animate-pulse'>
			<div className='flex items-center gap-4'>
				<div className='w-12 h-12 rounded-full bg-foreground/5' />
				<div className='flex flex-col gap-2'>
					<div className='h-4 w-24 bg-foreground/5 rounded' />
					<div className='h-3 w-32 bg-foreground/5 rounded' />
				</div>
			</div>
			<div className='flex flex-col items-end gap-2'>
				<div className='h-4 w-16 bg-foreground/5 rounded' />
				<div className='h-2 w-12 bg-foreground/5 rounded' />
			</div>
		</div>
	);
}
