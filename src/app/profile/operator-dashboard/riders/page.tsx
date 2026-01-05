'use client';

import { useState } from 'react';
import { useOperatorActions } from '@/api-hooks/useOperatorActions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2 } from 'lucide-react';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { Badge } from '@/components/ui/badge';
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

export default function OperatorRidersPage() {
	const { useListRiders, createRider, updateRider } = useOperatorActions();
	const { data: riders = [], isLoading, refetch } = useListRiders();
	
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingRider, setEditingRider] = useState<any>(null);

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

	const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		createMutation.mutate({
			name: formData.get('name') as string,
			phone: formData.get('phone') as string || undefined,
			notes: formData.get('notes') as string || undefined,
		});
	};

	const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		updateMutation.mutate({
			id: editingRider.id,
			data: {
				name: formData.get('name') as string,
				phone: formData.get('phone') as string || undefined,
				notes: formData.get('notes') as string || undefined,
				isActive: formData.get('isActive') === 'true',
			},
		});
	};

	if (isLoading) {
		return (
			<SectionWrapper className='p-5'>
				<div className='space-y-4'>
					<Skeleton className='h-10 w-32' />
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className='h-20 w-full' />
					))}
				</div>
			</SectionWrapper>
		);
	}

	return (
		<SectionWrapper className='p-5'>
			<div className='flex items-center justify-between mb-5'>
				<h2 className='text-xl font-semibold'>Riders</h2>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus size={18} className='mr-2' />
							Add Rider
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Rider</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleCreate} className='space-y-4'>
							<div>
								<Label htmlFor='name'>Name</Label>
								<Input id='name' name='name' required />
							</div>
							<div>
								<Label htmlFor='phone'>Phone (Optional)</Label>
								<Input id='phone' name='phone' type='tel' />
							</div>
							<div>
								<Label htmlFor='notes'>Notes (Optional)</Label>
								<Textarea id='notes' name='notes' rows={3} />
							</div>
							<div className='flex gap-2 justify-end'>
								<Button
									type='button'
									variant='outline'
									onClick={() => setIsCreateDialogOpen(false)}>
									Cancel
								</Button>
								<Button type='submit' disabled={createMutation.isPending}>
									{createMutation.isPending ? 'Creating...' : 'Create'}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{riders.length === 0 ? (
				<p className='text-foreground/50 text-center py-8'>No riders added yet</p>
			) : (
				<div className='space-y-4'>
					{riders.map((rider) => (
						<div
							key={rider.id}
							className='border rounded-lg p-4 flex items-center justify-between'>
							<div className='flex-1'>
								<div className='flex items-center gap-2 mb-1'>
									<h3 className='font-semibold'>{rider.name}</h3>
									<Badge variant={rider.isActive ? 'default' : 'secondary'}>
										{rider.isActive ? 'Active' : 'Inactive'}
									</Badge>
								</div>
								{rider.phone && (
									<p className='text-sm text-foreground/70'>Phone: {rider.phone}</p>
								)}
								{rider.notes && (
									<p className='text-sm text-foreground/50 mt-1'>{rider.notes}</p>
								)}
							</div>
							<Button
								variant='outline'
								size='sm'
								onClick={() => setEditingRider(rider)}>
								<Edit size={16} />
							</Button>
						</div>
					))}
				</div>
			)}

			{/* Edit Dialog */}
			{editingRider && (
				<Dialog open={!!editingRider} onOpenChange={(open) => !open && setEditingRider(null)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit Rider</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleUpdate} className='space-y-4'>
							<div>
								<Label htmlFor='edit-name'>Name</Label>
								<Input
									id='edit-name'
									name='name'
									defaultValue={editingRider.name}
									required
								/>
							</div>
							<div>
								<Label htmlFor='edit-phone'>Phone</Label>
								<Input
									id='edit-phone'
									name='phone'
									type='tel'
									defaultValue={editingRider.phone || ''}
								/>
							</div>
							<div>
								<Label htmlFor='edit-notes'>Notes</Label>
								<Textarea
									id='edit-notes'
									name='notes'
									rows={3}
									defaultValue={editingRider.notes || ''}
								/>
							</div>
							<div>
								<Label htmlFor='edit-isActive'>Status</Label>
								<select
									id='edit-isActive'
									name='isActive'
									defaultValue={editingRider.isActive ? 'true' : 'false'}
									className='w-full px-3 py-2 border rounded-md'>
									<option value='true'>Active</option>
									<option value='false'>Inactive</option>
								</select>
							</div>
							<div className='flex gap-2 justify-end'>
								<Button
									type='button'
									variant='outline'
									onClick={() => setEditingRider(null)}>
									Cancel
								</Button>
								<Button type='submit' disabled={updateMutation.isPending}>
									{updateMutation.isPending ? 'Updating...' : 'Update'}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</SectionWrapper>
	);
}

