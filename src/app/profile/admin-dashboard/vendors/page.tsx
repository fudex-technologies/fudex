'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAdminActions } from '@/api-hooks/useAdminActions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Edit,
	Search,
	Plus,
	Store,
	CheckCircle,
	XCircle,
	Clock,
} from 'lucide-react';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import VendorCover from '@/components/VendorCover';
import { formatCurency } from '@/lib/commonFunctions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AdminVendorsPage() {
	const { useInfiniteListVendors, updateVendorByAdmin } = useAdminActions();
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	const {
		data,
		isLoading,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteListVendors({
		limit: 20,
		q: debouncedSearch || undefined,
	});

	const { ref, inView } = useInView();

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	const vendors = data?.pages.flatMap((page) => page.items) || [];
	const [editingVendor, setEditingVendor] = useState<any>(null);

	const updateMutation = updateVendorByAdmin({
		onSuccess: () => {
			refetch();
			setEditingVendor(null);
		},
	});

	const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		updateMutation.mutate({
			id: editingVendor.id,
			name: formData.get('name') as string,
			description: (formData.get('description') as string) || undefined,
			phone: (formData.get('phone') as string) || undefined,
			approvalStatus: formData.get('approvalStatus') as any,
			// isActive: formData.get('isActive') === 'true',
		});
	};

	if (isLoading) {
		return (
			<SectionWrapper className='p-6'>
				<div className='flex flex-col gap-6'>
					<div className='h-10 w-full bg-muted animate-pulse rounded-md' />
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className='h-40 w-full bg-muted animate-pulse rounded-xl'
						/>
					))}
				</div>
			</SectionWrapper>
		);
	}

	return (
		<SectionWrapper className='p-6'>
			<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
				<div>
					<h2 className='text-3xl font-bold tracking-tight'>
						Vendors
					</h2>
					<p className='text-muted-foreground'>
						Manage platform vendors and their operations.
					</p>
				</div>
				<Button className='flex items-center gap-2'>
					<Plus size={18} />
					Add New Vendor
				</Button>
			</div>

			<div className='relative mb-8'>
				<Search
					className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
					size={18}
				/>
				<Input
					placeholder='Search vendors by name, slug or description...'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className='pl-10 h-12 bg-card border-border/50 text-lg'
				/>
			</div>

			{vendors.length === 0 ? (
				<div className='flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl border-border/50'>
					<Store
						size={48}
						className='text-muted-foreground mb-4 opacity-20'
					/>
					<p className='text-xl text-muted-foreground font-medium'>
						{searchQuery
							? 'No vendors matching your search'
							: 'No vendors registered yet'}
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{vendors.map((vendor) => (
						<div
							key={vendor.id}
							className='group relative border border-border/50 rounded-2xl p-5 flex flex-col gap-4 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg'>
							<div className='flex justify-between items-start'>
								<VendorCover
									src={vendor.coverImage}
									alt={vendor.name}
									className='w-16 h-16 rounded-xl shrink-0 border border-border/50'
									imageClassName='w-full h-full object-cover rounded-xl'
								/>
								<Badge
									className={cn(
										'capitalize',
										vendor.approvalStatus === 'APPROVED'
											? 'bg-success/10 text-success border-success/20'
											: vendor.approvalStatus ===
												  'PENDING'
												? 'bg-warning/10 text-warning border-warning/20'
												: 'bg-destructive/10 text-destructive border-destructive/20',
									)}
									variant='outline'>
									{vendor.approvalStatus === 'APPROVED' ? (
										<CheckCircle
											size={12}
											className='mr-1'
										/>
									) : vendor.approvalStatus === 'PENDING' ? (
										<Clock size={12} className='mr-1' />
									) : (
										<XCircle size={12} className='mr-1' />
									)}
									{vendor.approvalStatus.toLowerCase()}
								</Badge>
							</div>

							<div className='flex-1'>
								<h3 className='font-bold text-xl mb-1 group-hover:text-primary transition-colors'>
									{vendor.name}
								</h3>
								<p className='text-xs text-muted-foreground mb-3 font-mono'>
									ID: {vendor.id.split('-')[0]}
								</p>

								{vendor.description && (
									<p className='text-sm text-foreground/70 mb-4 line-clamp-2 min-h-[2.5rem]'>
										{vendor.description}
									</p>
								)}

								<div className='space-y-2 text-sm'>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>
											Owner
										</span>
										<span className='font-medium'>
											{vendor.owner?.name || 'In-House'}
										</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>
											Orders
										</span>
										<span className='font-bold text-primary'>
											{vendor._count?.orders || 0}
										</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>
											Products
										</span>
										<span className='font-medium'>
											{vendor._count?.products || 0}
										</span>
									</div>
								</div>
							</div>

							<div className='flex gap-2 mt-2 pt-4 border-t border-border/50'>
								<Link
									href={`/profile/admin-dashboard/vendors/${vendor.id}/menu`}
									className='flex-1'>
									<Button
										variant='outline'
										className='w-full text-xs h-9'>
										Manage Menu
									</Button>
								</Link>
								<Button
									variant='ghost'
									size='icon'
									className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary'
									onClick={() => setEditingVendor(vendor)}>
									<Edit size={16} />
								</Button>
							</div>
						</div>
					))}

					{hasNextPage && (
						<div
							ref={ref}
							className='col-span-full py-10 flex justify-center'>
							{isFetchingNextPage ? (
								<div className='flex gap-4 w-full'>
									<Skeleton className='h-40 flex-1 rounded-2xl' />
									<Skeleton className='h-40 flex-1 rounded-2xl md:block hidden' />
									<Skeleton className='h-40 flex-1 rounded-2xl lg:block hidden' />
								</div>
							) : (
								<div className='h-1' />
							)}
						</div>
					)}
				</div>
			)}

			{/* Edit Dialog */}
			{editingVendor && (
				<Dialog
					open={!!editingVendor}
					onOpenChange={(open) => !open && setEditingVendor(null)}>
					<DialogContent
						autoFocus={false}
						className='sm:max-w-[500px]'>
						<DialogHeader>
							<DialogTitle className='text-2xl font-bold'>
								Edit Vendor Details
							</DialogTitle>
						</DialogHeader>
						<form
							onSubmit={handleUpdate}
							className='space-y-5 py-4'>
							<div className='space-y-2'>
								<Label htmlFor='edit-name'>Vendor Name</Label>
								<Input
									id='edit-name'
									name='name'
									defaultValue={editingVendor.name}
									required
									className='h-11'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='edit-description'>
									Description
								</Label>
								<Input
									id='edit-description'
									name='description'
									defaultValue={
										editingVendor.description || ''
									}
									className='h-11'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='edit-phone'>Phone Number</Label>
								<Input
									id='edit-phone'
									name='phone'
									defaultValue={editingVendor.phone || ''}
									className='h-11'
								/>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='edit-approvalStatus'>
										Approval Status
									</Label>
									<select
										id='edit-approvalStatus'
										name='approvalStatus'
										defaultValue={
											editingVendor.approvalStatus
										}
										className='w-full h-11 px-3 py-2 bg-card border rounded-md focus:ring-2 focus:ring-primary/20 outline-none'>
										<option value='PENDING'>Pending</option>
										<option value='APPROVED'>
											Approved
										</option>
										<option value='DECLINED'>
											Declined
										</option>
									</select>
								</div>
								{/* <div className='space-y-2'>
									<Label htmlFor='edit-isActive'>
										Visibility Status
									</Label>
									<select
										id='edit-isActive'
										name='isActive'
										defaultValue={
											editingVendor.isActive
												? 'true'
												: 'false'
										}
										className='w-full h-11 px-3 py-2 bg-card border rounded-md focus:ring-2 focus:ring-primary/20 outline-none'>
										<option value='true'>
											Active (Visible)
										</option>
										<option value='false'>
											Inactive (Hidden)
										</option>
									</select>
								</div> */}
							</div>
							<div className='flex gap-3 justify-end pt-4'>
								<Button
									type='button'
									variant='outline'
									className='h-11'
									onClick={() => setEditingVendor(null)}>
									Cancel
								</Button>
								<Button
									type='submit'
									className='h-11 px-8'
									disabled={updateMutation.isPending}>
									{updateMutation.isPending
										? 'Updating...'
										: 'Save Changes'}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</SectionWrapper>
	);
}
