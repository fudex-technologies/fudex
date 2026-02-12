'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import { usePackageCheckoutStore } from '@/store/package-checkout-store';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import GoBackButton from '@/components/GoBackButton';
import CardCustomizationDrawer from '@/components/package-components/CardCustomizationDrawer';
import { toast } from 'sonner';

const PackageCardCustomizationSection = ({
	packageSlug,
}: {
	packageSlug: string;
}) => {
	const router = useRouter();
	const checkoutStore = usePackageCheckoutStore();
	const [cardType, setCardType] = useState<'ADMIN_CREATED' | 'CUSTOM' | null>(
		checkoutStore.cardType
	);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	const handleCardTypeChange = (value: string) => {
		if (value === 'ADMIN_CREATED' || value === 'CUSTOM') {
			setCardType(value);
			if (value === 'ADMIN_CREATED') {
				// Clear custom message when switching to admin created
				checkoutStore.setCardDetails('ADMIN_CREATED', null);
			}
		}
	};

	const handleCustomMessageSave = (message: string) => {
		checkoutStore.setCardDetails('CUSTOM', message);
		setIsDrawerOpen(false);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!cardType) {
			toast.error('Please select a card option');
			return;
		}

		if (cardType === 'CUSTOM' && !checkoutStore.customCardMessage) {
			toast.error('Please enter your custom message');
			setIsDrawerOpen(true);
			return;
		}

		// Save to checkout store (already saved when drawer closes)
		if (cardType === 'ADMIN_CREATED') {
			checkoutStore.setCardDetails('ADMIN_CREATED', null);
		}

		// Navigate to checkout
		router.push(PAGES_DATA.package_checkout_page(packageSlug));
	};

	return (
		<div className='w-full pb-24'>
			{/* Header */}
			<div className='w-full px-5 py-4 flex items-center gap-3 border-b'>
				<GoBackButton />
				<h1 className='text-xl font-semibold'>Card Customization</h1>
			</div>

			{/* Content */}
			<form onSubmit={handleSubmit} className='w-full p-5 space-y-6'>
				<div className='space-y-4'>
					<Label className='text-base font-medium'>
						How would you like your card? <span className='text-destructive'>*</span>
					</Label>
					<p className='text-sm text-foreground/60'>
						Choose how you want the card to be customized
					</p>

					<RadioGroup
						value={cardType || ''}
						onValueChange={handleCardTypeChange}>
						<div className='space-y-4'>
							{/* Admin Created Option */}
							<div className='flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors'>
								<RadioGroupItem
									value='ADMIN_CREATED'
									id='admin-created'
									className='mt-1'
								/>
								<Label
									htmlFor='admin-created'
									className='flex-1 flex-col text-start cursor-pointer space-y-1'>
									<div className='font-medium w-full text-start'>
										Let us create a custom card for you
									</div>
									<div className='text-sm text-foreground/60'>
										Our team will create a beautiful personalized card for your
										gift
									</div>
								</Label>
							</div>

							{/* Custom Option */}
							<div className='flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors'>
								<RadioGroupItem
									value='CUSTOM'
									id='custom'
									className='mt-1'
								/>
								<Label
									htmlFor='custom'
									className='flex-1 flex-col text-start cursor-pointer space-y-1'>
									<div className='font-medium w-full text-start'>
										Customize it yourself
									</div>
									<div className='text-sm text-foreground/60'>
										Write your own personal message to be included with the gift
									</div>
								</Label>
							</div>
						</div>
					</RadioGroup>

					{/* Custom Message Preview/Edit */}
					{cardType === 'CUSTOM' && (
						<div className='space-y-2 p-4 bg-muted rounded-lg'>
							<div className='flex items-center justify-between'>
								<Label className='text-sm font-medium'>Your Message</Label>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={() => setIsDrawerOpen(true)}>
									{checkoutStore.customCardMessage
										? 'Edit Message'
										: 'Write Message'}
								</Button>
							</div>
							{checkoutStore.customCardMessage ? (
								<div className='p-3 bg-background rounded border'>
									<p className='text-sm whitespace-pre-wrap'>
										{checkoutStore.customCardMessage}
									</p>
								</div>
							) : (
								<p className='text-sm text-foreground/60'>
									Click &quot;Write Message&quot; to add your custom message
								</p>
							)}
						</div>
					)}
				</div>

				{/* Submit Button */}
				<div className='fixed bottom-0 left-0 w-screen bg-background border-t border-t-[#85858540] h-[100px] px-5 flex justify-center z-50'>
					<div className='w-full h-full flex items-center justify-end max-w-[1400px]'>
						<Button
							type='submit'
							variant={'game'}
							size={'lg'}
							className='w-full sm:w-auto bg-[#FF305A]'
							disabled={!cardType}>
							Continue to Checkout
						</Button>
					</div>
				</div>
			</form>

			{/* Card Customization Drawer */}
			<CardCustomizationDrawer
				isOpen={isDrawerOpen}
				onClose={() => setIsDrawerOpen(false)}
				onSave={handleCustomMessageSave}
				initialMessage={checkoutStore.customCardMessage || ''}
			/>
		</div>
	);
};

export default PackageCardCustomizationSection;

