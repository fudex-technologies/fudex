'use client';

import GoBackButton from '@/components/GoBackButton';
import { SelectField } from '@/components/InputComponent';
import { Button, buttonVariants } from '@/components/ui/button';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import { Camera, Loader2, CheckCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { useVendorApprovalActions } from '@/api-hooks/useVendorApprovalActions';
import { toast } from 'sonner';

export default function VendorOnboardingVerifyIdentitiyPage() {
	const { uploadDocument, isUploading } = useVendorApprovalActions();
	const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
	const [isBlobUploading, setIsBlobUploading] = useState(false);
	// We can keep the ID type selection for UI completeness,
	// even if backend just stores the URL for now.
	// Ideally we would send this metadata too.
	const [idType, setIdType] = useState('');

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		if (!idType) {
			toast.error('Please select an ID type first');
			// Reset file input
			e.target.value = '';
			return;
		}

		setIsBlobUploading(true);
		try {
			const file = files[0];
			const formData = new FormData();
			formData.append('file', file);
			formData.append('folder', 'vendors/verification-documents');

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				throw new Error('Upload failed');
			}

			const data = await response.json();
			const url = data.url;

			await uploadDocument(url, idType);
			setUploadedDocs((prev) => [...prev, url]);
			toast.success('Document uploaded successfully');
		} catch (error: any) {
			console.error(error);
			toast.error(`Upload failed: ${error.message}`);
		} finally {
			setIsBlobUploading(false);
			// Reset input if needed, though mostly handled by React state
			// e.target.value = '';
		}
	};

	return (
		<PageWrapper>
			<div className='flex items-center gap-10 w-full'>
				<GoBackButton
					link={PAGES_DATA.vendor_onboarding_progress_page}
				/>
				<p className='font-semibold text-xl'>Complete your Profile</p>
			</div>
			<div className='py-10 space-y-5 max-w-lg w-full mx-auto'>
				<div className='space-y-3 w-full'>
					<p className='w-full font-semibold pb-5 border-b'>
						Verify Your Identity
					</p>
					<p className='w-full text-foreground/50'>
						This helps us keep FUDEX safe and make sure payments go
						to the right person.
					</p>
					<p className='w-full font-semibold'>
						Upload a Government ID
					</p>
					<p className='w-full text-foreground/50'>
						Please upload a valid government-issued ID to confirm
						your identity. This is required to protect your account
						and prevent fraud.
					</p>
				</div>

				<div className='w-full'>
					<SelectField
						data={[
							{ label: 'National ID Card', value: 'national_id' },
							{
								label: 'Drivers License',
								value: 'drivers_license',
							},
							{
								label: 'International Passport',
								value: 'passport',
							},
							{ label: 'Voters Card', value: 'voters_card' },
						]}
						type='text'
						label='ID Type'
						value={idType}
						onChange={(value) => setIdType(value)}
						required
					/>

					<div className='relative w-full h-40 rounded-lg overflow-hidden border bg-muted flex items-center justify-center mt-4 group hover:bg-muted/80 transition-colors'>
						<label className='p-2 cursor-pointer w-full h-full flex items-center justify-center'>
							<div className='text-center flex flex-col items-center gap-2'>
								{isBlobUploading ? (
									<Loader2 className='animate-spin h-8 w-8 text-primary' />
								) : (
									<>
										<div className='flex items-center gap-2 text-primary'>
											<Camera size={24} />
											<p className='font-medium'>
												Tap to Upload Image
											</p>
										</div>
										<p className='text-xs text-foreground/50 max-w-[200px]'>
											Allowed formats .jpg, .png & .pdf.
											Max 5MB
										</p>
									</>
								)}
							</div>

							<input
								type='file'
								className='hidden'
								accept='image/*,application/pdf'
								onChange={handleFileSelect}
								disabled={isBlobUploading || isUploading}
							/>
						</label>
					</div>

					{/* Display Uploaded Documents */}
					{uploadedDocs.length > 0 && (
						<div className='mt-4 space-y-2'>
							<p className='text-sm font-medium'>
								Uploaded Documents:
							</p>
							{uploadedDocs.map((doc, idx) => (
								<div
									key={idx}
									className='flex items-center gap-2 p-2 border rounded bg-background text-sm text-muted-foreground'>
									<FileText size={16} />
									<span className='truncate flex-1'>
										{doc.split('/').pop()}
									</span>
									<CheckCircle
										size={16}
										className='text-green-500'
									/>
									<Link
										href={doc}
										target='_blank'
										className='text-xs text-primary underline ml-2'>
										View
									</Link>
								</div>
							))}
						</div>
					)}

					<p className='text-foreground/50 text-xs mt-4'>
						Make sure your ID is clear and readable, avoid glare or
						shadows, place it on a plain surface, and do not crop
						any edges.
					</p>

					<div className='mt-10 w-full space-y-5'>
						<Button
							asChild
							variant={'game'}
							className='w-full py-5'>
							<Link
								href={
									PAGES_DATA.vendor_onboarding_progress_page
								}>
								{uploadedDocs.length > 0
									? 'Continue'
									: 'Go Back'}
							</Link>
						</Button>

						<Link
							href={PAGES_DATA.vendor_onboarding_progress_page}
							type='button'
							className={cn(
								buttonVariants({
									variant: 'ghost',
								}),
								'w-full py-5'
							)}>
							I’ll do this later
						</Link>
					</div>
				</div>
			</div>
		</PageWrapper>
	);
}
