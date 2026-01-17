'use client';

import GoBackButton from '@/components/GoBackButton';
import InputField, { SelectField } from '@/components/InputComponent';
import { Button, buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import { Camera } from 'lucide-react';
import Link from 'next/link';

export default function VendorOnboardingVerifyIdentitiyPage() {
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
					<p className='w-full  text-foreground/50'>
						This helps us keep FUDEX safe and make sure payments go
						to the right person.
					</p>
					<p className='w-full font-semibold'>
						Upload a Government ID
					</p>
					<p className='w-full  text-foreground/50'>
						Please upload a valid government-issued ID to confirm
						your identity. This is required to protect your account
						and prevent fraud.
					</p>
				</div>
				<div className='w-full flex flex-col gap-5'></div>
				<form className='w-full'>
					<SelectField
						data={[
							{
								label: 'Yes',
								value: 'yes',
							},
							{
								label: 'No',
								value: 'no',
							},
						]}
						type='text'
						label='ID Type'
						value={''}
						onChange={() => {}}
						// error={touched.businessName && errorsNow.businessName}
						required
					/>

					<div className='relative w-full h-40 rounded-lg overflow-hidden border bg-muted flex items-center justify-center'>
						<label className='p-2 cursor-pointer hover:bg-background'>
							<div className='text-center flex flex-col items-center'>
								<div className='flex items-center gap-2 '>
									<Camera size={20} />
									<p>Upload Image</p>
								</div>
								<p className='text-foreground/50'>
									Allowed formats .jpg & .png. less than 1mb
								</p>
							</div>

							<input
								type='file'
								className='hidden'
								accept='image/*'
								// onChange={(e) => {
								// 	const file = e.target.files?.[0];
								// 	if (file) handleFileUpload(file);
								// }}
								// disabled={isUploading}
							/>
						</label>
						{/* {isUploading && (
							<div className='absolute inset-0 bg-background/50 flex items-center justify-center'>
								<Loader2 className='animate-spin' />
							</div>
						)} */}
					</div>
					<p className='text-foreground/50'>
						Make sure your ID is clear and readable, avoid glare or
						shadows, place it on a plain surface, and do not crop
						any edges.
					</p>

					<Button
						type='submit'
						variant={'game'}
						className='w-full py-5 mt-10'
						// disabled={
						// 	!isFormValid
						// || isPending}
					>
						{/* {isPending ? 'Sending...' : 'Continue'} */}
						Continue
					</Button>
					<Link
						href={PAGES_DATA.vendor_onboarding_progress_page}
						type='button'
						className={cn(
							buttonVariants({
								variant: 'ghost',
							}),
							'w-full py-5 mb-10'
						)}>
						I’ll do this later
					</Link>
				</form>
			</div>
		</PageWrapper>
	);
}
