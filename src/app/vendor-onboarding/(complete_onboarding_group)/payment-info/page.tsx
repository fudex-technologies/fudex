'use client';

import GoBackButton from '@/components/GoBackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Landmark } from 'lucide-react';

export default function VendorOnboardingPaymentInfoPage() {
	const router = useRouter();
	const { useGetSupportedBanks, useGetMyVendor } =
		useVendorDashboardActions();
	const { data: banks = [], isLoading: isBanksLoading } =
		useGetSupportedBanks();
	const { data: vendor, isLoading: isVendorLoading } = useGetMyVendor();
	const { updateMyVendor } = useVendorDashboardActions();
	const updateVendorMutation = updateMyVendor();

	const [formData, setFormData] = useState({
		bankCode: '',
		bankName: '',
		bankAccountNumber: '',
		bankAccountName: '',
	});

	useEffect(() => {
		if (vendor) {
			setFormData({
				bankCode: vendor.bankCode || '',
				bankName: vendor.bankName || '',
				bankAccountNumber: vendor.bankAccountNumber || '',
				bankAccountName: vendor.bankAccountName || '',
			});
		}
	}, [vendor]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!formData.bankCode ||
			!formData.bankAccountNumber ||
			!formData.bankAccountName
		) {
			toast.error('Please fill in all bank details');
			return;
		}

		if (formData.bankAccountNumber.length < 10) {
			toast.error('Account number must be at least 10 digits');
			return;
		}

		const selectedBank = banks.find((b) => b.code === formData.bankCode);

		updateVendorMutation.mutate({
			bankName: selectedBank?.name || formData.bankName,
			bankCode: formData.bankCode,
			bankAccountNumber: formData.bankAccountNumber,
			bankAccountName: formData.bankAccountName,
		},
		{
			onSuccess: () => {
				toast.success('Payment information saved');
				router.push(PAGES_DATA.vendor_onboarding_progress_page);
			},
			onError: (error) => {
				toast.error(error.message || 'Failed to save payment info');
			},
		});
	}

	if (isBanksLoading || isVendorLoading) {
		return (
			<PageWrapper className='p-5 flex justify-center items-center'>
				<Loader2 className='animate-spin' />
			</PageWrapper>
		);
	}

	return (
		<PageWrapper className='px-5'>
			<div className='flex items-center gap-5 w-full mb-8'>
				<GoBackButton
					link={PAGES_DATA.vendor_onboarding_progress_page}
				/>
				<h1 className='font-semibold text-xl'>
					Set up your payment info
				</h1>
			</div>

			<div className='bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 flex gap-3 max-w-lg mx-auto'>
				<Landmark className='text-blue-500 shrink-0' size={20} />
				<p className='text-sm text-blue-700'>
					This account will be used for your weekly payouts. Please
					ensure the account name matches the one on record with your
					bank.
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className='space-y-6 max-w-lg mx-auto'>
				<div className='space-y-2'>
					<Label htmlFor='bank'>Select Bank *</Label>
					<select
						id='bank'
						value={formData.bankCode}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								bankCode: e.target.value,
							}))
						}
						className='w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
						required>
						<option value=''>Choose your bank...</option>
						{banks.map((bank) => (
							<option key={bank.code} value={bank.code}>
								{bank.name}
							</option>
						))}
					</select>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='accountNumber'>Account Number *</Label>
					<Input
						id='accountNumber'
						value={formData.bankAccountNumber}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								bankAccountNumber: e.target.value,
							}))
						}
						placeholder='1234567890'
						maxLength={10}
						required
					/>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='accountName'>Account Holder Name *</Label>
					<Input
						id='accountName'
						value={formData.bankAccountName}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								bankAccountName: e.target.value,
							}))
						}
						placeholder='Enter the account holder name'
						required
					/>
				</div>

				<Button
					type='submit'
					variant='game'
					className='w-full py-5'
					disabled={updateVendorMutation.isPending}>
					{updateVendorMutation.isPending ? (
						<>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							Saving...
						</>
					) : (
						'Save & Continue'
					)}
				</Button>
			</form>
		</PageWrapper>
	);
}
