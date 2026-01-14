'use client';

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
import { Edit } from 'lucide-react';
import React, { useState } from 'react';

export default function EditProductModal({
	product,
	onSuccess,
}: {
	product: { id: string; name: string; description?: string | null };
	onSuccess: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(product.name);
	const [description, setDescription] = useState(product.description || '');
	const { updateProduct } = useVendorDashboardActions();

	const updateProductMutate = updateProduct({
		onSuccess: () => {
			setOpen(false);
			onSuccess();
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateProductMutate.mutate({
			id: product.id,
			data: {
				name,
				description: description || undefined,
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size={'sm'} variant={'link'}>
					Edit Menu Item
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Menu Item</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='product-name'>Menu Item Name *</Label>
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
							placeholder='Menu item description...'
							rows={3}
						/>
					</div>
					<Button
						type='submit'
						variant='game'
						className='w-full'
						disabled={updateProductMutate.isPending}>
						{updateProductMutate.isPending
							? 'Updating...'
							: 'Update Menu Item'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
