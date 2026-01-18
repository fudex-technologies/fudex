'use client';

import GoBackButton from '@/components/GoBackButton';
import { Button, buttonVariants } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/ImageUpload'; // Import existing ImageUpload
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import OnboardingProgressIndicator from '@/components/OnboardingProgressIndicator';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';

export default function VendorOnboardingUploadImage() {
	const router = useRouter();
	const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
	const { useGetMyVendor, updateMyVendor } = useVendorDashboardActions(); // ADD THIS LINE
	const trpc = useTRPC();

	// Fetch existing vendor data to pre-fill
	const { data: vendor, isLoading } = useGetMyVendor(); // CHANGE THIS

	// Fetch progress to show completion status
	const { data: progress } = useQuery(
		trpc.vendors.getVendorOnboardingProgress.queryOptions(undefined, {
			retry: false,
		}),
	);

	useEffect(() => {
		if (vendor?.coverImage) {
			setCoverImage(vendor.coverImage);
		}
	}, [vendor]);

	const { mutate: updateVendor, isPending } = updateMyVendor({
		// CHANGE THIS
		onSuccess: () => {
			toast.success('Cover image updated successfully'); // Keep toast.success
			router.push(PAGES_DATA.vendor_onboarding_complete_profile_identity);
		},
	});

	const handleSubmit = () => {
		if (!coverImage) {
			toast.error('Please upload an image first');
			return;
		}

		// Avoid unnecessary API call if value hasn't changed
		if (vendor?.coverImage === coverImage) {
			router.push(PAGES_DATA.vendor_onboarding_complete_profile_identity);
			return;
		}

		updateVendor({
			// CHANGE THIS
			coverImage: coverImage,
		});
	};

	return (
		<PageWrapper>
			<div className='flex items-center gap-10 w-full'>
				<GoBackButton
					link={PAGES_DATA.vendor_onboarding_progress_page}
				/>
				<p className='font-semibold text-xl'>Complete your Profile</p>
				<OnboardingProgressIndicator
					completedSteps={progress?.completedCount}
					totalSteps={progress?.totalSteps}
				/>
			</div>
			<div className='py-10 space-y-5 max-w-lg w-full mx-auto'>
				<div className='space-y-3 w-full'>
					<p className='w-full font-semibold pb-5 border-b'>
						Upload your store and business image
					</p>
					<p className='text-sm text-foreground/50'>
						This image will be shown on your store listing. High
						quality images increase sales!
					</p>
				</div>

				<div className='w-full'>
					<ImageUpload
						value={coverImage}
						onChange={setCoverImage}
						folder='vendorCoverImages'
					/>
				</div>

				<div className='mt-10 w-full space-y-5'>
					<Button
						type='submit'
						variant={'game'}
						className='w-full py-5'
						disabled={!coverImage || isPending || isLoading}
						onClick={handleSubmit}>
						{isPending ? 'Saving...' : 'Continue'}
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
		</PageWrapper>
	);
}
