'use client';

import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import GoBackButton from '@/components/GoBackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { vercelBlobFolderStructure } from '@/data/vercelBlobFolders';
import { toast } from 'sonner';
import { Loader2, Camera } from 'lucide-react';

export default function VendorDetailsPage() {
	const { useGetMyVendor, updateMyVendor } = useVendorDashboardActions();
	const { data: vendor, isLoading } = useGetMyVendor();
	const updateVendorMutation = updateMyVendor();

	const [formData, setFormData] = useState({
		name: '',
		description: '',
		phone: '',
		email: '',
		coverImage: '',
	});
	const [isUploading, setIsUploading] = useState(false);

	useEffect(() => {
		if (vendor) {
			setFormData({
				name: vendor.name || '',
				description: vendor.description || '',
				phone: vendor.phone || '',
				email: vendor.email || '',
				coverImage: vendor.coverImage || '',
			});
		}
	}, [vendor]);

	const handleFileUpload = async (file: File) => {
		if (!file.type.startsWith('image/')) {
			toast.error('Please upload an image file');
			return;
		}
		setIsUploading(true);
		try {
			const uploadFormData = new FormData();
			uploadFormData.append('file', file);
			uploadFormData.append(
				'folder',
				vercelBlobFolderStructure.vendorCoverImages
			);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: uploadFormData,
			});

			if (!response.ok) throw new Error('Upload failed');
			const data = await response.json();
			setFormData((prev) => ({ ...prev, coverImage: data.url }));
			toast.success('Image uploaded temporarily. Save to apply changes.');
		} catch (error) {
			toast.error('Failed to upload image');
		} finally {
			setIsUploading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateVendorMutation.mutate({
			name: formData.name,
			description: formData.description || undefined,
			phone: formData.phone || undefined,
			email: formData.email || undefined,
			coverImage: formData.coverImage || undefined,
		});
	};

	if (isLoading) {
		return (
			<PageWrapper className='p-5 flex justify-center items-center'>
				<Loader2 className='animate-spin' />
			</PageWrapper>
		);
	}

	return (
		<PageWrapper className='p-5 max-w-2xl mx-auto'>
			<div className='flex items-center gap-5 w-full mb-8'>
				<GoBackButton />
				<h1 className='font-semibold text-lg'>Business Details</h1>
			</div>

			<form onSubmit={handleSubmit} className='space-y-6'>
				<div className='space-y-2'>
					<Label>Cover Image</Label>
					<div className='relative w-full h-40 rounded-lg overflow-hidden border bg-muted'>
						{formData.coverImage ? (
							<ImageWithFallback
								src={formData.coverImage}
								alt='Cover'
								className='w-full h-full object-cover'
							/>
						) : (
							<div className='w-full h-full flex items-center justify-center text-muted-foreground'>
								No cover image
							</div>
						)}
						<label className='absolute bottom-2 right-2 bg-background/80 p-2 rounded-full cursor-pointer hover:bg-background'>
							<Camera size={20} />
							<input
								type='file'
								className='hidden'
								accept='image/*'
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) handleFileUpload(file);
								}}
								disabled={isUploading}
							/>
						</label>
						{isUploading && (
							<div className='absolute inset-0 bg-background/50 flex items-center justify-center'>
								<Loader2 className='animate-spin' />
							</div>
						)}
					</div>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='name'>Business Name *</Label>
					<Input
						id='name'
						value={formData.name}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								name: e.target.value,
							}))
						}
						required
					/>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='description'>Description</Label>
					<Textarea
						id='description'
						value={formData.description}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								description: e.target.value,
							}))
						}
						rows={4}
						placeholder='Tell customers about your business...'
					/>
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					<div className='space-y-2'>
						<Label htmlFor='phone'>Phone Number</Label>
						<Input
							id='phone'
							value={formData.phone}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									phone: e.target.value,
								}))
							}
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='email'>Business Email</Label>
						<Input
							id='email'
							type='email'
							value={formData.email}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									email: e.target.value,
								}))
							}
						/>
					</div>
				</div>

				<Button
					type='submit'
					variant='game'
					className='w-full'
					disabled={updateVendorMutation.isPending}>
					{updateVendorMutation.isPending
						? 'Saving...'
						: 'Save Changes'}
				</Button>
			</form>
		</PageWrapper>
	);
}
