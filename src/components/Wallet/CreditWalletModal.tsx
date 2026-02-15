'use client';

import { useAdminActions } from '@/api-hooks/useAdminActions';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';

interface CreditWalletModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	user: { id: string; name: string | null; email: string } | null;
	onSuccess?: () => void;
}

export default function CreditWalletModal({
	open,
	setOpen,
	user,
	onSuccess,
}: CreditWalletModalProps) {
	const [amount, setAmount] = useState<string>('');
	const [reason, setReason] = useState<string>('');
	const { adminCreditWallet } = useAdminActions();
	const creditMutation = adminCreditWallet({
		onSuccess: () => {
			setOpen(false);
			setAmount('');
			setReason('');
			onSuccess?.();
		},
	});

	const handleCredit = () => {
		const numAmount = parseFloat(amount);
		if (isNaN(numAmount) || numAmount <= 0) {
			toast.error('Please enter a valid amount');
			return;
		}

		if (!user) return;

		creditMutation.mutate({
			userId: user.id,
			amount: numAmount,
			reason: reason || 'Admin Adjustment',
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className='max-w-md rounded-2xl'>
				<DialogHeader>
					<DialogTitle className='text-xl font-bold'>
						Credit User Wallet
					</DialogTitle>
					<DialogDescription>
						Adding funds to{' '}
						<strong>{user?.name || user?.email}</strong>'s wallet.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-6 pt-4'>
					<div className='space-y-2'>
						<label className='text-sm font-medium text-foreground/70'>
							Amount (₦)
						</label>
						<div className='relative'>
							<span className='absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50 font-bold'>
								₦
							</span>
							<Input
								type='number'
								placeholder='0.00'
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								className='pl-8 h-12 text-lg font-semibold rounded-xl'
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium text-foreground/70'>
							Reason / Reference
						</label>
						<Textarea
							placeholder='e.g. Compensation for order #123'
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							className='rounded-xl resize-none'
							rows={3}
						/>
					</div>

					<Button
						onClick={handleCredit}
						disabled={creditMutation.isPending || !amount}
						className='w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-lg'>
						{creditMutation.isPending
							? 'Processing...'
							: 'Credit Wallet'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
