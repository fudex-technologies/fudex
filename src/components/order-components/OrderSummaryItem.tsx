'use client';

import { Trash } from 'lucide-react';
import { useState, useEffect } from 'react';
import CounterComponent from '../CounterComponent';
import { formatCurency } from '@/lib/commonFunctions';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { CartPack } from '@/store/cart-store';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
	const [quantity, setQuantity] = useState(pack.quantity);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
		let total = mainItem.price * quantity;

		if (pack.addons) {
			pack.addons.forEach((addon) => {
				const addonItem = addonItems.find(
					(item) => item?.id === addon.addonProductItemId
				);
				if (addonItem) {
					total += addonItem.price * addon.quantity * quantity;
				}
			});
		}

		return total;
	}, [mainItem, pack.addons, addonItems, quantity]);

	useEffect(() => {
		if (quantity !== pack.quantity) {
			onUpdate({ quantity });
		}
	}, [quantity, pack.quantity, onUpdate]);

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
						<p className='text-lg'>{mainItem.name}</p>
					</div>
					{pack.addons && pack.addons.length > 0 && (
						<div className='flex flex-col gap-1 pl-3 mt-1'>
							{pack.addons.map((addon, idx) => {
								const addonItem = addonItems.find(
									(item) =>
										item?.id === addon.addonProductItemId
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
						count={quantity}
						setCount={setQuantity}
						className='w-[120px] py-2'
					/>
				</div>
			</div>
			<div className='flex justify-between items-center mt-2'>
				<Dialog
					open={isEditDialogOpen}
					onOpenChange={setIsEditDialogOpen}>
					<DialogTrigger asChild>
						<Button
							variant='link'
							className='text-primary text-sm p-0 h-auto'>
							Edit pack
						</Button>
					</DialogTrigger>
					<DialogContent className='max-w-md max-h-[80vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>Edit Pack #{index}</DialogTitle>
						</DialogHeader>
						<PackEditDialog
							pack={pack}
							onSave={(updates) => {
								onUpdate(updates);
								setIsEditDialogOpen(false);
							}}
							vendorId={mainItem.vendorId}
						/>
					</DialogContent>
				</Dialog>
				<p className='font-semibold text-lg'>
					{formatCurency(packTotal)}
				</p>
			</div>
		</div>
	);
};

// Edit dialog component for editing pack contents
interface PackEditDialogProps {
	pack: CartPack;
	onSave: (updates: Partial<CartPack>) => void;
	vendorId: string;
}

const PackEditDialog = ({ pack, onSave, vendorId }: PackEditDialogProps) => {
	const [selectedItemId, setSelectedItemId] = useState(pack.productItemId);
	const [selectedAddons, setSelectedAddons] = useState<
		Record<string, number>
	>(
		pack.addons?.reduce(
			(acc, addon) => ({
				...acc,
				[addon.addonProductItemId]: addon.quantity,
			}),
			{}
		) || {}
	);

	// Fetch product items for selection
	const { data: productItems = [] } =
		useVendorProductActions().useListProductItems({
			vendorId,
		});

	// Fetch addon items
	const { data: addonItems = [] } =
		useVendorProductActions().useGetAddonProductItems({
			vendorId,
			excludeProductItemIds: [selectedItemId],
		});

	const handleSave = () => {
		const addons = Object.entries(selectedAddons)
			.filter(([, quantity]) => quantity > 0)
			.map(([addonProductItemId, quantity]) => ({
				addonProductItemId,
				quantity,
			}));

		onSave({
			productItemId: selectedItemId,
			addons: addons.length > 0 ? addons : undefined,
		});
	};

	return (
		<div className='space-y-4'>
			{/* Main Item Selection */}
			<div>
				<Label className='text-base font-semibold mb-2 block'>
					Select Main Item
				</Label>
				<RadioGroup
					value={selectedItemId}
					onValueChange={setSelectedItemId}
					className='space-y-2'>
					{productItems.map((item) => (
						<div
							key={item.id}
							className='flex items-center justify-between p-2 rounded border'>
							<Label
								htmlFor={`edit-item-${item.id}`}
								className='flex-1 cursor-pointer'>
								<div>
									<p className='font-medium'>{item.name}</p>
									<p className='text-sm text-foreground/50'>
										{formatCurency(item.price)}
									</p>
								</div>
							</Label>
							<RadioGroupItem
								value={item.id}
								id={`edit-item-${item.id}`}
							/>
						</div>
					))}
				</RadioGroup>
			</div>

			{/* Addons Selection */}
			{addonItems.length > 0 && (
				<div>
					<Label className='text-base font-semibold mb-2 block'>
						Add-ons (Optional)
					</Label>
					<div className='space-y-2'>
						{addonItems.map(
							(addon: {
								id: string;
								name: string;
								price: number;
							}) => {
								const quantity = selectedAddons[addon.id] || 0;
								const isSelected = quantity > 0;

								return (
									<div
										key={addon.id}
										className='flex items-center justify-between p-2 rounded border'>
										<div className='flex items-center gap-2 flex-1'>
											<Checkbox
												id={`edit-addon-${addon.id}`}
												checked={isSelected}
												onCheckedChange={() => {
													if (isSelected) {
														setSelectedAddons(
															(prev) => {
																const newState =
																	{ ...prev };
																delete newState[
																	addon.id
																];
																return newState;
															}
														);
													} else {
														setSelectedAddons(
															(prev) => ({
																...prev,
																[addon.id]: 1,
															})
														);
													}
												}}
											/>
											<Label
												htmlFor={`edit-addon-${addon.id}`}
												className='flex-1 cursor-pointer'>
												<div>
													<p className='text-sm font-medium'>
														{addon.name}
													</p>
													<p className='text-xs text-foreground/50'>
														{formatCurency(
															addon.price
														)}
													</p>
												</div>
											</Label>
										</div>
										{isSelected && (
											<CounterComponent
												count={quantity}
												setCount={(newCount) => {
													const num =
														typeof newCount ===
														'function'
															? newCount(quantity)
															: newCount;
													if (num <= 0) {
														setSelectedAddons(
															(prev) => {
																const newState =
																	{ ...prev };
																delete newState[
																	addon.id
																];
																return newState;
															}
														);
													} else {
														setSelectedAddons(
															(prev) => ({
																...prev,
																[addon.id]: num,
															})
														);
													}
												}}
												countChangeEffect={(
													newCount
												) => {
													if (newCount <= 0) {
														setSelectedAddons(
															(prev) => {
																const newState =
																	{ ...prev };
																delete newState[
																	addon.id
																];
																return newState;
															}
														);
													} else {
														setSelectedAddons(
															(prev) => ({
																...prev,
																[addon.id]:
																	newCount,
															})
														);
													}
												}}
												className='w-[100px] py-1'
											/>
										)}
									</div>
								);
							}
						)}
					</div>
				</div>
			)}

			<div className='flex gap-2 pt-4'>
				<Button
					variant='outline'
					onClick={() => onSave({})}
					className='flex-1'>
					Cancel
				</Button>
				<Button onClick={handleSave} className='flex-1'>
					Save Changes
				</Button>
			</div>
		</div>
	);
};

export default OrderSummaryItem;
