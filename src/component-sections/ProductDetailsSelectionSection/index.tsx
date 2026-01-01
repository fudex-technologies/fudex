'use client';

import CounterComponent from '@/components/CounterComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { formatCurency } from '@/lib/commonFunctions';
import { useState, useMemo } from 'react';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { useCartStore, CartAddon } from '@/store/cart-store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import type { ProductItem } from '@prisma/client';

interface ProductDetailsSelectionSectionProps {
	productId: string;
	vendorId: string;
	productItems: ProductItem[];
}

const ProductDetailsSelectionSection = ({
	productId,
	vendorId,
	productItems,
}: ProductDetailsSelectionSectionProps) => {
	const router = useRouter();
	const { addPack } = useCartStore();
	const [selectedItemId, setSelectedItemId] = useState<string>(
		productItems[0]?.id || ''
	);
	const [numberOfPacks, setNumberOfPacks] = useState(1);
	const [selectedAddons, setSelectedAddons] = useState<
		Record<string, number>
	>({}); // addonProductItemId -> quantity

	// Fetch available addons (other product items from same vendor)
	const { data: addonItems = [] } = useVendorProductActions().useGetAddonProductItems(
		{
			vendorId,
			excludeProductItemIds: productItems.map((item) => item.id),
		}
	);

	const selectedItem = productItems.find((item) => item.id === selectedItemId);

	// Calculate total price
	const totalPrice = useMemo(() => {
		if (!selectedItem) return 0;

		let total = selectedItem.price * numberOfPacks;

		// Add addon prices
		Object.entries(selectedAddons).forEach(([addonId, quantity]) => {
			const addon = addonItems.find((item) => item.id === addonId);
			if (addon && quantity > 0) {
				total += addon.price * quantity * numberOfPacks;
			}
		});

		return total;
	}, [selectedItem, selectedAddons, addonItems, numberOfPacks]);

	const handleAddonToggle = (addonId: string) => {
		setSelectedAddons((prev) => {
			const current = prev[addonId] || 0;
			if (current > 0) {
				const newState = { ...prev };
				delete newState[addonId];
				return newState;
			} else {
				return { ...prev, [addonId]: 1 };
			}
		});
	};

	const handleAddonQuantityChange = (addonId: string, quantity: number) => {
		if (quantity <= 0) {
			setSelectedAddons((prev) => {
				const newState = { ...prev };
				delete newState[addonId];
				return newState;
			});
		} else {
			setSelectedAddons((prev) => ({
				...prev,
				[addonId]: quantity,
			}));
		}
	};

	const handleAddToTray = () => {
		if (!selectedItem) {
			toast.error('Please select a size');
			return;
		}

		// Convert selectedAddons to CartAddon format
		const addons: CartAddon[] = Object.entries(selectedAddons)
			.filter(([_, quantity]) => quantity > 0)
			.map(([addonProductItemId, quantity]) => ({
				addonProductItemId,
				quantity,
			}));

		// Generate a groupKey for packs from the same selection
		const groupKey = `${selectedItemId}-${JSON.stringify(addons)}`;

		// Add packs to cart (all packs have same items initially)
		for (let i = 0; i < numberOfPacks; i++) {
			addPack(
				{
					productItemId: selectedItemId,
					quantity: 1, // Each pack is quantity 1, but we add multiple packs
					addons: addons.length > 0 ? addons : undefined,
					groupKey,
				},
				vendorId
			);
		}

		toast.success(`Added ${numberOfPacks} pack${numberOfPacks > 1 ? 's' : ''} to tray`);
		router.push(PAGES_DATA.tray_page);
	};

	if (productItems.length === 0) {
		return (
			<div className='p-5 text-center text-foreground/50'>
				No variants available for this product
			</div>
		);
	}

	return (
		<>
			<div className='space-y-5'>
				{/* Size/Variant Selection */}
				<div className='w-full bg-muted flex items-center gap-3 p-5 text-lg'>
					<p>Select Size</p>
					<Badge
						variant={'outline'}
						className='border-destructive text-destructive'>
						Required
					</Badge>
				</div>

				<div className='px-5 space-y-2'>
					<p className='text-lg text-foreground/50'>SELECT 1</p>
					<RadioGroup
						value={selectedItemId}
						onValueChange={setSelectedItemId}
						className='w-full max-w-sm'>
						{productItems.map((item, index) => (
							<div key={item.id}>
								<div className='flex gap-3 w-full items-center justify-between'>
									<Label htmlFor={`item-${item.id}`} className='flex-1'>
										<div className=''>
											<p className='text-lg'>{item.name}</p>
											<p className='text-foreground/50'>
												{formatCurency(item.price)}
											</p>
										</div>
									</Label>
									<RadioGroupItem
										value={item.id}
										id={`item-${item.id}`}
										className='w-6 h-6'
									/>
								</div>
								{index < productItems.length - 1 && <Separator />}
							</div>
						))}
					</RadioGroup>
				</div>

				{/* Addons Selection */}
				{addonItems.length > 0 && (
					<>
						<div className='w-full bg-muted flex items-center gap-3 p-5 text-lg'>
							<p>Add-ons</p>
							<Badge variant={'outline'} className='border-primary text-primary'>
								Optional
							</Badge>
						</div>

						<div className='px-5 space-y-3'>
							{addonItems.map((addon) => {
								const quantity = selectedAddons[addon.id] || 0;
								const isSelected = quantity > 0;

								return (
									<div
										key={addon.id}
										className='flex items-center justify-between p-3 rounded-lg border border-foreground/10'>
										<div className='flex items-center gap-3 flex-1'>
											<Checkbox
												id={`addon-${addon.id}`}
												checked={isSelected}
												onCheckedChange={() => handleAddonToggle(addon.id)}
											/>
											<Label
												htmlFor={`addon-${addon.id}`}
												className='flex-1 cursor-pointer'>
												<div>
													<p className='text-base font-medium'>{addon.name}</p>
													{addon.description && (
														<p className='text-sm text-foreground/50'>
															{addon.description}
														</p>
													)}
													<p className='text-sm text-foreground/70'>
														{formatCurency(addon.price)}
													</p>
												</div>
											</Label>
										</div>
										{isSelected && (
											<div className='ml-4'>
												<CounterComponent
													count={quantity}
													setCount={(newCount) =>
														handleAddonQuantityChange(addon.id, newCount)
													}
													className='w-[120px] py-1'
												/>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</>
				)}

				{/* Number of Packs */}
				<div className='p-5 space-y-2'>
					<p className='text-lg'>Number Of Packs</p>
					<CounterComponent
						count={numberOfPacks}
						setCount={setNumberOfPacks}
					/>
				</div>
			</div>

			{/* Fixed Bottom Bar */}
			<div className='mb-[110px]' />
			<div className='fixed bottom-0 left-0 w-screen bg-background border-t border-t-[#85858540] h-[100px] text-[#858585] px-5 flex justify-center'>
				<div className='w-full h-full flex items-center justify-between max-w-[1400px]'>
					<div className=''>
						<p className='text-sm text-foreground/50'>Total</p>
						<p className='text-xl font-semibold text-foreground'>
							{formatCurency(totalPrice)}
						</p>
					</div>
					<Button
						variant={'game'}
						size={'lg'}
						onClick={handleAddToTray}
						disabled={!selectedItem}>
						Add to tray
					</Button>
				</div>
			</div>
		</>
	);
};

export default ProductDetailsSelectionSection;
