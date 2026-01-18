'use client';

import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useState, useRef, useEffect } from 'react';
import { Upload, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { validatePhoneNumberRegex } from '@/lib/commonFunctions';
import InputField, { TextAreaField } from '@/components/InputComponent';
import { vercelBlobFolderStructure } from '@/data/vercelBlobFolders';

const initialData = {
	name: '',
	description: '',
	phone: '',
	email: '',
	address: '',
	city: '',
	country: '',
	coverImage: '',
};
interface IFormTouchedData {
	name?: boolean;
	description?: boolean;
	phone?: boolean;
	email?: boolean;
	address?: boolean;
	city?: boolean;
	country?: boolean;
	coverImage?: boolean;
}
const VendorProfileSection = () => {
	const [formData, setFormData] = useState(initialData);
	const [touched, setTouched] = useState<IFormTouchedData>({});

	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	const validate = () => {
		const newErrors: any = {};
		if (!formData.phone) newErrors.phone = 'Phone number is required';
		else if (!validatePhoneNumberRegex(formData.phone))
			newErrors.phone = 'Invalid phone number format';
		// if (!form.password) newErrors.password = 'Password is required';

		return newErrors;
	};
	const errorsNow = validate();
	const isFormValid = Object.keys(errorsNow).length === 0;

	// Populate form when vendor data loads
	useEffect(() => {
		if (vendor) {
			// Get the first default address if it exists
			const defaultAddress = vendor.addresses?.find(addr => addr.isDefault) || vendor.addresses?.[0];
			
			setFormData({
				name: vendor.name || '',
				description: vendor.description || '',
				phone: vendor.phone || '',
				email: vendor.email || '',
				address: defaultAddress?.line1 || '',
				city: defaultAddress?.city || '',
				country: defaultAddress?.country || 'NG',
				coverImage: vendor.coverImage || '',
			});
			setTouched({
				name: true,
				description: true,
				phone: true,
				email: true,
				address: true,
				city: true,
				country: true,
				coverImage: true,
			});
		}
	}, [vendor]);

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
			setFormData((prev) => ({ ...prev, coverImage: data.url }));
			updateMutation.mutate({ coverImage: data.url });
			toast.success('Image uploaded successfully');
		} catch (error) {
			toast.error('Failed to upload image');
			console.error(error);
		} finally {
			setIsUploading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setTouched({
			name: true,
			description: true,
			phone: true,
			email: true,
			address: true,
			city: true,
			country: true,
			coverImage: true,
		});
		if (!isFormValid) return;

		updateMutation.mutate(formData);
	};

	const handleChange =
		(field: string) =>
		(
			e:
				| React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
				| string
		) => {
			setFormData({
				...formData,
				[field]: typeof e === 'string' ? e : e.target.value,
			});
			setTouched({ ...touched, [field]: true });
		};

	if (isVendorLoading) {
		return (
			<div className='p-5 space-y-6'>
				<Skeleton className='h-64 w-full' />
				<Skeleton className='h-10 w-full' />
				<Skeleton className='h-10 w-full' />
				<Skeleton className='h-32 w-full' />
			</div>
		);
	}

	if (!vendor) {
		return (
			<div className='p-5 text-center'>
				<p className='text-foreground/70'>
					No vendor profile found. Please contact support.
				</p>
			</div>
		);
	}

	return (
		<div className='px-5 space-y-6 max-w-2xl mx-auto my-0'>
			{/* Stats */}
			<div className='grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg'>
				<div>
					<p className='text-sm text-foreground/70'>Total Products</p>
					<p className='text-2xl font-semibold'>
						{vendor._count?.productItems || 0}
					</p>
				</div>
				<div>
					<p className='text-sm text-foreground/70'>Total Orders</p>
					<p className='text-2xl font-semibold'>
						{vendor._count?.orders || 0}
					</p>
				</div>
			</div>

			{/* Cover Image */}
			<div className='space-y-2'>
				<Label>Cover Image</Label>
				<div className='relative w-full h-48 rounded-lg overflow-hidden border border-foreground/10'>
					{formData.coverImage ? (
						<ImageWithFallback
							src={formData.coverImage}
							alt='Vendor cover'
							className='w-full h-full object-cover'
						/>
					) : (
						<div className='w-full h-full bg-muted flex items-center justify-center'>
							<Upload size={32} className='text-foreground/30' />
						</div>
					)}
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
				</div>
			</div>
			<form onSubmit={handleSubmit} className='space-y-4'>
				{/* Basic Info */}
				<InputField
					type='text'
					label='Vendor Name'
					value={formData.name}
					onChange={handleChange('name')}
					placeholder='Enter vendor name'
					error={touched.name && errorsNow.name}
					required
				/>
				<TextAreaField
					type='text'
					label='Description'
					value={formData.description}
					onChange={handleChange('description')}
					placeholder='Enter vendor description'
					error={touched.description && errorsNow.description}
				/>
				{/* Contact Info */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<InputField
						type='tel'
						label='Phone number'
						value={formData.phone}
						onChange={handleChange('phone')}
						placeholder='7012345678'
						icon={
							<ImageWithFallback
								src={'/assets/nigeriaflagicon.svg'}
								className='w-5 h-5'
							/>
						}
						error={touched.phone && errorsNow.phone}
						required
					/>
					<InputField
						type='email'
						label='Email address'
						value={formData.email}
						onChange={handleChange('email')}
						placeholder='example@gmail.com'
						error={touched.email && errorsNow.email}
						required
					/>
				</div>

				{/* Location */}
				<InputField
					type='text'
					label='Address'
					value={formData.address}
					onChange={handleChange('address')}
					placeholder='Street address'
					error={touched.address && errorsNow.address}
					required
				/>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<InputField
						type='text'
						label='City'
						value={formData.city}
						onChange={handleChange('city')}
						placeholder='City'
						error={touched.city && errorsNow.city}
						required
					/>
					<InputField
						type='text'
						label='Country'
						value={formData.country}
						onChange={handleChange('country')}
						placeholder='country'
						error={touched.country && errorsNow.country}
						required
					/>
				</div>

				<Button
					type='submit'
					variant='game'
					size='lg'
					className='w-full'
					disabled={updateMutation.isPending}>
					{updateMutation.isPending ? (
						<>
							<Loader2 className='animate-spin mr-2' size={16} />
							Saving...
						</>
					) : (
						<>
							<Save size={16} className='mr-2' />
							Save Changes
						</>
					)}
				</Button>
			</form>
		</div>
	);
};

export default VendorProfileSection;
