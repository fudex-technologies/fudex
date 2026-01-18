'use client';

import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import GoBackButton from '@/components/GoBackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Landmark } from 'lucide-react';

export default function VendorBankDetailsPage() {
	const { useGetMyVendor, updateMyVendor, useGetSupportedBanks } =
		useVendorDashboardActions();
	const { data: vendor, isLoading: isVendorLoading } = useGetMyVendor();
	const { data: banks = [], isLoading: isBanksLoading } =
		useGetSupportedBanks();
	const updateVendorMutation = updateMyVendor();

	const [formData, setFormData] = useState({
		bankName: '',
		bankCode: '',
		bankAccountNumber: '',
		bankAccountName: '',
	});

	useEffect(() => {
		if (vendor) {
			setFormData({
				bankName: vendor.bankName || '',
				bankCode: vendor.bankCode || '',
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

		const selectedBank = banks.find((b) => b.code === formData.bankCode);

		updateVendorMutation.mutate({
			bankName: selectedBank?.name || formData.bankName,
			bankCode: formData.bankCode,
			bankAccountNumber: formData.bankAccountNumber,
			bankAccountName: formData.bankAccountName,
		});
	};

	const isLoading = isVendorLoading || isBanksLoading;

	if (isLoading) {
		return (
			<PageWrapper className='p-5 flex justify-center items-center'>
				<Loader2 className='animate-spin' />
			</PageWrapper>
		);
	}

	return (
		<PageWrapper className='p-5 max-w-2xl mx-auto'>
			<div className='flex items-center gap-5 w-full mb-8'>
				<GoBackButton />
				<h1 className='font-semibold text-lg'>Bank Details</h1>
			</div>

			<div className='bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 flex gap-3'>
				<Landmark className='shrink-0' size={20} />
				<p className='text-sm '>
					These details will be used for your weekly payouts. Please
					ensure the account name matches the one on record with your
					bank.
				</p>
			</div>

			<form onSubmit={handleSubmit} className='space-y-6'>
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
					className='w-full'
					disabled={updateVendorMutation.isPending}>
					{updateVendorMutation.isPending ? (
						<>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							Verifying & Saving...
						</>
					) : (
						'Update Bank Details'
					)}
				</Button>
			</form>
		</PageWrapper>
	);
}
