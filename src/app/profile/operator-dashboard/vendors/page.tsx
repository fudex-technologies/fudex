'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useOperatorActions } from '@/api-hooks/useOperatorActions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit } from 'lucide-react';
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

export default function OperatorVendorsPage() {
	const { useInfiniteListVendors, updateVendor } = useOperatorActions();
	const [searchQuery, setSearchQuery] = useState('');
	const {
		data,
		isLoading,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteListVendors({
		limit: 20,
		q: searchQuery || undefined,
	});

	const { ref, inView } = useInView();

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	const vendors = data?.pages.flatMap((page) => page.items) || [];
	const [editingVendor, setEditingVendor] = useState<any>(null);

	const updateMutation = updateVendor({
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
			city: (formData.get('city') as string) || undefined,
			coverImage: (formData.get('coverImage') as string) || undefined,
			isActive: formData.get('isActive') === 'true',
		});
	};

	if (isLoading) {
		return (
			<SectionWrapper className='p-5'>
				<div className='space-y-4'>
					<Skeleton className='h-10 w-full' />
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className='h-32 w-full' />
					))}
				</div>
			</SectionWrapper>
		);
	}

	return (
		<SectionWrapper className='p-5'>
			<div className='flex items-center justify-between mb-5'>
				<h2 className='text-xl font-semibold'>Vendors</h2>
			</div>

			<div className='mb-5'>
				<Input
					placeholder='Search vendors...'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>

			{vendors.length === 0 ? (
				<p className='text-foreground/50 text-center py-8'>
					{searchQuery ? 'No vendors found' : 'No vendors available'}
				</p>
			) : (
				<div className='space-y-4'>
					{vendors.map((vendor) => (
						<div
							key={vendor.id}
							className='border rounded-lg p-4 flex items-center gap-4 bg-card'>
							<VendorCover
								src={vendor.coverImage}
								alt={vendor.name}
								className='w-20 h-20 rounded-md shrink-0'
								imageClassName='w-full h-full object-cover rounded-md'
							/>
							<div className='flex-1'>
								<div className='flex items-center gap-2 mb-1'>
									<h3 className='font-semibold text-lg'>
										{vendor.name}
									</h3>
								</div>
								{vendor.description && (
									<p className='text-sm text-foreground/70 mb-1 line-clamp-1'>
										{vendor.description}
									</p>
								)}
								{vendor.city && (
									<p className='text-sm text-foreground/50'>
										City: {vendor.city}
									</p>
								)}
								{vendor.owner && (
									<p className='text-sm text-foreground/50'>
										Owner: {vendor.owner.name} (
										{vendor.owner.email})
									</p>
								)}
								<div className='flex gap-2 mt-2'>
									<Badge
										variant='outline'
										className='bg-muted/50'>
										{vendor._count?.products || 0} product
										{vendor._count?.products !== 1
											? 's'
											: ''}
									</Badge>
									<Badge
										variant='outline'
										className='bg-muted/50'>
										{vendor._count?.orders || 0} order
										{vendor._count?.orders !== 1 ? 's' : ''}
									</Badge>
								</div>
							</div>
							<Button
								variant='ghost'
								size='sm'
								onClick={() => setEditingVendor(vendor)}>
								<Edit size={16} />
							</Button>
						</div>
					))}

					{hasNextPage && (
						<div ref={ref} className='py-4 flex justify-center'>
							{isFetchingNextPage ? (
								<Skeleton className='h-32 w-full rounded-lg' />
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
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit Vendor</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleUpdate} className='space-y-4'>
							<div>
								<Label htmlFor='edit-name'>Vendor Name</Label>
								<Input
									id='edit-name'
									name='name'
									defaultValue={editingVendor.name}
									required
								/>
							</div>
							<div>
								<Label htmlFor='edit-description'>
									Description
								</Label>
								<Input
									id='edit-description'
									name='description'
									defaultValue={
										editingVendor.description || ''
									}
								/>
							</div>
							<div>
								<Label htmlFor='edit-city'>City</Label>
								<Input
									id='edit-city'
									name='city'
									defaultValue={editingVendor.city || ''}
								/>
							</div>
							<div>
								<Label htmlFor='edit-coverImage'>
									Cover Image URL
								</Label>
								<Input
									id='edit-coverImage'
									name='coverImage'
									type='url'
									defaultValue={
										editingVendor.coverImage || ''
									}
								/>
							</div>
							<div>
								<Label htmlFor='edit-isActive'>Status</Label>
								<select
									id='edit-isActive'
									name='isActive'
									defaultValue={
										editingVendor.isActive
											? 'true'
											: 'false'
									}
									className='w-full px-3 py-2 border rounded-md'>
									<option value='true'>Active</option>
									<option value='false'>Inactive</option>
								</select>
							</div>
							<div className='flex gap-2 justify-end'>
								<Button
									type='button'
									variant='outline'
									onClick={() => setEditingVendor(null)}>
									Cancel
								</Button>
								<Button
									type='submit'
									disabled={updateMutation.isPending}>
									{updateMutation.isPending
										? 'Updating...'
										: 'Update'}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</SectionWrapper>
	);
}
