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
	};
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

export default function TransactionItem({ transaction }: TransactionItemProps) {
	const isCredit = transaction.type === WalletTransactionType.CREDIT;

	return (
		<div className='w-full flex items-center justify-between p-4 bg-white rounded-xl border border-foreground/5 hover:border-foreground/10 transition-colors group'>
			<div className='flex items-center gap-4'>
				<div
					className={cn(
						'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
						isCredit
							? 'bg-green-50 group-hover:bg-green-100'
							: 'bg-red-50 group-hover:bg-red-100',
					)}>
					{getSourceIcon(transaction.sourceType)}
				</div>
				<div className='flex flex-col'>
					<p className='font-semibold text-sm text-foreground'>
						{getSourceLabel(transaction.sourceType)}
					</p>
					<p className='text-xs text-foreground/50'>
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
				<p className='text-[10px] text-foreground/40 font-mono'>
					{transaction.reference.split('-').pop()}
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
