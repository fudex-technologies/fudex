'use client';
import { useMemo, useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useOperatorActions } from '@/api-hooks/useOperatorActions';
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
									placeholder='unique identifier for catefory e.g swallow'
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

export default function OperatorCategoriesPage() {
	const {
		useInfiniteListCategories,
		createCategory,
		updateCategory,
		deleteCategory,
	} = useOperatorActions();
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
					<div className='flex flex-wrap gap-4'>
						{Array.from({ length: 8 }).map((_, i) => (
							<Skeleton
								key={i}
								className='h-[100px] w-[100px] rounded-lg'
							/>
						))}
					</div>
				</div>
			</SectionWrapper>
		);
	}

	return (
		<SectionWrapper className='p-5'>
			<div className='flex items-center justify-between mb-5'>
				<h2 className='text-xl font-semibold'>Categories</h2>
				<Dialog
					open={isCreateDialogOpen}
					onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus size={18} className='mr-2' />
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
				<p className='text-foreground/50 text-center py-8'>
					No categories created yet
				</p>
			) : (
				<div className='flex flex-wrap lg:grid-cols-4 gap-4'>
					{categories.map((category) => (
						<div
							key={category.id}
							className={cn(
								'bg-muted text-muted-foreground flex flex-col gap-2 w-[100px] p-3 rounded-lg shadow-sm border cursor-pointer',
							)}>
							<p className=''>{category.name}</p>
							<div className='relative w-full'>
								<ImageWithFallback
									src={category?.image || ''}
									alt={category.name}
									className='object-contain w-full aspect-square'
								/>
							</div>
						</div>
					))}

					{hasNextPage && (
						<div
							ref={ref}
							className='w-full py-4 flex flex-wrap gap-4'>
							{isFetchingNextPage ? (
								Array.from({ length: 4 }).map((_, i) => (
									<Skeleton
										key={i}
										className='h-[100px] w-[100px] rounded-lg'
									/>
								))
							) : (
								<div className='h-1' />
							)}
						</div>
					)}
				</div>
			)}

			{/* Edit Dialog */}
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

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={!!deletingCategoryId}
				onOpenChange={(open) => !open && setDeletingCategoryId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Category</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this category? This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() => setDeletingCategoryId(null)}>
							Cancel
						</AlertDialogCancel>
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
		</SectionWrapper>
	);
}
