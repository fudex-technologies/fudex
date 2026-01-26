'use client';

import { useState, useEffect } from 'react';
import { useAdminActions } from '@/api-hooks/useAdminActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Store, Sparkles } from 'lucide-react';

interface AssignVendorModalProps {
	user: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export default function AssignVendorModal({
	user,
	open,
	onOpenChange,
	onSuccess,
}: AssignVendorModalProps) {
	const { assignVendorRoleAndCreateProfile } = useAdminActions();
	const [vendorName, setVendorName] = useState('');
	const [slug, setSlug] = useState('');
	const [description, setDescription] = useState('');
	const [coverImage, setCoverImage] = useState('');

	const assignMutation = assignVendorRoleAndCreateProfile({
		onSuccess: () => {
			onOpenChange(false);
			onSuccess?.();
			// Reset form
			setVendorName('');
			setSlug('');
			setDescription('');
			setCoverImage('');
		},
	});

	// Auto-generate slug from vendor name
	useEffect(() => {
		if (vendorName) {
			const generatedSlug = vendorName
				.toLowerCase()
				.replace(/\s+/g, '-')
				.replace(/[^a-z0-9-]/g, '');
			setSlug(generatedSlug);
		}
	}, [vendorName]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!user?.email) {
			return;
		}

		assignMutation.mutate({
			email: user.email,
			vendorName,
			slug,
			description: description || undefined,
			coverImage: coverImage || undefined,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[550px]'>
				<DialogHeader>
					<div className='flex items-center gap-3 mb-2'>
						<div className='p-3 rounded-full bg-primary/10'>
							<Store className='text-primary' size={24} />
						</div>
						<div>
							<DialogTitle className='text-2xl'>
								Assign Vendor Role
							</DialogTitle>
							<DialogDescription className='text-base'>
								Convert {user?.name || user?.email} to a vendor
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-5 py-4'>
					<div className='space-y-2'>
						<Label
							htmlFor='vendor-name'
							className='text-base font-semibold'>
							Vendor Name{' '}
							<span className='text-destructive'>*</span>
						</Label>
						<Input
							id='vendor-name'
							value={vendorName}
							onChange={(e) => setVendorName(e.target.value)}
							placeholder="e.g., Joe's Pizza Palace"
							required
							className='h-11'
						/>
					</div>

					<div className='space-y-2'>
						<Label
							htmlFor='slug'
							className='text-base font-semibold'>
							Slug (URL){' '}
							<span className='text-destructive'>*</span>
						</Label>
						<div className='flex items-center gap-2'>
							<span className='text-sm text-muted-foreground whitespace-nowrap'>
								/vendors/
							</span>
							<Input
								id='slug'
								value={slug}
								onChange={(e) => setSlug(e.target.value)}
								placeholder='joes-pizza-palace'
								required
								className='h-11'
							/>
						</div>
						<p className='text-xs text-muted-foreground'>
							Auto-generated from vendor name. Must be unique.
						</p>
					</div>

					<div className='space-y-2'>
						<Label
							htmlFor='description'
							className='text-base font-semibold'>
							Description
						</Label>
						<Textarea
							id='description'
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder='Brief description of the vendor...'
							rows={3}
							className='resize-none'
						/>
					</div>

					<div className='space-y-2'>
						<Label
							htmlFor='cover-image'
							className='text-base font-semibold'>
							Cover Image URL
						</Label>
						<Input
							id='cover-image'
							value={coverImage}
							onChange={(e) => setCoverImage(e.target.value)}
							placeholder='https://example.com/image.jpg'
							type='url'
							className='h-11'
						/>
						<p className='text-xs text-muted-foreground'>
							Optional. Can be added later from vendor dashboard.
						</p>
					</div>

					<div className='bg-primary/5 border border-primary/20 rounded-lg p-4'>
						<div className='flex items-start gap-3'>
							<Sparkles
								className='text-primary mt-0.5'
								size={18}
							/>
							<div className='flex-1'>
								<p className='text-sm font-medium mb-1'>
									What happens next?
								</p>
								<ul className='text-xs text-muted-foreground space-y-1'>
									<li>
										• VENDOR role will be assigned to{' '}
										{user?.name || 'this user'}
									</li>
									<li>• A vendor profile will be created</li>
									<li>
										• User can access vendor dashboard
										immediately
									</li>
									<li>
										• User can manage products, orders, and
										settings
									</li>
								</ul>
							</div>
						</div>
					</div>

					<div className='flex gap-3 justify-end pt-4'>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
							disabled={assignMutation.isPending}
							className='h-11'>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={assignMutation.isPending}
							className='h-11 px-8'>
							{assignMutation.isPending ? (
								<>
									<div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent' />
									Creating...
								</>
							) : (
								<>
									<Store size={16} className='mr-2' />
									Create Vendor Profile
								</>
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
