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
import { vercelBlobFolderStructure } from '@/data/vercelBlobFolders';
import { Edit, Plus } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';

export default function EditProductItemModal({
	item,
	onSuccess,
}: {
	item: any;
	onSuccess: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: item.name,
		category: item.categories?.[0]?.categoryId || '',
		price: item.price.toString(),
		images: item.images || [],
		isActive: item.isActive,
		inStock: item.inStock,
	});

	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { updateProductItem } = useVendorDashboardActions();
	const { useListCategories } = useCategoryActions();
	const { data: categories = [] } = useListCategories({
		take: 20,
	});

	const updateDetailsMutation = updateProductItem({
		onSuccess: () => {
			toast.success('Menu variation updated');
			setOpen(false);
			onSuccess();
		},
	});

	const updateImageMutation = updateProductItem({
		onSuccess: (data: any) => {
			toast.success('Image updated');
			setFormData((prev) => ({ ...prev, images: data.images }));
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
				vercelBlobFolderStructure.vendorProductImages
			);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: uploadFormData,
			});

			if (!response.ok) throw new Error('Upload failed');
			const data = await response.json();
			updateImageMutation.mutate({
				id: item.id,
				data: {
					images: [data.url],
				},
			});
		} catch (error) {
			toast.error('Failed to upload image');
		} finally {
			setIsUploading(false);
		}
	};

	const handleRemoveImage = () => {
		updateImageMutation.mutate({
			id: item.id,
			data: {
				images: [],
			},
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateDetailsMutation.mutate({
			id: item.id,
			data: {
				name: formData.name,
				categories: [formData.category],
				price: parseFloat(formData.price),
				// Images are handled by updateImageMutation separately
				// ensure images are still passed, but only the current state
				images: formData.images,
				isActive: formData.isActive,
				inStock: formData.inStock,
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant='outline' size='sm'>
					<Edit size={14} />
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Edit Menu Variation</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='edit-name'>Item Name *</Label>
						<Input
							id='edit-name'
							value={formData.name}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									name: e.target.value,
								}))
							}
							required
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='edit-price'>Price (NGN) *</Label>
						<Input
							id='edit-price'
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
						/>
					</div>
					{categories.length > 0 && (
						<div className='space-y-2'>
							<Label htmlFor='item-category'>Category</Label>
							<select
								id='item-category'
								value={
									categories?.find((c) => {
										return c?.id === formData?.category;
									})?.id || ''
								}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										category: e.target.value,
									}))
								}
								className='w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm'>
								{categories.map((c) => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</select>
						</div>
					)}
					<div className='space-y-2'>
						<Label>Image</Label>
						<div className='flex gap-2 flex-wrap'>
							{formData.images.length > 0 ? (
								<div className='relative'>
									<ImageWithFallback
										src={formData.images[0]}
										alt={`Product image`}
										className='w-20 h-20 object-cover rounded border'
									/>
									<Button
										type='button'
										variant='destructive'
										size='sm'
										className='absolute -top-2 -right-2 h-5 w-5 p-0'
										onClick={handleRemoveImage}
										disabled={
											updateImageMutation.isPending
										}>
										×
									</Button>
								</div>
							) : (
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={() =>
										fileInputRef.current?.click()
									}
									disabled={isUploading}>
									{isUploading ? (
										'Uploading...'
									) : (
										<Plus size={16} />
									)}
								</Button>
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
							/>
						</div>
					</div>
					<div className='flex gap-4'>
						<div className='flex items-center gap-2'>
							<Checkbox
								id='edit-active'
								checked={formData.isActive}
								onCheckedChange={(checked) =>
									setFormData((prev) => ({
										...prev,
										isActive: checked === true,
									}))
								}
							/>
							<Label
								htmlFor='edit-active'
								className='cursor-pointer'>
								Active
							</Label>
						</div>
						<div className='flex items-center gap-2'>
							<Checkbox
								id='edit-stock'
								checked={formData.inStock}
								onCheckedChange={(checked) =>
									setFormData((prev) => ({
										...prev,
										inStock: checked === true,
									}))
								}
							/>
							<Label
								htmlFor='edit-stock'
								className='cursor-pointer'>
								In Stock
							</Label>
						</div>
					</div>
					<Button
						type='submit'
						variant='game'
						className='w-full'
						disabled={updateDetailsMutation.isPending}>
						{updateDetailsMutation.isPending
							? 'Updating...'
							: 'Update Variation'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
