'use client';
import { useMemo, useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAdminActions } from '@/api-hooks/useAdminActions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2 } from 'lucide-react';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
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
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Category } from '@prisma/client';
import { cn } from '@/lib/utils';

const categoryFormSchema = z.object({
	name: z.string().min(1, 'Category name is required'),
	slug: z.string().optional(),
	image: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
	onSubmit: (data: CategoryFormValues) => void;
	isPending: boolean;
	initialData?: CategoryFormValues;
	onCancel: () => void;
}

function CategoryForm({
	onSubmit,
	isPending,
	initialData,
	onCancel,
}: CategoryFormProps) {
	const form = useForm<CategoryFormValues>({
		resolver: zodResolver(categoryFormSchema),
		defaultValues: initialData || {
			name: '',
			slug: '',
			image: '',
		},
	});

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
				<FormField
					control={form.control}
					name='name'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Category Name</FormLabel>
							<FormControl>
								<Input placeholder='e.g., Swallow' {...field} />
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
							<FormLabel>Category slug (Optional)</FormLabel>
							<FormControl>
								<Input
									placeholder='unique identifier for category e.g swallow'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='image'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Image</FormLabel>
							<FormControl>
								<ImageUpload
									value={field.value}
									onChange={field.onChange}
									folder='categoryImages'
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

export default function AdminCategoriesPage() {
	const {
		useInfiniteListCategories,
		createCategory,
		updateCategory,
		deleteCategory,
	} = useAdminActions();
	const {
		data,
		isLoading,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteListCategories({ limit: 100 });

	const { ref, inView } = useInView();

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	const categories = data?.pages.flatMap((page) => page.items) || [];

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(
		null,
	);
	const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
		null,
	);

	const createMutation = createCategory({
		onSuccess: () => {
			refetch();
			setIsCreateDialogOpen(false);
		},
	});

	const updateMutation = updateCategory({
		onSuccess: () => {
			refetch();
			setEditingCategory(null);
		},
	});

	const deleteMutation = deleteCategory({
		onSuccess: () => {
			refetch();
			setDeletingCategoryId(null);
		},
	});

	const handleCreateSubmit = (data: CategoryFormValues) => {
		createMutation.mutate(data);
	};

	const handleUpdateSubmit = (data: CategoryFormValues) => {
		if (editingCategory) {
			updateMutation.mutate({ id: editingCategory.id, ...data });
		}
	};

	const defaultValues = useMemo(
		() => ({
			name: editingCategory?.name || '',
			slug: editingCategory?.slug || '',
			image: editingCategory?.image || '',
		}),
		[editingCategory],
	);

	if (isLoading) {
		return (
			<SectionWrapper className='p-5'>
				<div className='space-y-4'>
					<Skeleton className='h-10 w-32' />
					<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
						{Array.from({ length: 12 }).map((_, i) => (
							<Skeleton
								key={i}
								className='h-[160px] w-full rounded-lg'
							/>
						))}
					</div>
				</div>
			</SectionWrapper>
		);
	}

	return (
		<SectionWrapper className='p-6'>
			<div className='flex items-center justify-between mb-8'>
				<div>
					<h2 className='text-3xl font-bold tracking-tight'>
						Categories
					</h2>
					<p className='text-muted-foreground'>
						Manage global vendor categories and their details.
					</p>
				</div>
				<Dialog
					open={isCreateDialogOpen}
					onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button className='flex items-center gap-2'>
							<Plus size={18} />
							Add New Category
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
				<div className='flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl border-border/50'>
					<p className='text-xl text-muted-foreground font-medium'>
						No categories created yet
					</p>
				</div>
			) : (
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6'>
					{categories.map((category) => (
						<div
							key={category.id}
							className={cn(
								'group relative bg-card flex flex-col items-center p-4 rounded-2xl shadow-sm border border-border/50 focus:border-primary/50 transition-all duration-300',
							)}>
							<div className='relative w-full aspect-square mb-4 bg-muted rounded-xl overflow-hidden'>
								<ImageWithFallback
									src={category?.image || ''}
									alt={category.name}
									className='object-cover w-full h-full scale-110 transition-transform duration-500'
								/>
								<div className='absolute inset-0 bg-black/40 opacity-100 transition-opacity flex items-center justify-center gap-2'>
									<Button
										size='icon'
										variant='secondary'
										className='h-8 w-8 rounded-full'
										onClick={() =>
											setEditingCategory(category)
										}>
										<Edit size={14} />
									</Button>
									<Button
										size='icon'
										variant='destructive'
										className='h-8 w-8 rounded-full'
										onClick={() =>
											setDeletingCategoryId(category.id)
										}>
										<Trash2 size={14} />
									</Button>
								</div>
							</div>
							<p className='font-semibold text-center line-clamp-1'>
								{category.name}
							</p>
							<p className='text-[10px] text-muted-foreground mt-1'>
								{category._count?.vendors || 0} Vendors
							</p>
						</div>
					))}

					{hasNextPage && (
						<div
							ref={ref}
							className='col-span-full py-10 flex justify-center'>
							{isFetchingNextPage ? (
								<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full'>
									{Array.from({ length: 6 }).map((_, i) => (
										<Skeleton
											key={i}
											className='h-[160px] w-full rounded-lg'
										/>
									))}
								</div>
							) : (
								<div className='h-1' />
							)}
						</div>
					)}
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
							action cannot be undone and may affect vendors
							assigned to it.
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
							className='bg-destructive text-destructive-foreground focus:bg-destructive/90'>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</SectionWrapper>
	);
}
