'use client';

import { Trash, Plus, ChevronDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import CounterComponent from '../CounterComponent';
import { formatCurency } from '@/lib/commonFunctions';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { CartPack } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Inline edit section component for editing pack contents
interface PackEditSectionProps {
	pack: CartPack;
	mainItem: {
		id: string;
		name: string;
		price: number;
		vendorId: string;
		pricingType?: 'FIXED' | 'PER_UNIT';
		unitName?: string | null;
		minQuantity?: number;
		maxQuantity?: number | null;
		quantityStep?: number;
	} | null;
	onSave: (updates: Partial<CartPack>) => void;
	vendorId: string;
}

const PackEditSection = ({
	pack,
	mainItem, // eslint-disable-line @typescript-eslint/no-unused-vars
	onSave,
	vendorId,
}: PackEditSectionProps) => {
	const [selectedItemId, setSelectedItemId] = useState(pack.productItemId);
	const [unitQuantity, setUnitQuantity] = useState(pack.quantity);
	const [selectedAddons, setSelectedAddons] = useState<
		Record<string, number>
	>(
		pack.addons?.reduce(
			(acc, addon) => ({
				...acc,
				[addon.addonProductItemId]: addon.quantity,
			}),
			{},
		) || {},
	);

	// Fetch product items for selection
	const { data: productItems = [] } =
		useVendorProductActions().useListProductItems({
			vendorId,
		});

	// Fetch addon items (proteins and drinks)
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

	const selectedItem = productItems.find(
		(item) => item.id === selectedItemId,
	);

	// Initialize and sync unitQuantity from pack
	useEffect(() => {
		if (selectedItemId === pack.productItemId) {
			setUnitQuantity(pack.quantity);
		}
	}, [pack.quantity, pack.productItemId, selectedItemId]);

	// Update unitQuantity when selected item changes (user selects different variant)
	useEffect(() => {
		if (!selectedItem) return;

		if (selectedItem.pricingType === 'PER_UNIT') {
			const minQty = selectedItem.minQuantity || 1;
			const step = selectedItem.quantityStep || 1;

			// If it's the same item as in pack, validate pack.quantity
			// Otherwise, start with minQuantity
			if (selectedItemId === pack.productItemId) {
				// Same item - validate pack.quantity
				const currentQty = pack.quantity || minQty;
				const validQty = Math.max(
					minQty,
					Math.ceil(currentQty / step) * step,
				);
				setUnitQuantity(validQty);
			} else {
				// Different item - start with minQuantity
				const initialQty = Math.max(
					minQty,
					Math.ceil(minQty / step) * step,
				);
				setUnitQuantity(initialQty);
			}
		} else {
			// For FIXED items, quantity should be 1
			setUnitQuantity(1);
		}
	}, [selectedItem, selectedItemId, pack.productItemId, pack.quantity]);

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

	const MAX_ADDONS = 4;

	const handleAddonToggle = (addonId: string, type: 'protein' | 'drink') => {
		setSelectedAddons((prev) => {
			const current = prev[addonId] || 0;

			if (current > 0) {
				const newState = { ...prev };
				delete newState[addonId];
				return newState;
			}

			if (type === 'protein' && selectedProteinCount >= MAX_ADDONS) {
				return prev;
			}

			if (type === 'drink' && selectedDrinkCount >= MAX_ADDONS) {
				return prev;
			}

			return { ...prev, [addonId]: 1 };
		});
	};

	const handleAddonQuantityChange = (
		addonId: string,
		quantity: number,
		type: 'protein' | 'drink',
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
			type === 'protein' ? selectedProteinCount : selectedDrinkCount;
		const currentQuantity = selectedAddons[addonId] || 0;

		if (quantity > currentQuantity && currentTotal >= MAX_ADDONS) {
			return;
		}

		setSelectedAddons((prev) => ({
			...prev,
			[addonId]: quantity,
		}));
	};

	const handleSave = () => {
		const addons = Object.entries(selectedAddons)
			.filter(([, quantity]) => quantity > 0)
			.map(([addonProductItemId, quantity]) => ({
				addonProductItemId,
				quantity,
			}));

		onSave({
			productItemId: selectedItemId,
			quantity:
				selectedItem?.pricingType === 'PER_UNIT' ? unitQuantity : 1,
			numberOfPacks: pack.numberOfPacks || 1, // Preserve numberOfPacks
			addons: addons.length > 0 ? addons : undefined,
		});
	};

	return (
		<div className='space-y-5 bg-muted/30 rounded-lg p-5 border border-foreground/10'>
			{/* Main Item Selection */}
			<div className='w-full bg-muted flex items-center gap-3 p-3 text-base rounded'>
				<p>Select Size</p>
				<Badge
					variant={'outline'}
					className='border-destructive text-destructive'>
					Required
				</Badge>
			</div>

			<div className='px-2 space-y-2'>
				<p className='text-sm text-foreground/50'>SELECT 1</p>
				<RadioGroup
					value={selectedItemId}
					onValueChange={setSelectedItemId}
					className='w-full'>
					{productItems.map((item, index) => (
						<div key={item.id}>
							<div className='flex gap-3 w-full items-center justify-between'>
								<Label
									htmlFor={`edit-item-${item.id}`}
									className='flex-1'>
									<div>
										<p className='text-base text-foreground/50'>
											{item.name}
										</p>
										<p className='text-foreground/50 text-sm'>
											{formatCurency(item.price)}
											{item.pricingType === 'PER_UNIT' &&
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
									id={`edit-item-${item.id}`}
									className='w-5 h-5'
								/>
							</div>
							{/* Show unit quantity selector inline when this item is selected and is PER_UNIT */}
							{selectedItemId === item.id &&
								item.pricingType === 'PER_UNIT' && (
									<div className='mt-3 ml-8 space-y-2'>
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
												step={item.quantityStep || 1}
												className='max-w-[180px] py-2'
											/>
											<div className='text-xs text-foreground/50'>
												<p>
													{formatCurency(
														item.price *
															unitQuantity,
													)}{' '}
													total
												</p>
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

			{/* Extra Protein Selection */}
			{proteins.length > 0 && (
				<>
					<div className='w-full bg-muted flex items-center gap-3 p-3 text-base rounded'>
						<p>Extra Protein</p>
						<Badge
							variant={'outline'}
							className='border-primary text-primary'>
							Optional
						</Badge>
					</div>
					<div className='px-2 space-y-3'>
						<p className='text-sm text-foreground/50'>
							SELECT UP TO 4 ITEMS
						</p>
						{proteins.map((protein, index) => {
							const quantity = selectedAddons[protein.id] || 0;
							const isSelected = quantity > 0;

							return (
								<div key={protein.id}>
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-3 flex-1'>
											<div className='flex-1 cursor-pointer text-start'>
												<p className='text-sm text-foreground/50 font-medium'>
													{protein.name}
												</p>
												{protein.description && (
													<p className='text-xs text-foreground/50'>
														{protein.description}
													</p>
												)}
												<p className='text-xs text-foreground/70'>
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
												<Plus size={14} />
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
													className='w-[100px] py-1'
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
										<Separator className='mt-3' />
									)}
								</div>
							);
						})}
					</div>
				</>
			)}

			{/* Drinks Selection */}
			{drinks.length > 0 && (
				<>
					<div className='w-full bg-muted flex items-center gap-3 p-3 text-base rounded'>
						<p>Choose your preferred drink</p>
						<Badge
							variant={'outline'}
							className='border-primary text-primary'>
							Optional
						</Badge>
					</div>
					<div className='px-2 space-y-3'>
						<p className='text-sm text-foreground/50'>
							SELECT UP TO 4 ITEMS
						</p>
						{drinks.map((drink, index) => {
							const quantity = selectedAddons[drink.id] || 0;
							const isSelected = quantity > 0;

							return (
								<div key={drink.id}>
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-3 flex-1'>
											<div className='flex-1 cursor-pointer text-start'>
												<p className='text-sm text-foreground/50 font-medium'>
													{drink.name}
												</p>
												{drink.description && (
													<p className='text-xs text-foreground/50'>
														{drink.description}
													</p>
												)}
												<p className='text-xs text-foreground/70'>
													{formatCurency(drink.price)}
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
												<Plus size={14} />
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
													className='w-[100px] py-1'
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
										<Separator className='mt-3' />
									)}
								</div>
							);
						})}
					</div>
				</>
			)}

			{/* Save Button */}
			<div className='flex gap-2 pt-2'>
				<Button
					variant='outline'
					onClick={() => onSave({})}
					className='flex-1'>
					Cancel
				</Button>
				<Button onClick={handleSave} className='flex-1' variant='game'>
					Save Changes
				</Button>
			</div>
		</div>
	);
};

interface OrderSummaryItemProps {
	index: number;
	pack: CartPack;
	onRemove: () => void;
	onUpdate: (updates: Partial<CartPack>) => void;
}

const OrderSummaryItem = ({
	index,
	pack,
	onRemove,
	onUpdate,
}: OrderSummaryItemProps) => {
	// For PER_UNIT items: quantity = unit quantity (scoops), numberOfPacks = number of packs
	// For FIXED items: quantity = 1, numberOfPacks = number of items
	const [numberOfPacks, setNumberOfPacks] = useState(pack.numberOfPacks || 1);
	const [isEditOpen, setIsEditOpen] = useState(false);

	// Fetch main product item
	const { data: mainItem } = useVendorProductActions().useGetProductItemById({
		id: pack.productItemId,
	});

	// Fetch addon items
	const addonIds = pack.addons?.map((a) => a.addonProductItemId) || [];
	const { data: addonItemsData = [] } =
		useVendorProductActions().useGetProductItemsByIds({ ids: addonIds });
	const addonItems = addonItemsData;

	// Calculate pack total
	const packTotal = useMemo(() => {
		if (!mainItem) return 0;

		// For PER_UNIT: price per unit * unit quantity * number of packs
		// For FIXED: price * number of packs
		const unitQuantity = pack.quantity || 1;
		const packs = numberOfPacks || 1;

		let total = 0;
		if (mainItem.pricingType === 'PER_UNIT') {
			total = mainItem.price * unitQuantity * packs;

			// Add packaging fee for PER_UNIT items (once per pack)
			if (mainItem.packagingFee) {
				total += mainItem.packagingFee * packs;
			}
		} else {
			total = mainItem.price * packs;
		}

		// Add addon prices
		if (pack.addons) {
			pack.addons.forEach((addon) => {
				const addonItem = addonItems.find(
					(item) => item?.id === addon.addonProductItemId,
				);
				if (addonItem) {
					// Addons are multiplied by addon quantity and number of packs
					// For PER_UNIT items, addons are per pack, not per unit
					total += addonItem.price * addon.quantity * packs;
				}
			});
		}

		return total;
	}, [mainItem, pack.addons, pack.quantity, addonItems, numberOfPacks]);

	// Sync numberOfPacks when pack.numberOfPacks changes
	useEffect(() => {
		setNumberOfPacks(pack.numberOfPacks || 1);
	}, [pack.numberOfPacks]);

	// Update pack when numberOfPacks changes
	useEffect(() => {
		if (numberOfPacks !== (pack.numberOfPacks || 1)) {
			onUpdate({ numberOfPacks });
		}
	}, [numberOfPacks, pack.numberOfPacks, onUpdate]);

	if (!mainItem) {
		return (
			<div className='p-5 border-b border-foreground/50'>
				<p>Loading...</p>
			</div>
		);
	}

	return (
		<div className='p-5 border-b border-foreground/50'>
			<div className='flex justify-between mb-3'>
				<p className='font-semibold'>Pack #{index}</p>
				<Button
					variant='ghost'
					size='sm'
					onClick={onRemove}
					className='p-2 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20'>
					<Trash size={12} />
				</Button>
			</div>
			<div className='flex justify-between items-start'>
				<div className='flex-1'>
					<div className='flex gap-1 items-center'>
						<span className='w-2 h-2 rounded-full bg-foreground' />{' '}
						<p className='text-lg'>
							{mainItem.name}
							{mainItem.pricingType === 'PER_UNIT' &&
								mainItem.unitName && (
									<span className='text-sm text-foreground/50 ml-1'>
										({pack.quantity} {mainItem.unitName}
										{pack.quantity !== 1 ? 's' : ''})
									</span>
								)}
						</p>
					</div>
					{pack.addons && pack.addons.length > 0 && (
						<div className='flex flex-col gap-1 pl-3 mt-1'>
							{pack.addons.map((addon, idx) => {
								const addonItem = addonItems.find(
									(item) =>
										item?.id === addon.addonProductItemId,
								);
								if (!addonItem) return null;
								return (
									<p className='font-light text-sm' key={idx}>
										{addonItem.name} x{addon.quantity}
									</p>
								);
							})}
						</div>
					)}
				</div>
				<div className='ml-4'>
					<CounterComponent
						count={numberOfPacks}
						setCount={setNumberOfPacks}
						className='w-[120px] py-2'
						min={1}
					/>
				</div>
			</div>
			<div className='flex justify-between items-center mt-2'>
				<Collapsible open={isEditOpen} onOpenChange={setIsEditOpen}>
					<CollapsibleTrigger asChild>
						<Button
							variant='link'
							className='text-primary text-sm p-0 h-auto flex items-center gap-1'>
							{isEditOpen ? 'Close' : 'Edit pack'}
							<ChevronDown
								className={`h-3 w-3 transition-transform ${
									isEditOpen ? 'rotate-180' : ''
								}`}
							/>
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent className='mt-4'>
						<PackEditSection
							pack={pack}
							mainItem={mainItem}
							onSave={(updates: Partial<CartPack>) => {
								onUpdate(updates);
								setIsEditOpen(false);
							}}
							vendorId={mainItem.vendorId}
						/>
					</CollapsibleContent>
				</Collapsible>
				<p className='font-semibold text-lg'>
					{formatCurency(packTotal)}
				</p>
			</div>
		</div>
	);
};

export default OrderSummaryItem;
