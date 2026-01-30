'use client';

import { useCategoryActions } from '@/api-hooks/useCategoryActions';
import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { vercelBlobFolderStructure } from '@/data/vercelBlobFolders';
import { Plus, Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

function CreateProductItemModal({
	products,
	onSuccess,
	vendorId,
}: {
	products: Array<{ id: string; name: string }>;
	onSuccess: () => void;
	vendorId?: string;
}) {
	const [open, setOpen] = useState(false);
	const [createdProductItemId, setCreatedProductItemId] = useState<
		string | null
	>(null);
	const [formData, setFormData] = useState({
		productId: products.length === 1 ? products[0].id : '',
		name: '',
		category: '',
		description: '',
		price: '',
		images: [] as string[],
		isActive: true,
		inStock: true,
		pricingType: 'FIXED' as 'FIXED' | 'PER_UNIT',
		unitName: '',
		minQuantity: '1',
		maxQuantity: '',
		quantityStep: '1',
	});
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { useListCategories } = useCategoryActions();
	const { data: categories = [] } = useListCategories({ take: 20 });
	const { createProductItem, useGetMyVendor, updateProductItem } =
		useVendorDashboardActions();
	const { data: vendor } = useGetMyVendor();

	useEffect(() => {
		if (open) {
			setFormData({
				productId: products.length === 1 ? products[0].id : '',
				name: '',
				category: '',
				description: '',
				price: '',
				images: [],
				isActive: true,
				inStock: true,
				pricingType: 'FIXED',
				unitName: '',
				minQuantity: '1',
				maxQuantity: '',
				quantityStep: '1',
			});
			setCreatedProductItemId(null);
		}
	}, [open, products]);

	const updateProductItemMutate = updateProductItem({
		onSuccess: (data: any) => {
			setFormData((prev) => ({ ...prev, images: data.images }));
		},
	});

	const createProductMutate = createProductItem({
		onSuccess: (data: any) => {
			setCreatedProductItemId(data.id);
			setFormData({
				productId: data.productId ?? '',
				name: data.name,
				category: data.categories[0]?.id ?? '',
				description: data.description ?? '',
				price: String(data.price),
				images: data.images,
				isActive: data.isActive,
				inStock: data.inStock,
				pricingType: data.pricingType,
				unitName: data.unitName || '',
				minQuantity: data.minQuantity
					? String(data.minQuantity)
					: '1',
				maxQuantity: data.maxQuantity
					? String(data.maxQuantity)
					: '',
				quantityStep: data.quantityStep
					? String(data.quantityStep)
					: '1',
			});
		},
	});

	const handleFileUpload = async (file: File) => {
		if (!file.type.startsWith('image/')) {
			toast.error('Please upload an image file');
			return;
		}

		setIsUploading(true);
		try {
			const uploadFormData = new FormData();
			uploadFormData.append('file', file);
			uploadFormData.append(
				'folder',
				vercelBlobFolderStructure.vendorProductImages,
			);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: uploadFormData,
			});

			if (!response.ok) throw new Error('Upload failed');
			const data = await response.json();

			if (createdProductItemId) {
				updateProductItemMutate.mutate({
					id: createdProductItemId,
					data: {
						images: [data.url],
					},
				});
			} else {
				setFormData((prev) => ({
					...prev,
					images: [data.url],
				}));
			}
			toast.success('Image uploaded successfully');
		} catch (error) {
			toast.error('Failed to upload image');
		} finally {
			setIsUploading(false);
		}
	};

	const handleRemoveImage = () => {
		if (createdProductItemId) {
			updateProductItemMutate.mutate({
				id: createdProductItemId,
				data: {
					images: [],
				},
			});
		} else {
			setFormData((prev) => ({
				...prev,
				images: [],
			}));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (createdProductItemId) {
			return;
		}

		const targetVendorId = vendorId || vendor?.id;
		if (!targetVendorId) {
			toast.error('Vendor not found');
			return;
		}

		if (formData.images.length === 0) {
			toast.error('Please upload at least one image');
			return;
		}
		// Validate PER_UNIT fields
		if (formData.pricingType === 'PER_UNIT' && !formData.unitName.trim()) {
			toast.error('Unit name is required for per-unit pricing');
			return;
		}

		const minQty = parseInt(formData.minQuantity) || 1;
		const maxQty = formData.maxQuantity ? parseInt(formData.maxQuantity) : null;
		if (maxQty !== null && maxQty <= minQty) {
			toast.error('Maximum quantity must be greater than minimum quantity');
			return;
		}

		createProductMutate.mutate({
			vendorId: targetVendorId,
			productId: formData.productId || undefined,
			name: formData.name,
			categories: [formData.category],
			description: formData.description || undefined,
			price: parseFloat(formData.price),
			images: formData.images,
			isActive: formData.isActive,
			inStock: formData.inStock,
			pricingType: formData.pricingType,
			unitName: formData.pricingType === 'PER_UNIT' ? formData.unitName : null,
			minQuantity: formData.pricingType === 'PER_UNIT' ? minQty : undefined,
			maxQuantity: formData.pricingType === 'PER_UNIT' ? maxQty : null,
			quantityStep: formData.pricingType === 'PER_UNIT' ? parseInt(formData.quantityStep) || 1 : undefined,
		});
	};

	const handleClose = () => {
		setOpen(false);
		onSuccess();
	};

	const isEditMode = !!createdProductItemId;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size={'sm'}>
					<Plus size={16} className='mr-2' />
					Add Menu Variation
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>
						{isEditMode
							? 'Update Menu Variation'
							: 'Create Menu Variation'}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<Label className='text-base font-semibold'>
							Product Image *
						</Label>
						<div
							className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer hover:bg-muted/50 ${
								formData.images.length > 0
									? 'border-primary/50'
									: 'border-muted-foreground/25'
							}`}
							onClick={() => {
								if (
									formData.images.length === 0 &&
									!isUploading
								) {
									fileInputRef.current?.click();
								}
							}}>
							{formData.images.length > 0 ? (
								<div className='relative w-full aspect-video md:aspect-[2.4/1] overflow-hidden rounded-lg'>
									<ImageWithFallback
										src={formData.images[0]}
										alt='Product preview'
										className='w-full h-full object-cover'
									/>
									<Button
										type='button'
										variant='destructive'
										size='icon'
										className='absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg'
										onClick={(e) => {
											e.stopPropagation();
											handleRemoveImage();
										}}
										disabled={
											updateProductItemMutate.isPending
										}>
										<X size={16} />
									</Button>
								</div>
							) : (
								<div className='flex flex-col items-center py-4 space-y-3'>
									<div className='p-4 rounded-full bg-primary/10 text-primary'>
										{isUploading ? (
											<div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
										) : (
											<Upload size={32} />
										)}
									</div>
									<div className='text-center'>
										<p className='text-sm font-medium'>
											{isUploading
												? 'Uploading image...'
												: 'Click to upload product image'}
										</p>
										<p className='text-xs text-muted-foreground mt-1'>
											PNG, JPG or WEBP (Max. 5MB)
										</p>
									</div>
								</div>
							)}
							<input
								ref={fileInputRef}
								type='file'
								accept='image/*'
								className='hidden'
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) handleFileUpload(file);
								}}
								disabled={isUploading}
							/>
						</div>
					</div>

					{products.length > 1 && (
						<div className='space-y-2'>
							<Label htmlFor='item-product'>
								Menu Item (Optional)
							</Label>
							<select
								id='item-product'
								value={formData.productId}
								disabled={isEditMode}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										productId: e.target.value,
									}))
								}
								className='w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm'>
								<option value=''>Standalone Item</option>
								{products.map((p) => (
									<option key={p.id} value={p.id}>
										{p.name}
									</option>
								))}
							</select>
						</div>
					)}
					{categories.length > 0 && (
						<div className='space-y-2'>
							<Label htmlFor='item-category'>Category</Label>
							<select
								id='item-category'
								value={formData.category}
								disabled={isEditMode}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										category: e.target.value,
									}))
								}
								className='w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm'>
								<option value=''>Select a category</option>
								{categories.map((c) => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</select>
						</div>
					)}
					<div className='space-y-2'>
						<Label htmlFor='item-name'>Item Name *</Label>
						<Input
							id='item-name'
							value={formData.name}
							disabled={isEditMode}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									name: e.target.value,
								}))
							}
							required
							placeholder='e.g., Big Pack'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='item-pricing-type'>Pricing Type *</Label>
						<select
							id='item-pricing-type'
							value={formData.pricingType}
							disabled={isEditMode}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									pricingType: e.target.value as 'FIXED' | 'PER_UNIT',
								}))
							}
							className='w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm'>
							<option value='FIXED'>Fixed Price (Traditional)</option>
							<option value='PER_UNIT'>Per Unit (e.g., per scoop, wrap, piece)</option>
						</select>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='item-price'>
							Price (NGN) *{' '}
							{formData.pricingType === 'PER_UNIT' && (
								<span className='text-xs text-foreground/50'>
									(per unit)
								</span>
							)}
						</Label>
						<Input
							id='item-price'
							type='number'
							step='0.01'
							value={formData.price}
							disabled={isEditMode}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									price: e.target.value,
								}))
							}
							required
							placeholder='1500.00'
						/>
					</div>

					{formData.pricingType === 'PER_UNIT' && (
						<>
							<div className='space-y-2'>
								<Label htmlFor='item-unit-name'>
									Unit Name * (e.g., scoop, wrap, piece, kg)
								</Label>
								<Input
									id='item-unit-name'
									value={formData.unitName}
									disabled={isEditMode}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											unitName: e.target.value,
										}))
									}
									required
									placeholder='scoop'
								/>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='item-min-quantity'>
										Minimum Quantity *
									</Label>
									<Input
										id='item-min-quantity'
										type='number'
										min='1'
										value={formData.minQuantity}
										disabled={isEditMode}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												minQuantity: e.target.value,
											}))
										}
										required
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='item-max-quantity'>
										Maximum Quantity (Optional)
									</Label>
									<Input
										id='item-max-quantity'
										type='number'
										min='1'
										value={formData.maxQuantity}
										disabled={isEditMode}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												maxQuantity: e.target.value,
											}))
										}
										placeholder='No limit'
									/>
								</div>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='item-quantity-step'>
									Quantity Step (Optional)
								</Label>
								<Input
									id='item-quantity-step'
									type='number'
									min='1'
									value={formData.quantityStep}
									disabled={isEditMode}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											quantityStep: e.target.value,
										}))
									}
									placeholder='1'
								/>
								<p className='text-xs text-foreground/50'>
									Customers can only order in multiples of this number
								</p>
							</div>
						</>
					)}
					<div className='space-y-2'>
						<Label htmlFor='item-desc'>Description</Label>
						<Textarea
							id='item-desc'
							value={formData.description}
							disabled={isEditMode}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							placeholder='Item description...'
							rows={3}
						/>
					</div>

					<div className='flex gap-4'>
						<div className='flex items-center gap-2'>
							<Checkbox
								id='item-active'
								checked={formData.isActive}
								disabled={isEditMode}
								onCheckedChange={(checked) =>
									setFormData((prev) => ({
										...prev,
										isActive: checked === true,
									}))
								}
							/>
							<Label
								htmlFor='item-active'
								className='cursor-pointer'>
								Active
							</Label>
						</div>
						<div className='flex items-center gap-2'>
							<Checkbox
								id='item-stock'
								checked={formData.inStock}
								disabled={isEditMode}
								onCheckedChange={(checked) =>
									setFormData((prev) => ({
										...prev,
										inStock: checked === true,
									}))
								}
							/>
							<Label
								htmlFor='item-stock'
								className='cursor-pointer'>
								In Stock
							</Label>
						</div>
					</div>

					{isEditMode ? (
						<Button
							type='button'
							variant='game'
							className='w-full'
							onClick={handleClose}>
							Done
						</Button>
					) : (
						<Button
							type='submit'
							variant='game'
							className='w-full'
							disabled={createProductMutate.isPending}>
							{createProductMutate.isPending
								? 'Creating...'
								: 'Create Variation'}
						</Button>
					)}
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default CreateProductItemModal;
