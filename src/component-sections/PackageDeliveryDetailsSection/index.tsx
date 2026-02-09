'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import { usePackageCheckoutStore } from '@/store/package-checkout-store';
import { usePackageActions } from '@/api-hooks/usePackageActions';
import { Button } from '@/components/ui/button';
import GoBackButton from '@/components/GoBackButton';
import TimeSlotPicker from '@/components/package-components/TimeSlotPicker';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PackageDeliveryDetailsSection = ({
	packageSlug,
}: {
	packageSlug: string;
}) => {
	const router = useRouter();
	const checkoutStore = usePackageCheckoutStore();
	const { useGetPackageBySlug } = usePackageActions();
	const { data: packageData, isLoading } = useGetPackageBySlug({
		slug: packageSlug,
	});

	const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(
		checkoutStore.timeSlot
	);
	const [deliveryDate, setDeliveryDate] = useState<Date | null>(
		checkoutStore.deliveryDate
	);

	// Set delivery date from package if it's a preorder
	useEffect(() => {
		if (packageData?.isPreorder && packageData?.deliveryDate) {
			const date = new Date(packageData.deliveryDate);
			setDeliveryDate(date);
		}
	}, [packageData]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!deliveryDate) {
			toast.error('Please select a delivery date');
			return;
		}

		if (!selectedTimeSlot) {
			toast.error('Please select a time slot');
			return;
		}

		// Save to checkout store
		checkoutStore.setDeliveryDetails(deliveryDate, selectedTimeSlot);

		// Navigate to card customization
		router.push(PAGES_DATA.package_checkout_card_page(packageSlug));
	};

	if (isLoading) {
		return (
			<div className='w-full p-5 space-y-5'>
				<Skeleton className='h-10 w-48' />
				<Skeleton className='h-64 w-full' />
			</div>
		);
	}

	if (!packageData) {
		return (
			<div className='w-full p-5 text-center text-foreground/50'>
				Package not found
			</div>
		);
	}

	const isPreorder = packageData.isPreorder;
	const packageDeliveryDate = packageData.deliveryDate
		? new Date(packageData.deliveryDate)
		: null;

	return (
		<div className='w-full pb-24'>
			{/* Header */}
			<div className='w-full px-5 py-4 flex items-center gap-3 border-b'>
				<GoBackButton />
				<h1 className='text-xl font-semibold'>Delivery Details</h1>
			</div>

			{/* Content */}
			<form onSubmit={handleSubmit} className='w-full p-5 space-y-6'>
				{/* Delivery Date Info */}
				<div className='space-y-2'>
					<Label className='text-base font-medium'>Delivery Date</Label>
					{isPreorder && packageDeliveryDate ? (
						<div className='p-4 bg-muted rounded-lg'>
							<p className='text-sm text-foreground/60'>
								This is a pre-order package
							</p>
							<p className='text-lg font-semibold mt-1'>
								{format(packageDeliveryDate, 'EEEE, MMMM do, yyyy')}
							</p>
							<p className='text-sm text-foreground/60 mt-1'>
								Orders close{' '}
								{packageData.orderCloseDate
									? format(
											new Date(packageData.orderCloseDate),
											'MMMM do'
									  )
									: 'soon'}
							</p>
						</div>
					) : (
						<div className='p-4 bg-muted rounded-lg'>
							<p className='text-sm text-foreground/60'>
								Please select your preferred delivery date
							</p>
							<input
								type='date'
								value={
									deliveryDate
										? format(deliveryDate, 'yyyy-MM-dd')
										: ''
								}
								onChange={(e) => {
									if (e.target.value) {
										setDeliveryDate(new Date(e.target.value));
									}
								}}
								min={format(new Date(), 'yyyy-MM-dd')}
								className='mt-2 w-full p-2 border rounded-md'
								required
							/>
						</div>
					)}
				</div>

				{/* Time Slot Selection */}
				<div className='space-y-4'>
					<Label className='text-base font-medium'>
						Select Time Slot <span className='text-destructive'>*</span>
					</Label>
					<p className='text-sm text-foreground/60'>
						Choose a 2-hour time slot for delivery
					</p>
					<TimeSlotPicker
						value={selectedTimeSlot || undefined}
						onChange={setSelectedTimeSlot}
					/>
					{!selectedTimeSlot && (
						<p className='text-sm text-destructive'>
							Please select a time slot
						</p>
					)}
				</div>

				{/* Submit Button */}
				<div className='fixed bottom-0 left-0 w-screen bg-background border-t border-t-[#85858540] h-[100px] px-5 flex justify-center z-50'>
					<div className='w-full h-full flex items-center justify-end max-w-[1400px]'>
						<Button
							type='submit'
							variant={'game'}
							size={'lg'}
							className='w-full sm:w-auto'
							disabled={!deliveryDate || !selectedTimeSlot}>
							Continue to Card
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default PackageDeliveryDetailsSection;

