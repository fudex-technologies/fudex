'use client';

import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import GoBackButton from '@/components/GoBackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { useState, useEffect } from 'react';
import { Loader2, MapPin } from 'lucide-react';

export default function VendorAddressesPage() {
	const { useGetMyVendor, updateMyVendor } = useVendorDashboardActions();
	const { data: vendor, isLoading } = useGetMyVendor();
	const updateVendorMutation = updateMyVendor();

	const [formData, setFormData] = useState({
		address: '',
		city: '',
		country: '',
		lat: '',
		lng: '',
	});

	useEffect(() => {
		if (vendor) {
			setFormData({
				address: vendor.address || '',
				city: vendor.city || '',
				country: vendor.country || '',
				lat: vendor.lat ? String(vendor.lat) : '',
				lng: vendor.lng ? String(vendor.lng) : '',
			});
		}
	}, [vendor]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateVendorMutation.mutate({
			address: formData.address || undefined,
			city: formData.city || undefined,
			country: formData.country || undefined,
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

			<form onSubmit={handleSubmit} className='space-y-6'>
				<div className='space-y-2'>
					<Label htmlFor='address'>Street Address</Label>
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
						/>
						<MapPin
							className='absolute left-3 top-2.5 text-muted-foreground'
							size={18}
						/>
					</div>
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					<div className='space-y-2'>
						<Label htmlFor='city'>City</Label>
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
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='country'>Country</Label>
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
						/>
					</div>
				</div>

				<div className='bg-muted/30 p-4 rounded-lg space-y-4'>
					<h3 className='text-sm font-medium'>
						Coordinates (Optional)
					</h3>
					<p className='text-xs text-muted-foreground'>
						Used for more accurate delivery distance calculations.
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
		</PageWrapper>
	);
}
