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
import { useState, useEffect, useCallback } from 'react';
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
	const {
		initializeFunding,
		useGetBalance,
		useVerifyFunding,
		useGetTransactions,
	} = useWalletActions();
	const { refetch: refetchBalance } = useGetBalance();
	// Also get transactions refetch
	const { refetch: refetchTransactions } = useGetTransactions();
	const initFundingMutation = initializeFunding();
	const verifyFundingMutation = useVerifyFunding();

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
					console.log('Funding initialized:', data.providerRef);
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
						onSuccess={(response: any) => {
							toast.success(
								'Payment successful! Verifying with server...',
							);
							setAmount('');

							const reference = response.reference;

							verifyFundingMutation.mutate(
								{ reference },
								{
									onSuccess: () => {
										toast.success(
											'Wallet funded successfully!',
										);
										// Poll for balance and transactions update to be sure
										let attempts = 0;
										const maxAttempts = 5;
										const interval = setInterval(
											async () => {
												attempts++;
												await Promise.all([
													refetchBalance(),
													refetchTransactions(),
												]);
												if (attempts >= maxAttempts) {
													clearInterval(interval);
													setOpen(false);
												}
											},
											2000,
										);
									},
									onError: () => {
										// Even if verification mutation fails, still poll
										// as the webhook might have worked
										let attempts = 0;
										const maxAttempts = 5;
										const interval = setInterval(
											async () => {
												attempts++;
												await Promise.all([
													refetchBalance(),
													refetchTransactions(),
												]);
												if (attempts >= maxAttempts) {
													clearInterval(interval);
													setOpen(false);
												}
											},
											2000,
										);
									},
								},
							);
						}}
						onClose={() => {
							toast.info('Payment cancelled');
						}}>
						<Button
							onClick={handleProceedToPayment}
							disabled={
								initFundingMutation.isPending ||
								verifyFundingMutation.isPending
							}
							className='w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-lg'>
							{initFundingMutation.isPending ||
							verifyFundingMutation.isPending
								? 'Processing...'
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
		amount: Math.round(amount * 100),
		publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
	};

	const initializePayment = usePaystackPayment(config);

	const handleSuccess = useCallback(
		(reference: any) => {
			onSuccess(reference);
		},
		[onSuccess],
	);

	const handleClose = useCallback(() => {
		onClose();
	}, [onClose]);

	useEffect(() => {
		if (providerRef && amount > 0 && email) {
			console.log(
				`[PaystackWrapper] Triggering payment for ref: ${providerRef}`,
			);
			initializePayment({
				onSuccess: handleSuccess,
				onClose: handleClose,
			});
		}
	}, [
		providerRef,
		amount,
		email,
		initializePayment,
		handleSuccess,
		handleClose,
	]);

	return children;
}
