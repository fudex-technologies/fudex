'use client';

import VendorOnboardingFormsWrapper from '@/components/wrapers/VendorOnboardingFormsWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useVendorApprovalActions } from '@/api-hooks/useVendorApprovalActions';
import { useState, useRef } from 'react';
import { Loader2, Upload, FileCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function VerifyIdentityPage() {
	const router = useRouter();
	const { uploadDocument, isUploading } = useVendorApprovalActions();
	const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
	const [isBlobUploading, setIsBlobUploading] = useState(false);
	const inputFileRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

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

			await uploadDocument(url);
			setUploadedDocs((prev) => [...prev, url]);
			toast.success('Document uploaded successfully');
		} catch (error: any) {
			console.error(error);
			toast.error(`Upload failed: ${error.message}`);
		} finally {
			setIsBlobUploading(false);
			if (inputFileRef.current) {
				inputFileRef.current.value = '';
			}
		}
	};

	return (
		<VendorOnboardingFormsWrapper>
			<div className='flex flex-col gap-6 w-full max-w-md'>
				<div className='w-full space-y-2 text-center'>
					<h1 className='font-bold text-xl'>Verify Your Identity</h1>
					<p className='font-light text-foreground/50'>
						Please upload valid documents to verify your business.
						(Business License, ID Proof, etc.)
					</p>
				</div>

				<div className='space-y-4'>
					{/* Upload Area */}
					<div className='border-2 border-dashed border-input rounded-lg p-8 text-center hover:bg-accent/50 transition-colors relative'>
						<input
							ref={inputFileRef}
							type='file'
							onChange={handleFileSelect}
							className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
							disabled={isBlobUploading || isUploading}
							accept='image/*,application/pdf'
						/>
						<div className='flex flex-col items-center gap-2'>
							{isBlobUploading || isUploading ? (
								<Loader2 className='w-8 h-8 animate-spin text-primary' />
							) : (
								<Upload className='w-8 h-8 text-muted-foreground' />
							)}
							<p className='font-medium text-sm'>
								{isBlobUploading || isUploading
									? 'Uploading...'
									: 'Click to upload documents'}
							</p>
							<p className='text-xs text-muted-foreground'>
								JPG, PNG or PDF (Max 4MB)
							</p>
						</div>
					</div>

					{/* Uploaded List */}
					{uploadedDocs.length > 0 && (
						<div className='space-y-2'>
							<h3 className='font-medium text-sm'>
								Uploaded Documents
							</h3>
							{uploadedDocs.map((doc, idx) => (
								<Card key={idx} className='bg-card'>
									<CardContent className='p-3 flex items-center justify-between'>
										<div className='flex items-center gap-2 overflow-hidden'>
											<FileCheck className='w-4 h-4 text-green-500 shrink-0' />
											<span className='text-xs truncate max-w-[200px]'>
												{doc.split('/').pop()}
											</span>
										</div>
										<a
											href={doc}
											target='_blank'
											rel='noopener noreferrer'
											className='text-xs text-primary hover:underline'>
											View
										</a>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>

				<Button
					onClick={() => router.push('/vendor-onboarding/progress')}
					className='w-full'
					disabled={isBlobUploading || isUploading}>
					Back to Progress
				</Button>
			</div>
		</VendorOnboardingFormsWrapper>
	);
}
