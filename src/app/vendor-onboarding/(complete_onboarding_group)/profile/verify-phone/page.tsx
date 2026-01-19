'use client';

import GoBackButton from '@/components/GoBackButton';
import InputField from '@/components/InputComponent';
import { Button, buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import OnboardingProgressIndicator from '@/components/OnboardingProgressIndicator';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';

export default function VendorOnboardingPhoneVerificationPage() {
	const router = useRouter();
	const [phone, setPhone] = useState('');
	const { useGetMyVendor, updateMyVendor } = useVendorDashboardActions();
	const trpc = useTRPC();

	const { data: vendor, isLoading } = useGetMyVendor();

	// Fetch progress to show completion status
	const { data: progress } = useQuery(
		trpc.vendors.getVendorOnboardingProgress.queryOptions(undefined, {
			retry: false,
		}),
	);

	useEffect(() => {
		if (vendor?.phone) {
			setPhone(vendor.phone);
		}
	}, [vendor]);

	const { mutate: updateVendor, isPending } = updateMyVendor({
		onSuccess: () => {
			router.push(PAGES_DATA.vendor_onboarding_complete_profile_image);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (phone.length < 10) {
			toast.error('Please enter a valid phone number');
			return;
		}

		// Avoid unnecessary API call if value hasn't changed
		if (vendor?.phone === phone) {
			router.push(PAGES_DATA.vendor_onboarding_complete_profile_image);
			return;
		}

		updateVendor({ phone });
	};

	return (
		<PageWrapper className='px-5'>
			<div className='flex flex-wrap items-center gap-10 w-full'>
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
						Verify your phone number
					</p>
				</div>
				<form className='w-full' onSubmit={handleSubmit}>
					<InputField
						type='tel'
						label='Phone number'
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						placeholder='07012345678'
						icon={
							<ImageWithFallback
								src={'/assets/nigeriaflagicon.svg'}
								className='w-5 h-5'
								alt='Nigeria Flag'
							/>
						}
						// error={touched.phone && errorsNow.phone}
						hint='This phone number should be your store number, and will also be used to communicate with you.'
						required
						disabled={isLoading}
					/>

					<div className='mt-20 w-full space-y-5'>
						<Button
							type='submit'
							variant={'game'}
							className='w-full py-5'
							disabled={
								isPending || isLoading || phone.length < 10
							}>
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
				</form>
			</div>
		</PageWrapper>
	);
}
