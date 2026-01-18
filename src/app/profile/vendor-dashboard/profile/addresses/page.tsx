'use client';

import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import GoBackButton from '@/components/GoBackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { useState, useEffect } from 'react';
import { Loader2, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorAddressesPage() {
	const { useGetMyVendor, updateMyVendor } = useVendorDashboardActions();
	const { data: vendor, isLoading, refetch } = useGetMyVendor();
	const updateVendorMutation = updateMyVendor({
		onSuccess: () => {
			toast.success('Address updated successfully');
			refetch();
		},
	});

	const [formData, setFormData] = useState({
		address: '',
		city: '',
		country: '',
		postalCode: '',
		lat: '',
		lng: '',
	});

	useEffect(() => {
		if (vendor && vendor.addresses && vendor.addresses.length > 0) {
			// Get the default address or first address
			const defaultAddress =
				vendor.addresses.find((addr) => addr.isDefault) ||
				vendor.addresses[0];

			setFormData({
				address: defaultAddress.line1 || '',
				city: defaultAddress.city || '',
				country: defaultAddress.country || 'NG',
				postalCode: defaultAddress.postalCode || '',
				lat: defaultAddress.lat ? String(defaultAddress.lat) : '',
				lng: defaultAddress.lng ? String(defaultAddress.lng) : '',
			});
		}
	}, [vendor]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateVendorMutation.mutate({
			address: formData.address || undefined,
			city: formData.city || undefined,
			country: formData.country || undefined,
			postalCode: formData.postalCode || undefined,
			lat: formData.lat ? parseFloat(formData.lat) : undefined,
			lng: formData.lng ? parseFloat(formData.lng) : undefined,
		});
	};

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
				<h1 className='font-semibold text-lg'>Addresses & Location</h1>
			</div>

			{vendor?.addresses && vendor.addresses.length > 0 && (
				<div className='mb-8'>
					<h2 className='font-semibold text-base mb-4'>
						Your Addresses
					</h2>
					<div className='space-y-3'>
						{vendor.addresses.map((address) => (
							<div
								key={address.id}
								className='p-4 border rounded-lg bg-card'>
								<div className='flex items-start justify-between gap-4'>
									<div>
										<p className='font-medium'>
											{address.line1}
											{address.line2 && (
												<>, {address.line2}</>
											)}
										</p>
										<p className='text-sm text-muted-foreground'>
											{address.city}, {address.state}{' '}
											{address.postalCode}
										</p>
										<p className='text-xs text-muted-foreground'>
											{address.country}
										</p>
										{address.isDefault && (
											<span className='inline-block mt-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded'>
												Default
											</span>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			<div className='border-t pt-8'>
				<h2 className='font-semibold text-base mb-6'>
					{vendor?.addresses?.length && vendor?.addresses?.length > 0
						? 'Update Primary Address'
						: 'Add Your Address'}
				</h2>

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div className='space-y-2'>
						<Label htmlFor='address'>Street Address *</Label>
						<div className='relative'>
							<Input
								id='address'
								value={formData.address}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										address: e.target.value,
									}))
								}
								placeholder='123 Business St'
								className='pl-10'
								required
							/>
							<MapPin
								className='absolute left-3 top-2.5 text-muted-foreground'
								size={18}
							/>
						</div>
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='city'>City *</Label>
							<Input
								id='city'
								value={formData.city}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										city: e.target.value,
									}))
								}
								placeholder='Lagos'
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='country'>Country *</Label>
							<Input
								id='country'
								value={formData.country}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										country: e.target.value,
									}))
								}
								placeholder='Nigeria'
								required
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='postalCode'>Postal Code</Label>
						<Input
							id='postalCode'
							value={formData.postalCode}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									postalCode: e.target.value,
								}))
							}
							placeholder='12345'
						/>
					</div>

					<div className='bg-muted/30 p-4 rounded-lg space-y-4'>
						<h3 className='text-sm font-medium'>
							Coordinates (Optional)
						</h3>
						<p className='text-xs text-muted-foreground'>
							Used for more accurate delivery distance
							calculations.
						</p>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='lat'>Latitude</Label>
								<Input
									id='lat'
									type='number'
									step='any'
									value={formData.lat}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											lat: e.target.value,
										}))
									}
									placeholder='e.g., 6.5244'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='lng'>Longitude</Label>
								<Input
									id='lng'
									type='number'
									step='any'
									value={formData.lng}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											lng: e.target.value,
										}))
									}
									placeholder='e.g., 3.3792'
								/>
							</div>
						</div>
					</div>

					<Button
						type='submit'
						variant='game'
						className='w-full'
						disabled={updateVendorMutation.isPending}>
						{updateVendorMutation.isPending
							? 'Saving...'
							: 'Save Address'}
					</Button>
				</form>
			</div>
		</PageWrapper>
	);
}
