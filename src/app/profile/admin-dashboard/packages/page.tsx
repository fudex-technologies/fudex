'use client';

import { useState, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { usePackageAdminActions } from '@/api-hooks/usePackageActions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';
import { Badge } from '@/components/ui/badge';

export interface Package {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	coverImage?: string | null;
	isActive: boolean;
	isPreorder: boolean;
	deliveryDate?: Date | string | null;
	orderCloseDate?: Date | string | null;
	createdAt: Date;
	updatedAt: Date;
	_count?: {
		categories: number;
		orders: number;
	};
}

const packageFormSchema = z.object({
	name: z.string().min(1, 'Package name is required'),
	slug: z.string().min(1, 'Package slug is required'),
	description: z.string().optional(),
	coverImage: z.string().optional(),
	isActive: z.boolean().default(true),
	isPreorder: z.boolean().default(false),
	deliveryDate: z.string().optional(),
	orderCloseDate: z.string().optional(),
});

type PackageFormValues = z.infer<typeof packageFormSchema>;

interface PackageFormProps {
	onSubmit: (data: PackageFormValues) => void;
	isPending: boolean;
	initialData?: Partial<PackageFormValues>;
	onCancel: () => void;
}

function PackageForm({
	onSubmit,
	isPending,
	initialData,
	onCancel,
}: PackageFormProps) {
	const form = useForm<PackageFormValues>({
		resolver: zodResolver(packageFormSchema) as any,
		defaultValues: {
			name: initialData?.name ?? '',
			slug: initialData?.slug ?? '',
			description: initialData?.description ?? '',
			coverImage: initialData?.coverImage ?? '',
			isActive: initialData?.isActive ?? true,
			isPreorder: initialData?.isPreorder ?? false,
			deliveryDate: initialData?.deliveryDate ?? '',
			orderCloseDate: initialData?.orderCloseDate ?? '',
		},
	});

	const isPreorder = form.watch('isPreorder');
	const name = form.watch('name');

	// Auto-generate slug from name
	useEffect(() => {
		if (name && !initialData?.slug) {
			const slug = name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '');
			form.setValue('slug', slug);
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
							<FormLabel>Package Name</FormLabel>
							<FormControl>
								<Input
									placeholder='e.g., Valentine Packages'
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
							<FormLabel>Package Slug</FormLabel>
							<FormControl>
								<Input
									placeholder='e.g., valentine-packages'
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
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea
									placeholder='Package description...'
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
					name='coverImage'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Cover Image</FormLabel>
							<FormControl>
								<ImageUpload
									value={field.value || ''}
									onChange={field.onChange}
									folder='packageCoverImages'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
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
								<p className='text-sm text-muted-foreground'>
									Package will be visible to users
								</p>
							</div>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='isPreorder'
					render={({ field }) => (
						<FormItem className='flex flex-row items-start space-x-3 space-y-0'>
							<FormControl>
								<Checkbox
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<div className='space-y-1 leading-none'>
								<FormLabel>Pre-order Package</FormLabel>
								<p className='text-sm text-muted-foreground'>
									Requires delivery date selection
								</p>
							</div>
						</FormItem>
					)}
				/>
				{isPreorder && (
					<>
						<FormField
							control={form.control}
							name='deliveryDate'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Delivery Date</FormLabel>
									<FormControl>
										<Input
											type='datetime-local'
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
							name='orderCloseDate'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Order Close Date</FormLabel>
									<FormControl>
										<Input
											type='datetime-local'
											{...field}
											value={field.value || ''}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</>
				)}
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

export default function AdminPackagesPage() {
	const { useListPackages, createPackage, updatePackage, deletePackage } =
		usePackageAdminActions();

	const { data, isLoading, refetch } = useListPackages({ limit: 100 });

	const packages = data?.items || [];

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingPackage, setEditingPackage] = useState<Package | null>(null);
	const [deletingPackageId, setDeletingPackageId] = useState<string | null>(
		null,
	);

	const createMutation = createPackage({
		onSuccess: () => {
			refetch();
			setIsCreateDialogOpen(false);
		},
	});

	const updateMutation = updatePackage({
		onSuccess: () => {
			refetch();
			setEditingPackage(null);
		},
	});

	const deleteMutation = deletePackage({
		onSuccess: () => {
			refetch();
			setDeletingPackageId(null);
		},
	});

	const handleCreateSubmit = (data: PackageFormValues) => {
		const isValidDeliveryDate =
			data.deliveryDate && !isNaN(new Date(data.deliveryDate).getTime());
		const isValidOrderCloseDate =
			data.orderCloseDate &&
			!isNaN(new Date(data.orderCloseDate).getTime());

		createMutation.mutate({
			name: data.name,
			slug: data.slug,
			description: data.description || undefined,
			coverImage: data.coverImage || undefined,
			isActive: data.isActive,
			isPreorder: data.isPreorder,
			deliveryDate:
				data.isPreorder && isValidDeliveryDate
					? new Date(data.deliveryDate!)
					: undefined,
			orderCloseDate: isValidOrderCloseDate
				? new Date(data.orderCloseDate!)
				: undefined,
		});
	};

	const handleUpdateSubmit = (data: PackageFormValues) => {
		if (editingPackage) {
			const isValidDeliveryDate =
				data.deliveryDate &&
				!isNaN(new Date(data.deliveryDate).getTime());
			const isValidOrderCloseDate =
				data.orderCloseDate &&
				!isNaN(new Date(data.orderCloseDate).getTime());

			updateMutation.mutate({
				id: editingPackage.id,
				name: data.name,
				slug: data.slug,
				description: data.description || null,
				coverImage: data.coverImage || null,
				isActive: data.isActive,
				isPreorder: data.isPreorder,
				deliveryDate:
					data.isPreorder && isValidDeliveryDate
						? new Date(data.deliveryDate!)
						: null,
				orderCloseDate: isValidOrderCloseDate
					? new Date(data.orderCloseDate!)
					: null,
			});
		}
	};

	const defaultValues = useMemo(
		() =>
			editingPackage
				? {
						name: editingPackage.name || '',
						slug: editingPackage.slug || '',
						description: editingPackage.description || '',
						coverImage: editingPackage.coverImage || '',
						isActive: editingPackage.isActive ?? true,
						isPreorder: editingPackage.isPreorder ?? false,
						deliveryDate: editingPackage.deliveryDate
							? format(
									new Date(editingPackage.deliveryDate),
									"yyyy-MM-dd'T'HH:mm",
								)
							: '',
						orderCloseDate: editingPackage.orderCloseDate
							? format(
									new Date(editingPackage.orderCloseDate),
									"yyyy-MM-dd'T'HH:mm",
								)
							: '',
					}
				: undefined,
		[editingPackage],
	);

	if (isLoading) {
		return (
			<SectionWrapper className='p-5'>
				<div className='space-y-4'>
					<Skeleton className='h-10 w-32' />
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton
								key={i}
								className='h-64 w-full rounded-lg'
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
						Packages
					</h2>
					<p className='text-muted-foreground'>
						Manage special occasion packages (Valentine, Christmas,
						etc.)
					</p>
				</div>
				<Dialog
					open={isCreateDialogOpen}
					onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button className='flex items-center gap-2'>
							<Plus size={18} />
							Add New Package
						</Button>
					</DialogTrigger>
					<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>Create New Package</DialogTitle>
						</DialogHeader>
						<PackageForm
							onSubmit={handleCreateSubmit}
							isPending={createMutation.isPending}
							onCancel={() => setIsCreateDialogOpen(false)}
						/>
					</DialogContent>
				</Dialog>
			</div>

			{packages.length === 0 ? (
				<div className='flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl border-border/50'>
					<p className='text-xl text-muted-foreground font-medium'>
						No packages created yet
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{packages.map((pkg) => (
						<div
							key={pkg.id}
							className={cn(
								'group relative bg-card flex flex-col rounded-2xl shadow-sm border border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden',
							)}>
							<div className='relative w-full h-48 bg-muted overflow-hidden'>
								<ImageWithFallback
									src={pkg.coverImage || ''}
									alt={pkg.name}
									className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-500'
								/>
								<div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
									<Link
										href={PAGES_DATA.admin_dashboard_package_page(
											pkg.id,
										)}>
										<Button
											size='icon'
											variant='secondary'
											className='h-8 w-8 rounded-full'>
											<Eye size={14} />
										</Button>
									</Link>
									<Button
										size='icon'
										variant='secondary'
										className='h-8 w-8 rounded-full'
										onClick={() => setEditingPackage(pkg)}>
										<Edit size={14} />
									</Button>
									<Button
										size='icon'
										variant='destructive'
										className='h-8 w-8 rounded-full'
										onClick={() =>
											setDeletingPackageId(pkg.id)
										}>
										<Trash2 size={14} />
									</Button>
								</div>
							</div>
							<div className='p-4 flex-1 flex flex-col'>
								<div className='flex items-start justify-between mb-2'>
									<h3 className='font-semibold text-lg line-clamp-1'>
										{pkg.name}
									</h3>
									<Badge
										variant={
											pkg.isActive
												? 'default'
												: 'secondary'
										}>
										{pkg.isActive ? 'Active' : 'Inactive'}
									</Badge>
								</div>
								{pkg.description && (
									<p className='text-sm text-foreground/60 line-clamp-2 mb-3'>
										{pkg.description}
									</p>
								)}
								<div className='mt-auto space-y-1 text-xs text-muted-foreground'>
									<div className='flex justify-between'>
										<span>Categories:</span>
										<span className='font-medium'>
											{pkg._count?.categories || 0}
										</span>
									</div>
									<div className='flex justify-between'>
										<span>Orders:</span>
										<span className='font-medium'>
											{pkg._count?.orders || 0}
										</span>
									</div>
									{pkg.isPreorder && (
										<div className='flex justify-between'>
											<span>Pre-order:</span>
											<span className='font-medium'>
												Yes
											</span>
										</div>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			<Dialog
				open={!!editingPackage}
				onOpenChange={(open) => !open && setEditingPackage(null)}>
				<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Edit Package</DialogTitle>
					</DialogHeader>
					{editingPackage && (
						<PackageForm
							onSubmit={handleUpdateSubmit}
							isPending={updateMutation.isPending}
							initialData={defaultValues}
							onCancel={() => setEditingPackage(null)}
						/>
					)}
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={!!deletingPackageId}
				onOpenChange={(open) => !open && setDeletingPackageId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Package</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this package? This
							action cannot be undone and may affect existing
							orders.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (deletingPackageId) {
									deleteMutation.mutate({
										id: deletingPackageId,
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
