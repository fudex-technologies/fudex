'use client';

import CounterComponent from '@/components/CounterComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { formatCurency } from '@/lib/commonFunctions';
import { useState, useMemo, useEffect } from 'react';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { useCartStore, CartAddon } from '@/store/cart-store';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import type { ProductItem } from '@prisma/client';
import { Plus } from 'lucide-react';

const MAX_ADDONS = 4;
interface ProductDetailsSelectionSectionProps {
	vendorId: string;
	productItems: ProductItem[];
}

const ProductDetailsSelectionSection = ({
	vendorId,
	productItems,
}: ProductDetailsSelectionSectionProps) => {
	const { addPack } = useCartStore();
	const searchParams = useSearchParams();
	const variantSlug = searchParams.get('variant');

	// Find product item by slug if variant slug is provided
	const initialSelectedItemId = useMemo(() => {
		if (variantSlug) {
			const itemBySlug = productItems.find(
				(item) => item.slug === variantSlug,
			);
			if (itemBySlug) {
				return itemBySlug.id;
			}
		}
		return productItems[0]?.id || '';
	}, [variantSlug, productItems]);

	const [selectedItemId, setSelectedItemId] = useState<string>(
		initialSelectedItemId,
	);
	const [unitQuantity, setUnitQuantity] = useState(1);
	const [numberOfPacks, setNumberOfPacks] = useState(1);
	const [selectedAddons, setSelectedAddons] = useState<
		Record<string, number>
	>({}); // addonProductItemId -> quantity

	const router = useRouter();

	const selectedItem = productItems.find(
		(item) => item.id === selectedItemId,
	);

	// Update selected item when variant slug changes
	useEffect(() => {
		if (variantSlug) {
			const itemBySlug = productItems.find(
				(item) => item.slug === variantSlug,
			);
			if (itemBySlug) {
				setSelectedItemId(itemBySlug.id);
			}
		}
	}, [variantSlug, productItems]);
	// Reset unitQuantity when selected item changes
	useEffect(() => {
		if (selectedItem?.pricingType === 'PER_UNIT') {
			const minQty = selectedItem.minQuantity || 1;
			const step = selectedItem.quantityStep || 1;
			// Ensure initial quantity is a multiple of step and at least minQuantity
			const initialQty = Math.max(
				minQty,
				Math.ceil(minQty / step) * step,
			);
			setUnitQuantity(initialQty);
		} else {
			setUnitQuantity(1);
		}
	}, [selectedItemId, selectedItem]);

	// Fetch available addons (other product items from same vendor)
	const { data: proteins = [] } =
		useVendorProductActions().useGetProductItemsByCategorySlug({
			vendorId,
			categorySlug: 'protein',
		});
	const { data: drinks = [] } =
		useVendorProductActions().useGetProductItemsByCategorySlug({
			vendorId,
			categorySlug: 'hydration',
		});
	const { data: sides = [] } =
		useVendorProductActions().useGetProductItemsByCategorySlug({
			vendorId,
			categorySlug: 'sides',
		});

	const selectedProteinCount = useMemo(() => {
		return proteins.reduce((count, protein) => {
			return count + (selectedAddons[protein.id] || 0);
		}, 0);
	}, [proteins, selectedAddons]);

	const selectedDrinkCount = useMemo(() => {
		return drinks.reduce((count, drink) => {
			return count + (selectedAddons[drink.id] || 0);
		}, 0);
	}, [drinks, selectedAddons]);

	const selectedSideCount = useMemo(() => {
		return sides.reduce((count, side) => {
			return count + (selectedAddons[side.id] || 0);
		}, 0);
	}, [sides, selectedAddons]);

	// Calculate total price based on pricing type
	const totalPrice = useMemo(() => {
		if (!selectedItem) return 0;

		let singlePackTotal = 0;

		// Base price calculation for ONE pack
		if (selectedItem.pricingType === 'PER_UNIT') {
			// For PER_UNIT: price * unitQuantity (for one pack)
			singlePackTotal = selectedItem.price * unitQuantity;

			// Add packaging fee for PER_UNIT items (once per pack)
			if (selectedItem.packagingFee) {
				singlePackTotal += selectedItem.packagingFee;
			}
		} else {
			// For FIXED: just the price (for one pack)
			singlePackTotal = selectedItem.price;
		}

		// Add addon prices (for ONE pack)
		Object.entries(selectedAddons).forEach(([addonId, quantity]) => {
			const addon =
				proteins.find((p) => p.id === addonId) ||
				drinks.find((d) => d.id === addonId) ||
				sides.find((s) => s.id === addonId);
			if (addon && quantity > 0) {
				// Addons are NOT multiplied by unitQuantity
				// If user selects 1 chicken addon, they get 1 chicken regardless of scoop count
				singlePackTotal += addon.price * quantity;
			}
		});

		// Multiply single pack total by number of packs
		return singlePackTotal * numberOfPacks;
	}, [
		selectedItem,
		selectedAddons,
		proteins,
		drinks,
		sides,
		numberOfPacks,
		unitQuantity,
	]);

	const handleAddonToggle = (
		addonId: string,
		type: 'protein' | 'drink' | 'side',
	) => {
		setSelectedAddons((prev) => {
			const current = prev[addonId] || 0;

			// removing is always allowed
			if (current > 0) {
				const newState = { ...prev };
				delete newState[addonId];
				return newState;
			}

			// adding → enforce limits
			if (type === 'protein' && selectedProteinCount >= MAX_ADDONS) {
				toast.error('You can select up to 4 proteins');
				return prev;
			}

			if (type === 'drink' && selectedDrinkCount >= MAX_ADDONS) {
				toast.error('You can select up to 4 drinks');
				return prev;
			}

			if (type === 'side' && selectedSideCount >= MAX_ADDONS) {
				toast.error('You can select up to 4 sides');
				return prev;
			}

			return { ...prev, [addonId]: 1 };
		});
	};

	const handleAddonQuantityChange = (
		addonId: string,
		quantity: number,
		type: 'protein' | 'drink' | 'side',
	) => {
		if (quantity <= 0) {
			setSelectedAddons((prev) => {
				const newState = { ...prev };
				delete newState[addonId];
				return newState;
			});
			return;
		}

		const currentTotal =
			type === 'protein'
				? selectedProteinCount
				: type === 'drink'
					? selectedDrinkCount
					: selectedSideCount;

		const currentQuantity = selectedAddons[addonId] || 0;

		// If increasing and limit reached
		if (quantity > currentQuantity && currentTotal >= MAX_ADDONS) {
			toast.error(
				`You can select up to 4 ${
					type === 'protein'
						? 'proteins'
						: type === 'drink'
							? 'drinks'
							: 'sides'
				}`,
			);
			return;
		}

		setSelectedAddons((prev) => ({
			...prev,
			[addonId]: quantity,
		}));
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
		const groupKey = `${selectedItemId}-${JSON.stringify(addons)}-${unitQuantity}`;

		// Add packs to cart
		for (let i = 0; i < numberOfPacks; i++) {
			addPack(vendorId, {
				productItemId: selectedItemId,
				quantity:
					selectedItem.pricingType === 'PER_UNIT' ? unitQuantity : 1,
				numberOfPacks: 1, // Each iteration adds 1 pack
				addons: addons.length > 0 ? addons : undefined,
				groupKey,
			});
		}

		toast.success(
			`Added ${numberOfPacks} pack${numberOfPacks > 1 ? 's' : ''} to tray`,
		);
		router.push(PAGES_DATA.tray_page);
	};

	if (productItems.length === 0) {
		return (
			<div className='p-5 text-center text-foreground/50'>
				No variants available for this product
			</div>
		);
	}

	const selectedProductItem = productItems.find(
		(item) => item.id === selectedItemId,
	);

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
									<Label
										htmlFor={`item-${item.id}`}
										className='flex-1'>
										<div className=''>
											<p className='text-lg text-foreground/50'>
												{item.name}
											</p>
											<p className='text-foreground/50'>
												{formatCurency(item.price)}
												{item.pricingType ===
													'PER_UNIT' &&
													item.unitName && (
														<span className='text-xs ml-1'>
															per {item.unitName}
														</span>
													)}
											</p>
										</div>
									</Label>
									<RadioGroupItem
										value={item.id}
										id={`item-${item.id}`}
										className='w-6 h-6'
									/>
								</div>
								{/* Show unit quantity selector inline when this item is selected and is PER_UNIT */}
								{selectedItemId === item.id &&
									item.pricingType === 'PER_UNIT' && (
										<div className='mt-3 ml-9 space-y-2'>
											<div className='flex items-center gap-2'>
												<p className='text-sm text-foreground/70'>
													How many{' '}
													{item.unitName || 'units'}?
												</p>
												<Badge
													variant={'outline'}
													className='border-destructive text-destructive text-[10px] px-1.5 py-0'>
													Required
												</Badge>
											</div>
											<div className='flex items-center gap-3'>
												<CounterComponent
													count={unitQuantity}
													setCount={setUnitQuantity}
													min={item.minQuantity}
													max={
														item.maxQuantity
															? item.maxQuantity
															: undefined
													}
													step={
														item.quantityStep || 1
													}
													className='max-w-[200px] py-2'
												/>
												<div className='text-xs text-foreground/50'>
													<p>
														{formatCurency(
															item.price *
																unitQuantity,
														)}{' '}
														total
													</p>
													{item.packagingFee && (
														<p>
															+
															{formatCurency(
																item.packagingFee,
															)}{' '}
															packaging fee
														</p>
													)}
												</div>
											</div>
										</div>
									)}
								{index < productItems.length - 1 && (
									<Separator className='mt-3' />
								)}
							</div>
						))}
					</RadioGroup>
				</div>

				{/* Addons Selection */}
				{(selectedProductItem as any)?.categories[0]?.category?.slug !==
					'protein' &&
					proteins.length > 0 && (
						<>
							<div className='w-full bg-muted flex items-center gap-3 p-5 text-lg'>
								<p>Extra Protein</p>
								<Badge
									variant={'outline'}
									className='border-primary text-primary'>
									Optional
								</Badge>
							</div>
							<div className='px-5 space-y-3'>
								<p className='text-lg text-foreground/50'>
									SELECT UP TO 4 ITEMS
								</p>
								{proteins.map((protein, index) => {
									const quantity =
										selectedAddons[protein.id] || 0;
									const isSelected = quantity > 0;

									return (
										<>
											<div
												key={protein.id}
												className='flex items-center justify-between'>
												<div className='flex items-center gap-3 flex-1'>
													<div className='flex-1 cursor-pointer text-start'>
														<p className='text-base text-foreground/50 font-medium'>
															{protein.name}
														</p>
														{protein.description && (
															<p className='text-sm text-foreground/50'>
																{
																	protein.description
																}
															</p>
														)}
														<p className='text-sm text-foreground/70'>
															{formatCurency(
																protein.price,
															)}
														</p>
													</div>
												</div>
												{!isSelected && (
													<Button
														onClick={() =>
															handleAddonToggle(
																protein.id,
																'protein',
															)
														}
														variant={'muted'}
														size={'icon-sm'}
														className='rounded-full'>
														<Plus />
													</Button>
												)}
												{isSelected && (
													<div className='ml-4'>
														<CounterComponent
															count={quantity}
															countChangeEffect={(
																newCount,
															) =>
																handleAddonQuantityChange(
																	protein.id,
																	newCount,
																	'protein',
																)
															}
															className='w-[120px] py-1'
															disabledAdd={
																selectedProteinCount >=
																	MAX_ADDONS &&
																quantity === 0
															}
														/>
													</div>
												)}
											</div>
											{index < proteins.length - 1 && (
												<Separator />
											)}
										</>
									);
								})}
							</div>
						</>
					)}

				{/* drinks selection */}
				{(selectedProductItem as any)?.categories[0]?.category?.slug !==
					'hydration' &&
					drinks.length > 0 && (
						<>
							<div className='w-full bg-muted flex items-center gap-3 p-5 text-lg'>
								<p>Choose your preferred drink</p>
								<Badge
									variant={'outline'}
									className='border-primary text-primary'>
									Optional
								</Badge>
							</div>
							<div className='px-5 space-y-3'>
								<p className='text-lg text-foreground/50'>
									SELECT UP TO 4 ITEMS
								</p>
								{drinks.map((drink, index) => {
									const quantity =
										selectedAddons[drink.id] || 0;
									const isSelected = quantity > 0;

									return (
										<>
											<div
												key={drink.id}
												className='flex items-center justify-between'>
												<div className='flex items-center gap-3 flex-1'>
													<div className='flex-1 cursor-pointer text-start'>
														<p className='text-base text-foreground/50 font-medium'>
															{drink.name}
														</p>
														{drink.description && (
															<p className='text-sm text-foreground/50'>
																{
																	drink.description
																}
															</p>
														)}
														<p className='text-sm text-foreground/70'>
															{formatCurency(
																drink.price,
															)}
														</p>
													</div>
												</div>
												{!isSelected && (
													<Button
														onClick={() =>
															handleAddonToggle(
																drink.id,
																'drink',
															)
														}
														variant={'muted'}
														size={'icon-sm'}
														className='rounded-full'>
														<Plus />
													</Button>
												)}
												{isSelected && (
													<div className='ml-4'>
														<CounterComponent
															count={quantity}
															countChangeEffect={(
																newCount,
															) =>
																handleAddonQuantityChange(
																	drink.id,
																	newCount,
																	'drink',
																)
															}
															className='w-[120px] py-1'
															disabledAdd={
																selectedDrinkCount >=
																	MAX_ADDONS &&
																quantity === 0
															}
														/>
													</div>
												)}
											</div>
											{index < drinks.length - 1 && (
												<Separator />
											)}
										</>
									);
								})}
							</div>
						</>
					)}

				{/* sides selection */}
				{(selectedProductItem as any)?.categories[0]?.category?.slug !==
					'sides' &&
					sides.length > 0 && (
						<>
							<div className='w-full bg-muted flex items-center gap-3 p-5 text-lg'>
								<p>Extra Sides</p>
								<Badge
									variant={'outline'}
									className='border-primary text-primary'>
									Optional
								</Badge>
							</div>
							<div className='px-5 space-y-3'>
								<p className='text-lg text-foreground/50'>
									SELECT UP TO 4 ITEMS
								</p>
								{sides.map((side, index) => {
									const quantity =
										selectedAddons[side.id] || 0;
									const isSelected = quantity > 0;

									return (
										<div key={side.id}>
											<div className='flex items-center justify-between'>
												<div className='flex items-center gap-3 flex-1'>
													<div className='flex-1 cursor-pointer text-start'>
														<p className='text-base text-foreground/50 font-medium'>
															{side.name}
														</p>
														{side.description && (
															<p className='text-sm text-foreground/50'>
																{
																	side.description
																}
															</p>
														)}
														<p className='text-sm text-foreground/70'>
															{formatCurency(
																side.price,
															)}
														</p>
													</div>
												</div>
												{!isSelected && (
													<Button
														onClick={() =>
															handleAddonToggle(
																side.id,
																'side',
															)
														}
														variant={'muted'}
														size={'icon-sm'}
														className='rounded-full'>
														<Plus />
													</Button>
												)}
												{isSelected && (
													<div className='ml-4'>
														<CounterComponent
															count={quantity}
															countChangeEffect={(
																newCount,
															) =>
																handleAddonQuantityChange(
																	side.id,
																	newCount,
																	'side',
																)
															}
															className='w-[120px] py-1'
															disabledAdd={
																selectedSideCount >=
																	MAX_ADDONS &&
																quantity === 0
															}
														/>
													</div>
												)}
											</div>
											{index < sides.length - 1 && (
												<Separator className='mt-3 mb-3' />
											)}
										</div>
									);
								})}
							</div>
						</>
					)}

				{/* Number of Packs */}
				<div className='p-5 w-full flex flex-col items-center text-center space-y-2'>
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
						{selectedItem?.pricingType === 'PER_UNIT' && (
							<p className='text-xs text-foreground/50'>
								{numberOfPacks} pack
								{numberOfPacks > 1 ? 's' : ''} × {unitQuantity}{' '}
								{selectedItem.unitName || 'units'}
							</p>
						)}
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
