'use client';

import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { Button } from '@/components/ui/button';
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
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

export default function CreateProductModal({
	onSuccess,
}: {
	onSuccess: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const { createProduct } = useVendorProductActions();
	const { useGetMyVendor } = useVendorDashboardActions();
	const { data: vendor } = useGetMyVendor();

	const createProductMutate = createProduct({
		onSuccess: () => {
			setOpen(false);
			setName('');
			setDescription('');
			onSuccess();
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!vendor) {
			toast.error('Vendor not found');
			return;
		}
		createProductMutate.mutate({
			vendorId: vendor.id,
			name,
			description: description || undefined,
			inStock: true,
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant='game' size='lg'>
					<Plus size={16} className='mr-2' />
					Create Product
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Product</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='product-name'>Product Name *</Label>
						<Input
							id='product-name'
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							placeholder='e.g., Special Fried Rice'
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='product-desc'>Description</Label>
						<Textarea
							id='product-desc'
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder='Product description...'
							rows={3}
						/>
					</div>
					<Button
						type='submit'
						variant='game'
						className='w-full'
						disabled={createProductMutate.isPending}>
						{createProductMutate.isPending
							? 'Creating...'
							: 'Create Product'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
