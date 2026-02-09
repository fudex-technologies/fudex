'use client';

import { useState, useMemo } from 'react';
import { usePackageAdminActions } from '@/api-hooks/usePackageActions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Badge } from '@/components/ui/badge';
import { formatCurency } from '@/lib/commonFunctions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { vercelBlobFolderStructure } from '@/data/vercelBlobFolders';

const packageItemFormSchema = z.object({
	categoryId: z.string().min(1, 'Category is required'),
	name: z.string().min(1, 'Item name is required'),
	slug: z.string().min(1, 'Item slug is required'),
	description: z.string().optional(),
	price: z.string().min(1, 'Price is required'),
	images: z.array(z.string()).default([]),
	isActive: z.boolean().default(true),
	inStock: z.boolean().default(true),
});

type PackageItemFormValues = z.infer<typeof packageItemFormSchema>;

interface PackageItemManagementProps {
	packageId: string;
	categories: Array<{ id: string; name: string; slug: string }>;
	onSuccess: () => void;
}

export default function PackageItemManagement({
	packageId,
	categories,
	onSuccess,
}: PackageItemManagementProps) {
	const { useGetPackageById, createPackageItem, updatePackageItem, deletePackageItem } =
		usePackageAdminActions();

	const { data: packageData, refetch } = useGetPackageById(
		{ id: packageId },
		{ enabled: !!packageId }
	);

	// Get all items from all categories
	const allItems = useMemo(() => {
		if (!packageData?.categories) return [];
		return packageData.categories.flatMap((cat) => cat.items || []);
	}, [packageData]);

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<any>(null);
	const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const createMutation = createPackageItem({
		onSuccess: () => {
			refetch();
			onSuccess();
			setIsCreateDialogOpen(false);
		},
	});

	const updateMutation = updatePackageItem({
		onSuccess: () => {
			refetch();
			onSuccess();
			setEditingItem(null);
		},
	});

	const deleteMutation = deletePackageItem({
		onSuccess: () => {
			refetch();
			onSuccess();
			setDeletingItemId(null);
		},
	});

	const handleCreateSubmit = (data: PackageItemFormValues) => {
		createMutation.mutate({
			packageId,
			categoryId: data.categoryId,
			name: data.name,
			slug: data.slug,
			description: data.description || undefined,
			price: parseFloat(data.price),
			images: data.images,
			isActive: data.isActive,
			inStock: data.inStock,
		});
	};

	const handleUpdateSubmit = (data: PackageItemFormValues) => {
		if (editingItem) {
			updateMutation.mutate({
				id: editingItem.id,
				name: data.name,
				slug: data.slug,
				description: data.description || null,
				price: parseFloat(data.price),
				images: data.images,
				isActive: data.isActive,
				inStock: data.inStock,
				categoryId: data.categoryId,
			});
		}
	};

	const handleImageUpload = async (file: File, form: any) => {
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
				vercelBlobFolderStructure.packageItemImages
			);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: uploadFormData,
			});

			if (!response.ok) throw new Error('Upload failed');
			const data = await response.json();

			const currentImages = form.getValues('images') || [];
			form.setValue('images', [...currentImages, data.url]);
			toast.success('Image uploaded successfully');
		} catch (error) {
			toast.error('Failed to upload image');
		} finally {
			setIsUploading(false);
		}
	};

	const handleRemoveImage = (index: number, form: any) => {
		const currentImages = form.getValues('images') || [];
		form.setValue(
			'images',
			currentImages.filter((_: any, i: number) => i !== index)
		);
	};

	const defaultValues = useMemo(
		() =>
			editingItem
				? {
						categoryId: editingItem.categoryId || '',
						name: editingItem.name || '',
						slug: editingItem.slug || '',
						description: editingItem.description || '',
						price: String(editingItem.price || ''),
						images: editingItem.images || [],
						isActive: editingItem.isActive ?? true,
						inStock: editingItem.inStock ?? true,
				  }
				: undefined,
		[editingItem]
	);

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h3 className='text-xl font-semibold'>Package Items</h3>
					<p className='text-sm text-muted-foreground'>
						Manage items within package categories
					</p>
				</div>
				<Dialog
					open={isCreateDialogOpen}
					onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button className='flex items-center gap-2' disabled={categories.length === 0}>
							<Plus size={18} />
							Add Item
						</Button>
					</DialogTrigger>
					<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>Create New Package Item</DialogTitle>
						</DialogHeader>
						<PackageItemForm
							onSubmit={handleCreateSubmit}
							isPending={createMutation.isPending}
							categories={categories}
							onImageUpload={handleImageUpload}
							onRemoveImage={handleRemoveImage}
							isUploading={isUploading}
							onCancel={() => setIsCreateDialogOpen(false)}
						/>
					</DialogContent>
				</Dialog>
			</div>

			{allItems.length === 0 ? (
				<div className='flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl border-border/50'>
					<p className='text-muted-foreground'>
						{categories.length === 0
							? 'Create categories first before adding items'
							: 'No items created yet'}
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{allItems.map((item) => {
						const category = categories.find((c) => c.id === item.categoryId);
						return (
							<div
								key={item.id}
								className={cn(
									'p-4 border rounded-lg hover:border-primary/50 transition-colors'
								)}>
								<div className='relative w-full aspect-square rounded-lg overflow-hidden bg-muted mb-3'>
									{item.images && item.images.length > 0 ? (
										<ImageWithFallback
											src={item.images[0]}
											alt={item.name}
											className='object-cover w-full h-full'
										/>
									) : (
										<div className='w-full h-full flex items-center justify-center text-muted-foreground'>
											No image
										</div>
									)}
								</div>
								<div className='space-y-1'>
									<div className='flex items-start justify-between'>
										<div className='flex-1'>
											<h4 className='font-semibold'>{item.name}</h4>
											{category && (
												<p className='text-xs text-muted-foreground'>
													{category.name}
												</p>
											)}
											<p className='text-sm font-medium text-primary mt-1'>
												{formatCurency(item.price)}
											</p>
										</div>
										<div className='flex gap-1'>
											<Button
												size='icon'
												variant='ghost'
												className='h-8 w-8'
												onClick={() => setEditingItem(item)}>
												<Edit size={14} />
											</Button>
											<Button
												size='icon'
												variant='ghost'
												className='h-8 w-8 text-destructive'
												onClick={() => setDeletingItemId(item.id)}>
												<Trash2 size={14} />
											</Button>
										</div>
									</div>
									<div className='flex gap-2 mt-2'>
										<Badge
											variant={item.isActive ? 'default' : 'secondary'}
											className='text-xs'>
											{item.isActive ? 'Active' : 'Inactive'}
										</Badge>
										<Badge
											variant={item.inStock ? 'default' : 'destructive'}
											className='text-xs'>
											{item.inStock ? 'In Stock' : 'Out of Stock'}
										</Badge>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			<Dialog
				open={!!editingItem}
				onOpenChange={(open) => !open && setEditingItem(null)}>
				<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Edit Package Item</DialogTitle>
					</DialogHeader>
					{editingItem && (
						<PackageItemForm
							onSubmit={handleUpdateSubmit}
							isPending={updateMutation.isPending}
							initialData={defaultValues}
							categories={categories}
							onImageUpload={handleImageUpload}
							onRemoveImage={handleRemoveImage}
							isUploading={isUploading}
							onCancel={() => setEditingItem(null)}
						/>
					)}
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={!!deletingItemId}
				onOpenChange={(open) => !open && setDeletingItemId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Package Item</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this item? This action cannot
							be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (deletingItemId) {
									deleteMutation.mutate({
										id: deletingItemId,
									});
								}
							}}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

function PackageItemForm({
	onSubmit,
	isPending,
	initialData,
	categories,
	onImageUpload,
	onRemoveImage,
	isUploading,
	onCancel,
}: {
	onSubmit: (data: PackageItemFormValues) => void;
	isPending: boolean;
	initialData?: PackageItemFormValues;
	categories: Array<{ id: string; name: string }>;
	onImageUpload: (file: File, form: any) => void;
	onRemoveImage: (index: number, form: any) => void;
	isUploading: boolean;
	onCancel: () => void;
}) {
	const form = useForm<PackageItemFormValues>({
		resolver: zodResolver(packageItemFormSchema),
		defaultValues: initialData || {
			categoryId: '',
			name: '',
			slug: '',
			description: '',
			price: '',
			images: [],
			isActive: true,
			inStock: true,
		},
	});

	const images = form.watch('images');

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
				<FormField
					control={form.control}
					name='categoryId'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Category</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder='Select a category' />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{categories.map((cat) => (
										<SelectItem key={cat.id} value={cat.id}>
											{cat.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='name'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Item Name</FormLabel>
							<FormControl>
								<Input placeholder='e.g., Sweet Teddy Hug' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='slug'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Item Slug</FormLabel>
							<FormControl>
								<Input placeholder='e.g., sweet-teddy-hug' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='description'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description (Optional)</FormLabel>
							<FormControl>
								<Textarea
									placeholder='Item description...'
									{...field}
									value={field.value || ''}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='price'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Price (NGN)</FormLabel>
							<FormControl>
								<Input
									type='number'
									step='0.01'
									placeholder='0.00'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='images'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Images</FormLabel>
							<FormControl>
								<div className='space-y-2'>
									<input
										type='file'
										accept='image/*'
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												onImageUpload(file, form);
											}
										}}
										disabled={isUploading}
										className='hidden'
										id='image-upload'
									/>
									<Button
										type='button'
										variant='outline'
										onClick={() =>
											document.getElementById('image-upload')?.click()
										}
										disabled={isUploading}>
										{isUploading ? 'Uploading...' : 'Upload Image'}
									</Button>
									{images && images.length > 0 && (
										<div className='grid grid-cols-3 gap-2 mt-2'>
											{images.map((url, index) => (
												<div
													key={index}
													className='relative aspect-square rounded-lg overflow-hidden border'>
													<ImageWithFallback
														src={url}
														alt={`Image ${index + 1}`}
														className='object-cover w-full h-full'
													/>
													<Button
														type='button'
														size='icon'
														variant='destructive'
														className='absolute top-1 right-1 h-6 w-6'
														onClick={() => onRemoveImage(index, form)}>
														<Trash2 size={12} />
													</Button>
												</div>
											))}
										</div>
									)}
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className='grid grid-cols-2 gap-4'>
					<FormField
						control={form.control}
						name='isActive'
						render={({ field }) => (
							<FormItem className='flex flex-row items-start space-x-3 space-y-0'>
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<div className='space-y-1 leading-none'>
									<FormLabel>Active</FormLabel>
								</div>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='inStock'
						render={({ field }) => (
							<FormItem className='flex flex-row items-start space-x-3 space-y-0'>
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<div className='space-y-1 leading-none'>
									<FormLabel>In Stock</FormLabel>
								</div>
							</FormItem>
						)}
					/>
				</div>
				<div className='flex gap-2 justify-end'>
					<Button
						type='button'
						variant='outline'
						onClick={onCancel}
						disabled={isPending}>
						Cancel
					</Button>
					<Button type='submit' disabled={isPending}>
						{isPending ? 'Saving...' : 'Save'}
					</Button>
				</div>
			</form>
		</Form>
	);
}

