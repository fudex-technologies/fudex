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
import { cn } from '@/lib/utils';

const categoryFormSchema = z.object({
	name: z.string().min(1, 'Category name is required'),
	slug: z.string().min(1, 'Category slug is required'),
	description: z.string().optional(),
	order: z.number().default(0),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface PackageCategory {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	order: number;
	_count?: {
		items: number;
	};
}

interface PackageCategoryManagementProps {
	packageId: string;
	onSuccess: () => void;
}

export default function PackageCategoryManagement({
	packageId,
	onSuccess,
}: PackageCategoryManagementProps) {
	const {
		useGetPackageById,
		createCategory,
		updateCategory,
		deleteCategory,
	} = usePackageAdminActions();

	const { data: packageData, refetch } = useGetPackageById(
		{ id: packageId },
		{ enabled: !!packageId },
	);

	const categories = (packageData?.categories as PackageCategory[]) || [];

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingCategory, setEditingCategory] =
		useState<PackageCategory | null>(null);
	const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
		null,
	);

	const createMutation = createCategory({
		onSuccess: () => {
			refetch();
			onSuccess();
			setIsCreateDialogOpen(false);
		},
	});

	const updateMutation = updateCategory({
		onSuccess: () => {
			refetch();
			onSuccess();
			setEditingCategory(null);
		},
	});

	const deleteMutation = deleteCategory({
		onSuccess: () => {
			refetch();
			onSuccess();
			setDeletingCategoryId(null);
		},
	});

	const handleCreateSubmit = (data: CategoryFormValues) => {
		createMutation.mutate({
			packageId,
			...data,
			description: data.description || undefined,
		});
	};

	const handleUpdateSubmit = (data: CategoryFormValues) => {
		if (editingCategory) {
			updateMutation.mutate({
				id: editingCategory.id,
				...data,
				description: data.description || null,
			});
		}
	};

	const defaultValues = useMemo(
		() =>
			editingCategory
				? {
						name: editingCategory.name || '',
						slug: editingCategory.slug || '',
						description: editingCategory.description || '',
						order: editingCategory.order || 0,
					}
				: undefined,
		[editingCategory],
	);

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h3 className='text-xl font-semibold'>Categories</h3>
					<p className='text-sm text-muted-foreground'>
						Manage categories within this package
					</p>
				</div>
				<Dialog
					open={isCreateDialogOpen}
					onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button className='flex items-center gap-2'>
							<Plus size={18} />
							Add Category
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Category</DialogTitle>
						</DialogHeader>
						<CategoryForm
							onSubmit={handleCreateSubmit}
							isPending={createMutation.isPending}
							onCancel={() => setIsCreateDialogOpen(false)}
						/>
					</DialogContent>
				</Dialog>
			</div>

			{categories.length === 0 ? (
				<div className='flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl border-border/50'>
					<p className='text-muted-foreground'>
						No categories created yet
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{categories.map((category) => (
						<div
							key={category.id}
							className={cn(
								'p-4 border rounded-lg hover:border-primary/50 transition-colors',
							)}>
							<div className='flex items-start justify-between mb-2'>
								<div className='flex-1'>
									<h4 className='font-semibold'>
										{category.name}
									</h4>
									<p className='text-xs text-muted-foreground'>
										Slug: {category.slug}
									</p>
									{category.description && (
										<p className='text-sm text-foreground/60 mt-1 line-clamp-2'>
											{category.description}
										</p>
									)}
									<p className='text-xs text-muted-foreground mt-2'>
										{category._count?.items || 0} items
									</p>
								</div>
								<div className='flex gap-1'>
									<Button
										size='icon'
										variant='ghost'
										className='h-8 w-8'
										onClick={() =>
											setEditingCategory(category)
										}>
										<Edit size={14} />
									</Button>
									<Button
										size='icon'
										variant='ghost'
										className='h-8 w-8 text-destructive'
										onClick={() =>
											setDeletingCategoryId(category.id)
										}>
										<Trash2 size={14} />
									</Button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			<Dialog
				open={!!editingCategory}
				onOpenChange={(open) => !open && setEditingCategory(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Category</DialogTitle>
					</DialogHeader>
					{editingCategory && (
						<CategoryForm
							onSubmit={handleUpdateSubmit}
							isPending={updateMutation.isPending}
							initialData={defaultValues}
							onCancel={() => setEditingCategory(null)}
						/>
					)}
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={!!deletingCategoryId}
				onOpenChange={(open) => !open && setDeletingCategoryId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Category</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this category? This
							action cannot be undone and will delete all items in
							this category.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (deletingCategoryId) {
									deleteMutation.mutate({
										id: deletingCategoryId,
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

function CategoryForm({
	onSubmit,
	isPending,
	initialData,
	onCancel,
}: {
	onSubmit: (data: CategoryFormValues) => void;
	isPending: boolean;
	initialData?: CategoryFormValues;
	onCancel: () => void;
}) {
	const form = useForm<CategoryFormValues>({
		resolver: zodResolver(categoryFormSchema) as any,
		defaultValues: initialData || {
			name: '',
			slug: '',
			description: '',
			order: 0,
		},
	});

	const name = form.watch('name');

	useMemo(() => {
		if (name && !initialData?.slug) {
			const slug = name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '');
			form.setValue('slug', slug, { shouldValidate: true });
		}
	}, [name, form, initialData?.slug]);

	return (
		<Form {...(form as any)}>
			<form
				onSubmit={form.handleSubmit(onSubmit as any)}
				className='space-y-4'>
				<FormField
					control={form.control}
					name='name'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Category Name</FormLabel>
							<FormControl>
								<Input
									placeholder='e.g., Love Spark'
									{...field}
								/>
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
							<FormLabel>Category Slug</FormLabel>
							<FormControl>
								<Input
									placeholder='e.g., love-spark'
									{...field}
								/>
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
									placeholder='Category description...'
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
					name='order'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Display Order</FormLabel>
							<FormControl>
								<Input
									type='number'
									{...field}
									onChange={(e) =>
										field.onChange(
											parseInt(e.target.value) || 0,
										)
									}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
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
