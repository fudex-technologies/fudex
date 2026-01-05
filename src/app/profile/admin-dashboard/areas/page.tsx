'use client';

import { useState } from 'react';
import { useAdminActions } from '@/api-hooks/useAdminActions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatCurency } from '@/lib/commonFunctions';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { Badge } from '@/components/ui/badge';
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

export default function AdminAreasPage() {
	const router = useRouter();
	const { useListAreas, createArea, updateArea, deleteArea } = useAdminActions();
	const { data: areas = [], isLoading, refetch } = useListAreas({ take: 100 });
	
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingArea, setEditingArea] = useState<any>(null);
	const [deletingAreaId, setDeletingAreaId] = useState<string | null>(null);

	const createMutation = createArea({
		onSuccess: () => {
			refetch();
			setIsCreateDialogOpen(false);
		},
	});

	const updateMutation = updateArea({
		onSuccess: () => {
			refetch();
			setEditingArea(null);
		},
	});

	const deleteMutation = deleteArea({
		onSuccess: () => {
			refetch();
			setDeletingAreaId(null);
		},
	});

	const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		createMutation.mutate({
			name: formData.get('name') as string,
			state: formData.get('state') as string,
		});
	};

	const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		updateMutation.mutate({
			id: editingArea.id,
			name: formData.get('name') as string,
			state: formData.get('state') as string,
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
				<h2 className='text-xl font-semibold'>Delivery Areas</h2>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus size={18} className='mr-2' />
							Add Area
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Area</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleCreate} className='space-y-4'>
							<div>
								<Label htmlFor='name'>Area Name</Label>
								<Input id='name' name='name' required placeholder='e.g., Ikeja East' />
							</div>
							<div>
								<Label htmlFor='state'>State</Label>
								<Input id='state' name='state' required placeholder='e.g., Lagos' />
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

			{areas.length === 0 ? (
				<p className='text-foreground/50 text-center py-8'>No areas created yet</p>
			) : (
				<div className='space-y-4'>
					{areas.map((area) => (
						<div
							key={area.id}
							className='border rounded-lg p-4 space-y-3'>
							<div className='flex items-start justify-between'>
								<div className='flex-1'>
									<h3 className='font-semibold text-lg'>{area.name}</h3>
									<p className='text-sm text-foreground/50'>{area.state}</p>
									<div className='flex gap-2 mt-2'>
										<Badge variant='secondary'>
											{area._count?.deliveryFees || 0} fee rule{area._count?.deliveryFees !== 1 ? 's' : ''}
										</Badge>
										<Badge variant='outline'>
											{area._count?.addresses || 0} address{area._count?.addresses !== 1 ? 'es' : ''}
										</Badge>
									</div>
								</div>
								<div className='flex gap-2'>
									<Button
										variant='outline'
										size='sm'
										onClick={() => router.push(`/profile/admin-dashboard/areas/${area.id}`)}>
										<Settings size={16} />
									</Button>
									<Button
										variant='outline'
										size='sm'
										onClick={() => setEditingArea(area)}>
										<Edit size={16} />
									</Button>
									<Button
										variant='destructive'
										size='sm'
										onClick={() => setDeletingAreaId(area.id)}>
										<Trash2 size={16} />
									</Button>
								</div>
							</div>
							{editingArea?.id === area.id && (
								<>
									<Separator />
									<form onSubmit={handleUpdate} className='space-y-4 pt-2'>
										<div>
											<Label htmlFor='edit-name'>Area Name</Label>
											<Input
												id='edit-name'
												name='name'
												defaultValue={area.name}
												required
											/>
										</div>
										<div>
											<Label htmlFor='edit-state'>State</Label>
											<Input
												id='edit-state'
												name='state'
												defaultValue={area.state}
												required
											/>
										</div>
										<div className='flex gap-2 justify-end'>
											<Button
												type='button'
												variant='outline'
												onClick={() => setEditingArea(null)}>
												Cancel
											</Button>
											<Button type='submit' disabled={updateMutation.isPending}>
												{updateMutation.isPending ? 'Updating...' : 'Update'}
											</Button>
										</div>
									</form>
								</>
							)}
						</div>
					))}
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={!!deletingAreaId}
				onOpenChange={(open) => !open && setDeletingAreaId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Area</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this area? This will also delete all
							delivery fee rules associated with it. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (deletingAreaId) {
									deleteMutation.mutate({ id: deletingAreaId });
								}
							}}
							className='bg-destructive text-destructive-foreground'>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</SectionWrapper>
	);
}

