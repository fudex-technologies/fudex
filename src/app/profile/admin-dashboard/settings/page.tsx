'use client';

import { useState, useEffect } from 'react';
import { useAdminActions } from '@/api-hooks/useAdminActions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurency } from '@/lib/commonFunctions';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettingsPage() {
	const { useGetPlatformSetting, setPlatformSetting } = useAdminActions();
	
	const { data: baseFeeSetting, isLoading: baseFeeLoading, refetch: refetchBaseFee } = useGetPlatformSetting({ key: 'BASE_DELIVERY_FEE' });
	const { data: serviceFeeSetting, isLoading: serviceFeeLoading, refetch: refetchServiceFee } = useGetPlatformSetting({ key: 'SERVICE_FEE' });

	const [baseFee, setBaseFee] = useState<string>('');
	const [serviceFee, setServiceFee] = useState<string>('');

	useEffect(() => {
		if (baseFeeSetting?.value) {
			setBaseFee(String(baseFeeSetting.value as number));
		}
	}, [baseFeeSetting]);

	useEffect(() => {
		if (serviceFeeSetting?.value) {
			setServiceFee(String(serviceFeeSetting.value as number));
		}
	}, [serviceFeeSetting]);

	const baseFeeMutation = setPlatformSetting({
		onSuccess: () => {
			refetchBaseFee();
		},
	});

	const serviceFeeMutation = setPlatformSetting({
		onSuccess: () => {
			refetchServiceFee();
		},
	});

	const handleSaveBaseFee = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const fee = parseFloat(baseFee);
		if (isNaN(fee) || fee < 0) {
			return;
		}
		baseFeeMutation.mutate({
			key: 'BASE_DELIVERY_FEE',
			value: fee,
		});
	};

	const handleSaveServiceFee = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const fee = parseFloat(serviceFee);
		if (isNaN(fee) || fee < 0) {
			return;
		}
		serviceFeeMutation.mutate({
			key: 'SERVICE_FEE',
			value: fee,
		});
	};

	if (baseFeeLoading || serviceFeeLoading) {
		return (
			<SectionWrapper className='p-5'>
				<div className='space-y-4'>
					<Skeleton className='h-10 w-32' />
					<Skeleton className='h-40 w-full' />
					<Skeleton className='h-40 w-full' />
				</div>
			</SectionWrapper>
		);
	}

	return (
		<SectionWrapper className='p-5'>
			<h2 className='text-xl font-semibold mb-5'>Platform Settings</h2>

			<div className='space-y-6'>
				<Card>
					<CardHeader>
						<CardTitle>Base Delivery Fee</CardTitle>
						<CardDescription>
							This fee is used for custom/unknown areas where no specific delivery
							fee rules are configured. It serves as a fallback when an address
							doesn't match any predefined area.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSaveBaseFee} className='space-y-4'>
							<div>
								<Label htmlFor='baseFee'>Base Delivery Fee (₦)</Label>
								<Input
									id='baseFee'
									type='number'
									step='0.01'
									min='0'
									value={baseFee}
									onChange={(e) => setBaseFee(e.target.value)}
									placeholder='0.00'
									required
								/>
								{baseFeeSetting?.value && (
									<p className='text-sm text-foreground/50 mt-1'>
										Current: {formatCurency(baseFeeSetting.value as number)}
									</p>
								)}
							</div>
							<Button
								type='submit'
								disabled={baseFeeMutation.isPending || !baseFee}>
								{baseFeeMutation.isPending ? 'Saving...' : 'Save Base Fee'}
							</Button>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Service Fee</CardTitle>
						<CardDescription>
							This fee is applied to all orders regardless of delivery area or
							time. It represents the platform's service charge.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSaveServiceFee} className='space-y-4'>
							<div>
								<Label htmlFor='serviceFee'>Service Fee (₦)</Label>
								<Input
									id='serviceFee'
									type='number'
									step='0.01'
									min='0'
									value={serviceFee}
									onChange={(e) => setServiceFee(e.target.value)}
									placeholder='0.00'
									required
								/>
								{serviceFeeSetting?.value && (
									<p className='text-sm text-foreground/50 mt-1'>
										Current: {formatCurency(serviceFeeSetting.value as number)}
									</p>
								)}
							</div>
							<Button
								type='submit'
								disabled={serviceFeeMutation.isPending || !serviceFee}>
								{serviceFeeMutation.isPending ? 'Saving...' : 'Save Service Fee'}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</SectionWrapper>
	);
}

