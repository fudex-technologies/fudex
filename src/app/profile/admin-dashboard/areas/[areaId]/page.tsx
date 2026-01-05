'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminActions } from '@/api-hooks/useAdminActions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurency } from '@/lib/commonFunctions';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import GoBackButton from '@/components/GoBackButton';
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
import { PAGES_DATA } from '@/data/pagesData';

export default function AreaDeliveryFeeRulesPage() {
	const params = useParams();
	const router = useRouter();
	const areaId = params.areaId as string;

	const { useGetAreaById, useListDeliveryFeeRules, createDeliveryFeeRule, updateDeliveryFeeRule, deleteDeliveryFeeRule } = useAdminActions();
	
	const { data: area, isLoading: areaLoading } = useGetAreaById({ id: areaId });
	const { data: rules = [], isLoading: rulesLoading, refetch } = useListDeliveryFeeRules({ areaId });
	
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingRule, setEditingRule] = useState<any>(null);
	const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);

	const createMutation = createDeliveryFeeRule({
		onSuccess: () => {
			refetch();
			setIsCreateDialogOpen(false);
		},
	});

	const updateMutation = updateDeliveryFeeRule({
		onSuccess: () => {
			refetch();
			setEditingRule(null);
		},
	});

	const deleteMutation = deleteDeliveryFeeRule({
		onSuccess: () => {
			refetch();
			setDeletingRuleId(null);
		},
	});

	const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		createMutation.mutate({
			areaId,
			startTime: formData.get('startTime') as string,
			endTime: formData.get('endTime') as string,
			fee: parseFloat(formData.get('fee') as string),
		});
	};

	const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		updateMutation.mutate({
			id: editingRule.id,
			startTime: formData.get('startTime') as string,
			endTime: formData.get('endTime') as string,
			fee: parseFloat(formData.get('fee') as string),
		});
	};

	if (areaLoading || rulesLoading) {
		return (
			<SectionWrapper className='p-5'>
				<div className='space-y-4'>
					<Skeleton className='h-10 w-32' />
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className='h-20 w-full' />
					))}
				</div>
			</SectionWrapper>
		);
	}

	return (
		<SectionWrapper className='p-5'>
			<div className='flex items-center gap-3 mb-5'>
				<GoBackButton link={PAGES_DATA.admin_dashboard_areas_page} />
				<div className='flex-1'>
					<h2 className='text-xl font-semibold'>Delivery Fee Rules</h2>
					{area && (
						<p className='text-sm text-foreground/50'>
							{area.name}, {area.state}
						</p>
					)}
				</div>
			</div>

			<div className='flex items-center justify-between mb-5'>
				<p className='text-sm text-foreground/70'>
					Configure time-based delivery fees for this area
				</p>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus size={18} className='mr-2' />
							Add Rule
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Delivery Fee Rule</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleCreate} className='space-y-4'>
							<div>
								<Label htmlFor='startTime'>Start Time</Label>
								<Input
									id='startTime'
									name='startTime'
									type='time'
									required
									placeholder='08:00'
								/>
								<p className='text-xs text-foreground/50 mt-1'>
									Format: HH:mm (24-hour)
								</p>
							</div>
							<div>
								<Label htmlFor='endTime'>End Time</Label>
								<Input
									id='endTime'
									name='endTime'
									type='time'
									required
									placeholder='18:00'
								/>
								<p className='text-xs text-foreground/50 mt-1'>
									Format: HH:mm (24-hour)
								</p>
							</div>
							<div>
								<Label htmlFor='fee'>Delivery Fee (₦)</Label>
								<Input
									id='fee'
									name='fee'
									type='number'
									step='0.01'
									min='0'
									required
									placeholder='200'
								/>
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

			{rules.length === 0 ? (
				<p className='text-foreground/50 text-center py-8'>
					No delivery fee rules configured. Add a rule to get started.
				</p>
			) : (
				<div className='space-y-3'>
					{rules.map((rule) => (
						<div
							key={rule.id}
							className='border rounded-lg p-4 flex items-center justify-between'>
							<div className='flex-1'>
								<div className='flex items-center gap-2'>
									<span className='font-semibold'>{rule.startTime}</span>
									<span className='text-foreground/50'>-</span>
									<span className='font-semibold'>{rule.endTime}</span>
								</div>
								<p className='text-lg font-bold text-primary mt-1'>
									{formatCurency(rule.fee)}
								</p>
							</div>
							<div className='flex gap-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={() => setEditingRule(rule)}>
									<Edit size={16} />
								</Button>
								<Button
									variant='destructive'
									size='sm'
									onClick={() => setDeletingRuleId(rule.id)}>
									<Trash2 size={16} />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Edit Dialog */}
			{editingRule && (
				<Dialog open={!!editingRule} onOpenChange={(open) => !open && setEditingRule(null)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit Delivery Fee Rule</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleUpdate} className='space-y-4'>
							<div>
								<Label htmlFor='edit-startTime'>Start Time</Label>
								<Input
									id='edit-startTime'
									name='startTime'
									type='time'
									defaultValue={editingRule.startTime}
									required
								/>
							</div>
							<div>
								<Label htmlFor='edit-endTime'>End Time</Label>
								<Input
									id='edit-endTime'
									name='endTime'
									type='time'
									defaultValue={editingRule.endTime}
									required
								/>
							</div>
							<div>
								<Label htmlFor='edit-fee'>Delivery Fee (₦)</Label>
								<Input
									id='edit-fee'
									name='fee'
									type='number'
									step='0.01'
									min='0'
									defaultValue={editingRule.fee}
									required
								/>
							</div>
							<div className='flex gap-2 justify-end'>
								<Button
									type='button'
									variant='outline'
									onClick={() => setEditingRule(null)}>
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

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={!!deletingRuleId}
				onOpenChange={(open) => !open && setDeletingRuleId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Rule</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this delivery fee rule? This action
							cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (deletingRuleId) {
									deleteMutation.mutate({ id: deletingRuleId });
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

