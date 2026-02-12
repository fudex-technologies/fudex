'use client';

import { useState, useMemo, useEffect } from 'react';
import { usePackageAdminActions } from '@/api-hooks/usePackageActions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import GoBackButton from '@/components/GoBackButton';
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
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PackageCategoryManagement from '@/component-sections/PackageCategoryManagement';
import PackageItemManagement from '@/component-sections/PackageItemManagement';
import PackageAddonsManagement from '@/component-sections/PackageAddonsManagement';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { format } from 'date-fns';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';

const categoryFormSchema = z.object({
	name: z.string().min(1, 'Category name is required'),
	slug: z.string().min(1, 'Category slug is required'),
	description: z.string().optional(),
	order: z.number().default(0),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface Props {
	params: Promise<{ packageId: string }>;
}

export default function AdminPackageDetailPage({ params }: Props) {
	const [packageId, setPackageId] = useState<string | null>(null);
	const { useGetPackageById, updatePackage } = usePackageAdminActions();

	// Resolve params
	useEffect(() => {
		params.then((p) => setPackageId(p.packageId));
	}, [params]);

	const {
		data: packageData,
		isLoading,
		refetch,
	} = useGetPackageById({ id: packageId || '' }, { enabled: !!packageId });

	if (isLoading || !packageId) {
		return (
			<SectionWrapper className='p-5'>
				<Skeleton className='h-64 w-full' />
			</SectionWrapper>
		);
	}

	if (!packageData) {
		return (
			<SectionWrapper className='p-5'>
				<p>Package not found</p>
			</SectionWrapper>
		);
	}

	return (
		<SectionWrapper className='p-6'>
			<div className='mb-6'>
				<Link href={PAGES_DATA.admin_dashboard_packages_page}>
					<Button variant='ghost' size='sm' className='mb-4'>
						<ArrowLeft className='mr-2 h-4 w-4' />
						Back to Packages
					</Button>
				</Link>
				<div className='flex items-start justify-between'>
					<div className='flex-1'>
						<div className='flex items-center gap-3 mb-2'>
							<h1 className='text-3xl font-bold'>
								{packageData.name}
							</h1>
							<Badge
								variant={
									packageData.isActive
										? 'default'
										: 'secondary'
								}>
								{packageData.isActive ? 'Active' : 'Inactive'}
							</Badge>
							{packageData.isPreorder && (
								<Badge variant='outline'>Pre-order</Badge>
							)}
						</div>
						<p className='text-muted-foreground mb-4'>
							Slug: {packageData.slug}
						</p>
						{packageData.description && (
							<p className='text-sm text-foreground/70 mb-4'>
								{packageData.description}
							</p>
						)}
						{packageData.coverImage && (
							<div className='relative w-full max-w-md h-48 rounded-lg overflow-hidden mb-4'>
								<ImageWithFallback
									src={packageData.coverImage}
									alt={packageData.name}
									className='object-cover w-full h-full'
								/>
							</div>
						)}
					</div>
				</div>
			</div>

			<Tabs defaultValue='categories' className='w-full'>
				<TabsList>
					<TabsTrigger value='categories'>
						Categories ({packageData.categories?.length || 0})
					</TabsTrigger>
					<TabsTrigger value='items'>Items</TabsTrigger>
					<TabsTrigger value='addons'>
						Addons ({packageData.addons?.length || 0})
					</TabsTrigger>
				</TabsList>
				<TabsContent value='categories' className='mt-6'>
					<PackageCategoryManagement
						packageId={packageId}
						onSuccess={refetch}
					/>
				</TabsContent>
				<TabsContent value='items' className='mt-6'>
					<PackageItemManagement
						packageId={packageId}
						categories={packageData.categories || []}
						onSuccess={refetch}
					/>
				</TabsContent>
				<TabsContent value='addons' className='mt-6'>
					<PackageAddonsManagement
						packageId={packageId}
						onSuccess={refetch}
					/>
				</TabsContent>
			</Tabs>
		</SectionWrapper>
	);
}
