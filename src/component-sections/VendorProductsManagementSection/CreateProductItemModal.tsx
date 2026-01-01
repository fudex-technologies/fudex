'use client';

import { useVendorProductActions } from '@/api-hooks/useVendorActions';
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
import { Plus } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';

// Create Product Item Dialog
function CreateProductItemModal({
	products,
	onSuccess,
}: {
	products: Array<{ id: string; name: string }>;
	onSuccess: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState({
		productId: '',
		name: '',
		slug: '',
		description: '',
		price: '',
		images: [] as string[],
		isActive: true,
		inStock: true,
	});
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { useGetMyVendor } = useVendorDashboardActions();
	const { data: vendor } = useGetMyVendor();
	const { createProductItem } = useVendorProductActions();

	const createProductMutate = createProductItem({
		onSuccess: () => {
			toast.success('Product item created');
			setOpen(false);
			setFormData({
				productId: '',
				name: '',
				slug: '',
				description: '',
				price: '',
				images: [],
				isActive: true,
				inStock: true,
			});
			onSuccess();
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
			uploadFormData.append('folder', 'products');

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: uploadFormData,
			});

			if (!response.ok) throw new Error('Upload failed');
			const data = await response.json();
			setFormData((prev) => ({
				...prev,
				images: [...prev.images, data.url],
			}));
			toast.success('Image uploaded');
		} catch (error) {
			toast.error('Failed to upload image');
		} finally {
			setIsUploading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!vendor) {
			toast.error('Vendor not found');
			return;
		}
		createProductMutate.mutate({
			vendorId: vendor.id,
			productId: formData.productId || undefined,
			name: formData.name,
			slug:
				formData.slug ||
				formData.name.toLowerCase().replace(/\s+/g, '-'),
			description: formData.description || undefined,
			price: parseFloat(formData.price),
			images: formData.images,
			isActive: formData.isActive,
			inStock: formData.inStock,
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant='outline'>
					<Plus size={16} className='mr-2' />
					Add Product Item
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Create Product Item</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					{products.length > 0 && (
						<div className='space-y-2'>
							<Label htmlFor='item-product'>
								Product (Optional)
							</Label>
							<select
								id='item-product'
								value={formData.productId}
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
					<div className='space-y-2'>
						<Label htmlFor='item-name'>Item Name *</Label>
						<Input
							id='item-name'
							value={formData.name}
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
						<Label htmlFor='item-slug'>
							Slug (auto-generated if empty)
						</Label>
						<Input
							id='item-slug'
							value={formData.slug}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									slug: e.target.value,
								}))
							}
							placeholder='big-pack'
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='item-price'>Price (NGN) *</Label>
						<Input
							id='item-price'
							type='number'
							step='0.01'
							value={formData.price}
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
					<div className='space-y-2'>
						<Label htmlFor='item-desc'>Description</Label>
						<Textarea
							id='item-desc'
							value={formData.description}
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
					<div className='space-y-2'>
						<Label>Images</Label>
						<div className='flex gap-2 flex-wrap'>
							{formData.images.map((url, idx) => (
								<div key={idx} className='relative'>
									<ImageWithFallback
										src={url}
										alt={`Image ${idx + 1}`}
										className='w-20 h-20 object-cover rounded border'
									/>
									<Button
										type='button'
										variant='destructive'
										size='sm'
										className='absolute -top-2 -right-2 h-5 w-5 p-0'
										onClick={() => {
											setFormData((prev) => ({
												...prev,
												images: prev.images.filter(
													(_, i) => i !== idx
												),
											}));
										}}>
										×
									</Button>
								</div>
							))}
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => fileInputRef.current?.click()}
								disabled={isUploading}>
								<Plus size={16} />
							</Button>
							<input
								ref={fileInputRef}
								type='file'
								accept='image/*'
								className='hidden'
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) handleFileUpload(file);
								}}
							/>
						</div>
					</div>
					<div className='flex gap-4'>
						<div className='flex items-center gap-2'>
							<Checkbox
								id='item-active'
								checked={formData.isActive}
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
					<Button
						type='submit'
						variant='game'
						className='w-full'
						disabled={createProductMutate.isPending}>
						{createProductMutate.isPending
							? 'Creating...'
							: 'Create Item'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default CreateProductItemModal;
