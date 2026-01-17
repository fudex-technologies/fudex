'use client';

import GoBackButton from '@/components/GoBackButton';
import InputField, { SelectField } from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { useTRPC } from '@/trpc/client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function VendorOnboardingPaymentInfoPage() {
	const router = useRouter();
	const trpc = useTRPC();
	const [isLoading, setIsLoading] = useState(false);

	const [form, setForm] = useState({
		bankName: '',
		accountNumber: '',
		accountName: '',
	});

	const updateVendor = useMutation(
		trpc.vendors.updateMyVendor.mutationOptions({
			onSuccess: () => {
				toast.success('Payment information saved');
				router.push('/vendor-onboarding/progress');
			},
			onError: (error) => {
				toast.error(error.message || 'Failed to save payment info');
				setIsLoading(false);
			},
		})
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Simple validation
		if (form.accountNumber.length < 10) {
			toast.error('Account number must be at least 10 digits');
			setIsLoading(false);
			return;
		}

		updateVendor.mutate({
			bankName: form.bankName,
			bankAccountNumber: form.accountNumber,
			accountName: form.accountName,
		});
	};

	return (
		<PageWrapper>
			<div className='flex items-center gap-10 w-full'>
				<GoBackButton
					link={PAGES_DATA.vendor_onboarding_progress_page}
				/>
				<p className='font-semibold text-xl'>
					Set up your payment info
				</p>
			</div>
			<div className='py-10 space-y-5 max-w-lg w-full mx-auto'>
				<div className='space-y-3 w-full'>
					<p className='w-full font-semibold pb-5 border-b'>
						Add your bank details
					</p>
					<p className='text-sm text-muted-foreground'>
						This account will be used for your payouts.
					</p>
				</div>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<SelectField
						label='Bank Name'
						value={form.bankName}
						onChange={(val) => setForm({ ...form, bankName: val })}
						data={[
							{ label: 'Access Bank', value: 'Access Bank' },
							{ label: 'GTBank', value: 'GTBank' },
							{ label: 'Zenith Bank', value: 'Zenith Bank' },
							{ label: 'UBA', value: 'UBA' },
							{ label: 'First Bank', value: 'First Bank' },
							{ label: 'Kuda', value: 'Kuda' },
							{ label: 'Opay', value: 'Opay' },
							{ label: 'PalmPay', value: 'PalmPay' },
						]} // In a real app, fetch from an API
						required
					/>

					<InputField
						label='Account Number'
						value={form.accountNumber}
						onChange={(e) =>
							setForm({ ...form, accountNumber: e.target.value })
						}
						placeholder='0123456789'
						type='tel'
						// maxLength={10}
						required
					/>

					<InputField
						label='Account Name'
						value={form.accountName}
						onChange={(e) =>
							setForm({ ...form, accountName: e.target.value })
						}
						placeholder='e.g. Fudex Foods Ltd'
						required
					/>

					<Button
						type='submit'
						variant={'game'}
						className='w-full py-5 mt-10'
						disabled={isLoading || updateVendor.isPending}>
						{isLoading || updateVendor.isPending
							? 'Saving...'
							: 'Save & Continue'}
					</Button>
				</form>
			</div>
		</PageWrapper>
	);
}
