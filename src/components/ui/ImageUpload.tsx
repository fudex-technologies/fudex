'use client';

import { vercelBlobFolderStructure } from '@/data/vercelBlobFolders';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from './button';
import { ImageWithFallback } from './ImageWithFallback';
import { Skeleton } from './skeleton';

interface ImageUploadProps {
	value: string | undefined;
	onChange: (value: string | undefined) => void;
	folder: keyof typeof vercelBlobFolderStructure;
}

export function ImageUpload({ value, onChange, folder }: ImageUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (!file.type.startsWith('image/')) {
				toast.error('Please upload an image file');
				return;
			}
			setIsUploading(true);
			try {
				const uploadFormData = new FormData();
				uploadFormData.append('file', file);
				uploadFormData.append('folder', vercelBlobFolderStructure[folder]);

				const response = await fetch('/api/upload', {
					method: 'POST',
					body: uploadFormData,
				});

				if (!response.ok) {
					throw new Error('Upload failed');
				}

				const data = await response.json();
				onChange(data.url);
				toast.success('Image uploaded successfully');
			} catch (error) {
				toast.error('Failed to upload image. Please try again.');
			} finally {
				setIsUploading(false);
			}
		}
	};

	return (
		<div className='space-y-2'>
			<div className='relative w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center'>
				{isUploading ? (
					<Skeleton className='w-full h-full' />
				) : value ? (
					<ImageWithFallback
						src={value}
						alt='Uploaded image'
						className='object-contain rounded-lg w-full h-full'
					/>
				) : (
					<div className='text-center text-muted-foreground'>
						<Upload className='mx-auto h-8 w-8' />
						<p>Click to upload an image</p>
					</div>
				)}
			</div>
			<input
				type='file'
				ref={fileInputRef}
				onChange={handleFileSelect}
				className='hidden'
				accept='image/*'
				disabled={isUploading}
			/>
			<Button
				type='button'
				variant='outline'
				className='w-full'
				onClick={() => fileInputRef.current?.click()}
				disabled={isUploading}>
				{isUploading ? 'Uploading...' : 'Choose Image'}
			</Button>
		</div>
	);
}
