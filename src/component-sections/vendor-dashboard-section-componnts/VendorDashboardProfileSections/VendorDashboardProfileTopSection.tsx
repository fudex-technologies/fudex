'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { BsChatLeftTextFill } from 'react-icons/bs';
import { FUDEX_PHONE_NUMBER } from '@/lib/staticData/contactData';
import {
	getDoodleAvatarUrl,
	normalizePhoneNumber,
} from '@/lib/commonFunctions';
import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';
import { vercelBlobFolderStructure } from '@/data/vercelBlobFolders';
import { Loader2, Upload } from 'lucide-react';

const VendorDashboardProfileTopSection = () => {
	const [vendorCoverImage, setVendorCoverImage] = useState('');
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { data: session, isPending } = useSession();
	const avatarUrl = getDoodleAvatarUrl(session?.user?.id);

	const { useGetMyVendor, updateMyVendor } = useVendorDashboardActions();
	const {
		data: vendor,
		isLoading: isVendorLoading,
		refetch: refetchVendor,
	} = useGetMyVendor();

	const updateMutation = updateMyVendor({
		onSuccess: () => {
			refetchVendor();
		},
	});

	useEffect(() => {
		if (vendor) {
			setVendorCoverImage(vendor?.coverImage || '');
		}
	}, [vendor]);

	if ((isPending && !session) || isVendorLoading) {
		return <VendorDashboardProfileTopSectionSkeleton />;
	}

	const handleFileUpload = async (file: File) => {
		if (!file.type.startsWith('image/')) {
			toast.error('Please upload an image file');
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			toast.error('File size must be less than 5MB');
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
			if (!response.ok) {
				throw new Error('Upload failed');
			}
			const data = await response.json();
			setVendorCoverImage(data.url);
			updateMutation.mutate({ coverImage: data.url });
			toast.success('Image uploaded successfully');
		} catch (error) {
			toast.error('Failed to upload image');
			console.error(error);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className='flex flex-col items-center'>
			<div
				style={{
					backgroundImage: `url(${
						vendorCoverImage || '/assets/profile-background.png'
					})`,
				}}
				className='h-[150px] w-full bg-center bg-cover flex justify-center relative'>
				<a
					href={`https://wa.me/${normalizePhoneNumber(
						FUDEX_PHONE_NUMBER
					)}?text=Hello%20FUDEX%20`}
					target='__blacnk'
					rel='noreferrer'
					className={cn(
						buttonVariants({
							className:
								'absolute top-6 left-5 bg-background text-foreground rounded-full px-5 py-3 mt-3',
						})
					)}>
					<BsChatLeftTextFill />
					Help
				</a>

				<input
					ref={fileInputRef}
					type='file'
					accept='image/*'
					className='hidden'
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (file) handleFileUpload(file);
					}}
				/>
				<Button
					type='button'
					variant='secondary'
					size='sm'
					className='absolute bottom-2 right-2'
					onClick={() => fileInputRef.current?.click()}
					disabled={isUploading}>
					{isUploading ? (
						<Loader2 className='animate-spin' size={16} />
					) : (
						<Upload size={16} />
					)}
					{isUploading ? 'Uploading...' : 'Upload'}
				</Button>

				<div className='w-[100px] h-[100px] p-1 bg-background rounded-full absolute -bottom-[50px] flex justify-center items-center'>
					<ImageWithFallback
						src={avatarUrl}
						className='rounded-full w-full] h-full object-cover object-center'
					/>
				</div>
			</div>

			<div className='mt-12 space-y-3 text-center flex flex-col items-center'>
				<h1 className='font-bold text-lg'>
					{vendor?.name || 'Vendor Name'}
				</h1>
			</div>
		</div>
	);
};

export default VendorDashboardProfileTopSection;

export const VendorDashboardProfileTopSectionSkeleton = () => {
	return (
		<div className='flex flex-col items-center'>
			<div className='h-[150px] w-full bg-gray-200 flex justify-center relative'>
				<div className='w-[100px] h-[100px] p-1 bg-background rounded-full absolute -bottom-[50px] flex justify-center items-center'>
					<Skeleton className='h-full w-full rounded-full' />
				</div>
			</div>

			<div className='mt-12 space-y-3 text-center flex flex-col items-center'>
				<Skeleton className='h-7 w-40' />
				<div className='px-5 py-3 w-fit flex items-center justify-center gap-1 border rounded-full'>
					<Skeleton className='h-7 w-7 rounded-full' />
					<Skeleton className='h-5 w-5' />
				</div>
			</div>
		</div>
	);
};
