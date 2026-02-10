'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import { usePackageCheckoutStore } from '@/store/package-checkout-store';
import { useProfileActions } from '@/api-hooks/useProfileActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import GoBackButton from '@/components/GoBackButton';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const PackageRecipientDetailsSection = ({
	packageSlug,
}: {
	packageSlug: string;
}) => {
	const router = useRouter();
	const checkoutStore = usePackageCheckoutStore();
	const { getAllAreasInEkiti } = useProfileActions();
	const { data: areas, isLoading: loadingAreas } = getAllAreasInEkiti();

	const [formData, setFormData] = useState({
		senderName: checkoutStore.senderName,
		recipientName: checkoutStore.recipientName,
		recipientPhone: checkoutStore.recipientPhone,
		recipientAddressLine1: checkoutStore.recipientAddressLine1,
		recipientAddressLine2: checkoutStore.recipientAddressLine2 || '',
		recipientCity: checkoutStore.recipientCity || 'Ekiti',
		recipientState: checkoutStore.recipientState || 'Ekiti',
		recipientAreaId: checkoutStore.recipientAreaId || '',
		recipientCustomArea: checkoutStore.recipientCustomArea || '',
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const newErrors: Record<string, string> = {};
		
		if (!formData.senderName.trim()) {
			newErrors.senderName = 'Sender name is required';
		}
		if (!formData.recipientName.trim()) {
			newErrors.recipientName = 'Recipient name is required';
		}
		if (!formData.recipientPhone.trim()) {
			newErrors.recipientPhone = 'Recipient phone is required';
		}
		if (!formData.recipientAddressLine1.trim()) {
			newErrors.recipientAddressLine1 = 'Address is required';
		}
		if (!formData.recipientCity.trim()) {
			newErrors.recipientCity = 'City is required';
		}
		if (!formData.recipientAreaId && !formData.recipientCustomArea) {
			newErrors.recipientAreaId = 'Please select an area or enter a custom area';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!validate()) {
			toast.error('Please fill in all required fields');
			return;
		}

		// Save to checkout store
		checkoutStore.setSenderName(formData.senderName);
		checkoutStore.setRecipientDetails({
			recipientName: formData.recipientName,
			recipientPhone: formData.recipientPhone,
			recipientAddressLine1: formData.recipientAddressLine1,
			recipientAddressLine2: formData.recipientAddressLine2 || null,
			recipientCity: formData.recipientCity,
			recipientState: formData.recipientState || null,
			recipientAreaId: formData.recipientAreaId || null,
			recipientCustomArea: formData.recipientCustomArea || null,
		});

		// Navigate to delivery details
		router.push(PAGES_DATA.package_checkout_delivery_page(packageSlug));
	};

	return (
		<div className='w-full pb-24'>
			{/* Header */}
			<div className='w-full px-5 py-4 flex items-center gap-3 border-b'>
				<GoBackButton />
				<h1 className='text-xl font-semibold'>Recipient Details</h1>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit} className='w-full p-5 space-y-6'>
				{/* Sender Name */}
				<div className='space-y-2'>
					<Label htmlFor='senderName'>
						Your Name (Sender) <span className='text-destructive'>*</span>
					</Label>
					<Input
						id='senderName'
						value={formData.senderName}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, senderName: e.target.value }))
						}
						placeholder='Enter your name'
						className={errors.senderName ? 'border-destructive' : ''}
					/>
					{errors.senderName && (
						<p className='text-sm text-destructive'>{errors.senderName}</p>
					)}
				</div>

				{/* Recipient Name */}
				<div className='space-y-2'>
					<Label htmlFor='recipientName'>
						Recipient Name <span className='text-destructive'>*</span>
					</Label>
					<Input
						id='recipientName'
						value={formData.recipientName}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								recipientName: e.target.value,
							}))
						}
						placeholder='Enter recipient name'
						className={errors.recipientName ? 'border-destructive' : ''}
					/>
					{errors.recipientName && (
						<p className='text-sm text-destructive'>{errors.recipientName}</p>
					)}
				</div>

				{/* Recipient Phone */}
				<div className='space-y-2'>
					<Label htmlFor='recipientPhone'>
						Recipient Phone <span className='text-destructive'>*</span>
					</Label>
					<Input
						id='recipientPhone'
						type='tel'
						value={formData.recipientPhone}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								recipientPhone: e.target.value,
							}))
						}
						placeholder='Enter recipient phone number'
						className={errors.recipientPhone ? 'border-destructive' : ''}
					/>
					{errors.recipientPhone && (
						<p className='text-sm text-destructive'>{errors.recipientPhone}</p>
					)}
				</div>

				{/* Address Line 1 */}
				<div className='space-y-2'>
					<Label htmlFor='recipientAddressLine1'>
						Address <span className='text-destructive'>*</span>
					</Label>
					<Input
						id='recipientAddressLine1'
						value={formData.recipientAddressLine1}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								recipientAddressLine1: e.target.value,
							}))
						}
						placeholder='Street address, house number, landmark'
						className={errors.recipientAddressLine1 ? 'border-destructive' : ''}
					/>
					{errors.recipientAddressLine1 && (
						<p className='text-sm text-destructive'>
							{errors.recipientAddressLine1}
						</p>
					)}
				</div>

				{/* Address Line 2 (Optional) */}
				<div className='space-y-2'>
					<Label htmlFor='recipientAddressLine2'>Address Line 2 (Optional)</Label>
					<Input
						id='recipientAddressLine2'
						value={formData.recipientAddressLine2}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								recipientAddressLine2: e.target.value,
							}))
						}
						placeholder='Apartment, suite, etc.'
					/>
				</div>

				{/* City */}
				<div className='space-y-2'>
					<Label htmlFor='recipientCity'>
						City <span className='text-destructive'>*</span>
					</Label>
					<Input
						id='recipientCity'
						value={formData.recipientCity}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, recipientCity: e.target.value }))
						}
						placeholder='City'
						className={errors.recipientCity ? 'border-destructive' : ''}
					/>
					{errors.recipientCity && (
						<p className='text-sm text-destructive'>{errors.recipientCity}</p>
					)}
				</div>

				{/* Area Selection */}
				<div className='space-y-2'>
					<Label htmlFor='recipientAreaId'>
						Delivery Area <span className='text-destructive'>*</span>
					</Label>
					{loadingAreas ? (
						<Skeleton className='h-10 w-full' />
					) : (
						<>
							<Select
								value={formData.recipientAreaId}
								onValueChange={(value) =>
									setFormData((prev) => ({
										...prev,
										recipientAreaId: value,
										recipientCustomArea: '', // Clear custom area when selecting from list
									}))
								}>
								<SelectTrigger
									id='recipientAreaId'
									className={
										errors.recipientAreaId ? 'border-destructive' : ''
									}>
									<SelectValue placeholder='Select delivery area' />
								</SelectTrigger>
								<SelectContent>
									{areas && areas.length > 0 ? (
										areas.map((area) => (
											<SelectItem key={area.id} value={area.id}>
												{area.name}
												{area.state && ` - ${area.state}`}
											</SelectItem>
										))
									) : (
										<SelectItem value='' disabled>
											No areas available
										</SelectItem>
									)}
								</SelectContent>
							</Select>
							{errors.recipientAreaId && (
								<p className='text-sm text-destructive'>
									{errors.recipientAreaId}
								</p>
							)}
							<p className='text-sm text-muted-foreground'>
								Or enter a custom area below if your area is not listed
							</p>
						</>
					)}
				</div>

				{/* Custom Area (Optional if area selected) */}
				{!formData.recipientAreaId && (
					<div className='space-y-2'>
						<Label htmlFor='recipientCustomArea'>
							Custom Area <span className='text-destructive'>*</span>
						</Label>
						<Input
							id='recipientCustomArea'
							value={formData.recipientCustomArea}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									recipientCustomArea: e.target.value,
								}))
							}
							placeholder='Enter your area if not listed above'
							className={errors.recipientAreaId ? 'border-destructive' : ''}
						/>
					</div>
				)}

				{/* Submit Button */}
				<div className='fixed bottom-0 left-0 w-screen bg-background border-t border-t-[#85858540] h-[100px] px-5 flex justify-center z-50'>
					<div className='w-full h-full flex items-center justify-end max-w-[1400px]'>
						<Button
							type='submit'
							variant={'game'}
							size={'lg'}
							className='w-full sm:w-auto bg-[#FF305A]'>
							Continue to Delivery
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default PackageRecipientDetailsSection;

