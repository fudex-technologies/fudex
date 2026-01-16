'use client';

import { useOperatorActions } from '@/api-hooks/useOperatorActions';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Phone, FileText, User } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function OperatorRiderListInfinite() {
	const { useInfiniteListRiders, createRider, updateRider } =
		useOperatorActions();
	const { ref, inView } = useInView();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingRider, setEditingRider] = useState<any>(null);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		refetch,
	} = useInfiniteListRiders({
		limit: 10,
	});

	const createMutation = createRider({
		onSuccess: () => {
			refetch();
			setIsCreateDialogOpen(false);
		},
	});

	const updateMutation = updateRider({
		onSuccess: () => {
			refetch();
			setEditingRider(null);
		},
	});

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	const riders = data?.pages.flatMap((page) => page.items) || [];

	const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		createMutation.mutate({
			name: formData.get('name') as string,
			phone: (formData.get('phone') as string) || undefined,
			notes: (formData.get('notes') as string) || undefined,
		});
	};

	const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		updateMutation.mutate({
			id: editingRider.id,
			data: {
				name: formData.get('name') as string,
				phone: (formData.get('phone') as string) || undefined,
				notes: (formData.get('notes') as string) || undefined,
				isActive: formData.get('isActive') === 'true',
			},
		});
	};

	return (
		<div className='space-y-6 px-5'>
			<div className='flex items-center justify-between py-4'>
				<div>
					<h2 className='text-3xl font-extrabold tracking-tight'>
						Riders
					</h2>
					<p className='text-muted-foreground'>
						Total managed riders: {riders.length}
					</p>
				</div>
				<Dialog
					open={isCreateDialogOpen}
					onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button className='rounded-full px-6 shadow-lg hover:shadow-xl transition-all'>
							<Plus size={18} className='mr-2' />
							Add New Rider
						</Button>
					</DialogTrigger>
					<DialogContent className='sm:max-w-[425px]'>
						<DialogHeader>
							<DialogTitle className='text-2xl font-bold'>
								Create Rider
							</DialogTitle>
						</DialogHeader>
						<form
							onSubmit={handleCreate}
							className='space-y-6 pt-4'>
							<div className='space-y-2'>
								<Label htmlFor='name'>Full Name</Label>
								<Input
									id='name'
									name='name'
									required
									placeholder='Enter rider name'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='phone'>Phone Number</Label>
								<Input
									id='phone'
									name='phone'
									type='tel'
									placeholder='08012345678'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='notes'>Internal Notes</Label>
								<Textarea
									id='notes'
									name='notes'
									rows={3}
									placeholder='Any specific instructions or details...'
								/>
							</div>
							<div className='flex gap-2 justify-end pt-2'>
								<Button
									type='button'
									variant='ghost'
									onClick={() =>
										setIsCreateDialogOpen(false)
									}>
									Cancel
								</Button>
								<Button
									type='submit'
									disabled={createMutation.isPending}
									className='px-8'>
									{createMutation.isPending
										? 'Creating...'
										: 'Create'}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{isLoading ? (
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className='h-32 w-full rounded-2xl' />
					))}
				</div>
			) : riders.length === 0 ? (
				<div className='text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-10'>
					<User size={48} className='text-muted-foreground/30 mb-4' />
					<h3 className='text-xl font-semibold'>No riders yet</h3>
					<p className='text-muted-foreground max-w-xs'>
						Start by adding riders who will be handling deliveries
						in the system.
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10'>
					{riders.map((rider) => (
						<div
							key={rider.id}
							className='group relative border rounded-2xl p-5 bg-card hover:bg-accent/5 transition-all shadow-sm'>
							<div className='flex items-start justify-between mb-4'>
								<div className='flex items-center gap-3'>
									<div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl'>
										{rider.name.charAt(0)}
									</div>
									<div>
										<h3 className='font-bold text-lg leading-tight'>
											{rider.name}
										</h3>
										<Badge
											variant={
												rider.isActive
													? 'default'
													: 'secondary'
											}
											className={
												rider.isActive
													? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
													: ''
											}>
											{rider.isActive
												? 'Active'
												: 'Inactive'}
										</Badge>
									</div>
								</div>
								<Button
									variant='ghost'
									size='icon'
									className='rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity'
									onClick={() => setEditingRider(rider)}>
									<Edit size={16} />
								</Button>
							</div>

							<div className='space-y-2 pt-2'>
								<div className='flex items-center gap-2 text-sm text-muted-foreground'>
									<Phone size={14} className='shrink-0' />
									<span className='truncate'>
										{rider.phone || 'No phone provided'}
									</span>
								</div>
								{rider.notes && (
									<div className='flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg'>
										<FileText
											size={14}
											className='shrink-0 mt-0.5'
										/>
										<span className='line-clamp-2 italic'>
											{rider.notes}
										</span>
									</div>
								)}
							</div>

							{rider.operator?.area && (
								<div className='mt-4 pt-4 border-t text-xs text-muted-foreground flex justify-between'>
									<span>
										Area:{' '}
										<span className='text-foreground font-medium'>
											{rider.operator.area.name}
										</span>
									</span>
									<span>
										Managed by:{' '}
										<span className='text-foreground font-medium'>
											{rider.operator.user.name}
										</span>
									</span>
								</div>
							)}
						</div>
					))}

					{hasNextPage && (
						<div ref={ref} className='col-span-full py-4'>
							<Skeleton className='h-32 w-full rounded-2xl' />
						</div>
					)}
				</div>
			)}

			{/* Edit Dialog */}
			{editingRider && (
				<Dialog
					open={!!editingRider}
					onOpenChange={(open) => !open && setEditingRider(null)}>
					<DialogContent className='sm:max-w-[425px]'>
						<DialogHeader>
							<DialogTitle className='text-2xl font-bold'>
								Edit Rider
							</DialogTitle>
						</DialogHeader>
						<form
							onSubmit={handleUpdate}
							className='space-y-6 pt-4'>
							<div className='space-y-2'>
								<Label htmlFor='edit-name'>Full Name</Label>
								<Input
									id='edit-name'
									name='name'
									defaultValue={editingRider.name}
									required
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='edit-phone'>Phone Number</Label>
								<Input
									id='edit-phone'
									name='phone'
									type='tel'
									defaultValue={editingRider.phone || ''}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='edit-notes'>
									Internal Notes
								</Label>
								<Textarea
									id='edit-notes'
									name='notes'
									rows={3}
									defaultValue={editingRider.notes || ''}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='edit-isActive'>Status</Label>
								<select
									id='edit-isActive'
									name='isActive'
									defaultValue={
										editingRider.isActive ? 'true' : 'false'
									}
									className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'>
									<option value='true'>Active</option>
									<option value='false'>Inactive</option>
								</select>
							</div>
							<div className='flex gap-2 justify-end pt-2'>
								<Button
									type='button'
									variant='ghost'
									onClick={() => setEditingRider(null)}>
									Cancel
								</Button>
								<Button
									type='submit'
									disabled={updateMutation.isPending}
									className='px-8'>
									{updateMutation.isPending
										? 'Updating...'
										: 'Save Changes'}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
