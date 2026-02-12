'use client';

import { useWalletActions } from '@/api-hooks/useWalletActions';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { usePaystackPayment } from 'react-paystack';

interface FundWalletModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
}

export default function FundWalletModal({
	open,
	setOpen,
}: FundWalletModalProps) {
	const [amount, setAmount] = useState<string>('');
	const { initializeFunding, useGetBalance } = useWalletActions();
	const { refetch: refetchBalance } = useGetBalance();
	const initFundingMutation = initializeFunding();

	const handleProceedToPayment = () => {
		const numAmount = parseFloat(amount);
		if (isNaN(numAmount) || numAmount <= 0) {
			toast.error('Please enter a valid amount');
			return;
		}

		initFundingMutation.mutate(
			{ amount: numAmount },
			{
				onSuccess: (data) => {
					// Initialize Paystack payment
					const config = {
						reference: data.providerRef,
						email: data.email,
						amount: data.amount * 100, // Paystack works in kobo
						publicKey:
							process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
					};

					// We need to use a separate component for Paystack because of the hook rules
					// but since it's a small app, we'll use a trick or just create a sub-component
					// For now, let's just use the direct initialization if possible or provide feedback
					// Actually, react-paystack hooks should be used at the top level of a component
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className='max-w-md rounded-2xl'>
				<DialogHeader>
					<DialogTitle className='text-xl font-bold'>
						Fund Wallet
					</DialogTitle>
					<DialogDescription>
						Enter the amount you would like to add to your Fudex
						wallet.
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

					<div className='grid grid-cols-3 gap-2'>
						{[1000, 2000, 5000].map((preset) => (
							<Button
								key={preset}
								variant='outline'
								onClick={() => setAmount(preset.toString())}
								className='rounded-xl h-10 border-foreground/10 hover:border-primary hover:text-primary'>
								₦{preset.toLocaleString()}
							</Button>
						))}
					</div>

					<PaystackWrapper
						amount={parseFloat(amount)}
						providerRef={initFundingMutation.data?.providerRef}
						email={initFundingMutation.data?.email}
						onSuccess={() => {
							setOpen(false);
							setAmount('');
							refetchBalance();
							toast.success('Wallet funding successful!');
						}}
						onClose={() => {
							toast.info('Payment cancelled');
						}}>
						<Button
							onClick={handleProceedToPayment}
							disabled={initFundingMutation.isPending}
							className='w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-lg'>
							{initFundingMutation.isPending
								? 'Initializing...'
								: 'Proceed to Payment'}
						</Button>
					</PaystackWrapper>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function PaystackWrapper({
	amount,
	providerRef,
	email,
	children,
	onSuccess,
	onClose,
}: any) {
	const config = {
		reference: providerRef || '',
		email: email || '',
		amount: amount * 100,
		publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
	};

	const initializePayment = usePaystackPayment(config);

	const handleSuccess = (reference: any) => {
		onSuccess(reference);
	};

	const handleClose = () => {
		onClose();
	};

	if (providerRef) {
		// Trigger payment automatically when we have the ref
		// In a real scenario, you might want to wait for user to click or use useEffect
		setTimeout(() => {
			initializePayment({
				onSuccess: handleSuccess,
				onClose: handleClose,
			});
		}, 100);
	}

	return children;
}
