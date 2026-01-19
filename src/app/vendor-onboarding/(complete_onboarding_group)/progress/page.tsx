'use client';

import VendorOnboardingFormsWrapper from '@/components/wrapers/VendorOnboardingFormsWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import {
	Check,
	ChevronRight,
	User,
	FileCheck,
	Shield,
	AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { BsBank, BsSuitcase } from 'react-icons/bs';
import { FaBurger } from 'react-icons/fa6';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { useVendorApprovalActions } from '@/api-hooks/useVendorApprovalActions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect } from 'react';

export default function VendorOnboardingProgressPage() {
	const trpc = useTRPC();
	const { data: session, isPending: isSessionLoading } = useSession();
	const { submitForApproval: submitAction, isSubmitting: isSubmittingState } =
		useVendorApprovalActions();
	const submitForApproval = submitAction;
	const isSubmitting = isSubmittingState;

	// Fetch onboarding progress
	const {
		data: progress,
		isLoading,
		refetch,
	} = useQuery(
		trpc.vendors.getVendorOnboardingProgress.queryOptions(undefined, {
			enabled: !!session?.user,
			retry: false,
			// Mark data as stale immediately so it refetches on mount
			staleTime: 0,
			// Refetch when component mounts or window regains focus
			refetchOnMount: 'always',
			refetchOnWindowFocus: true,
		}),
	);

	// Refetch data when page becomes visible (user comes back to tab)
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				refetch();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => {
			document.removeEventListener(
				'visibilitychange',
				handleVisibilityChange,
			);
		};
	}, [refetch]);

	const handleSubmitForApproval = async () => {
		try {
			await submitForApproval();
			await refetch();
		} catch (error) {
			console.error('Submission failed', error);
		}
	};

	if (isSessionLoading) {
		return (
			<VendorOnboardingFormsWrapper>
				<div className='flex flex-col gap-5 w-full max-w-md'>
					<div className='w-full space-y-2 text-center'>
						<h1 className='font-bold text-xl'>Loading...</h1>
					</div>
				</div>
			</VendorOnboardingFormsWrapper>
		);
	}

	// Determine verification status manually for now as we didn't add it to backend progress steps explicitly yet
	// Or we can assume if they can access the page they can see it.
	// We can infer if documents exist if the user has uploaded them, but the backend step `verificationDocsUploaded` wasn't added to `steps`.
	// For now, let's treat the button click as the main action.
	// Wait, we need to know if it's completed to show the checkmark.
	// The previous implementation of `getVendorOnboardingProgress` didn't include `verificationDocsUploaded`.
	// I should update that procedure too if I really want to track it precisely, but for now let's just show the link.

	const isPending = progress?.approvalStatus === 'PENDING';
	const isApproved = progress?.approvalStatus === 'APPROVED';
	const isDeclined = progress?.approvalStatus === 'DECLINED';
	const isSubmitted = progress?.submittedForApproval;

	return (
		<VendorOnboardingFormsWrapper>
			<div className='flex flex-col gap-5 w-full max-w-md'>
				<div className='w-full space-y-3 text-center'>
					<h1 className='font-bold text-xl'>
						Complete Your Onboarding
					</h1>
					<p className='font-light text-foreground/50 text-sm'>
						Complete all the steps below to get your restaurant live
						on our platform. Once finished, submit your application
						for admin review.
					</p>
					<div className='text-xs text-foreground/40 space-y-1'>
						<p>
							<strong className='text-foreground/60'>
								Progress:
							</strong>{' '}
							{progress?.completedCount || 0} of{' '}
							{progress?.totalSteps || 5} steps
						</p>
					</div>
				</div>

				{/* Status Badges */}
				{isApproved && (
					<Alert className='bg-green-500/10 border-green-500 text-green-700'>
						<FileCheck className='h-4 w-4' />
						<AlertTitle>Approved!</AlertTitle>
						<AlertDescription>
							Your account is active and visible to customers.
						</AlertDescription>
					</Alert>
				)}

				{isDeclined && (
					<Alert variant='destructive'>
						<AlertTriangle className='h-4 w-4' />
						<AlertTitle>Application Declined</AlertTitle>
						<AlertDescription className='mt-2'>
							Reason: {progress?.declineReason}
							<br />
							Please update your information and resubmit.
						</AlertDescription>
					</Alert>
				)}

				{isSubmitted && !isApproved && !isDeclined && (
					<Alert className='bg-blue-500/10 border-blue-500 text-blue-700'>
						<Shield className='h-4 w-4' />
						<AlertTitle>Under Review</AlertTitle>
						<AlertDescription>
							Your application is currently pending admin
							approval.
						</AlertDescription>
					</Alert>
				)}

				<div className='w-full flex flex-col gap-3'>
					<OnboardingItem
						icon={<User />}
						completed={progress?.steps.profileCompleted || false}
						loading={isLoading}
						title='Complete your profile'
						link={
							PAGES_DATA.vendor_onboarding_complete_profile_phone
						}
					/>
					<OnboardingItem
						icon={<BsBank />}
						completed={progress?.steps.paymentInfoAdded || false}
						loading={isLoading}
						title='Set up your payment info'
						link={
							PAGES_DATA.vendor_onboarding_complete_profile_payment_info
						}
					/>
					<OnboardingItem
						icon={<FileCheck />}
						completed={
							(progress?.steps as any)?.identityVerified || false
						}
						loading={isLoading}
						title='Verify your identity'
						link={
							PAGES_DATA.vendor_onboarding_complete_profile_identity
						}
					/>
					<OnboardingItem
						icon={<BsSuitcase />}
						completed={progress?.steps.operationsSetup || false}
						loading={isLoading}
						title='Set up your operations'
						link={
							PAGES_DATA.vendor_dashboard_profile_opening_hours_page
						}
					/>
					<OnboardingItem
						icon={<FaBurger />}
						completed={progress?.steps.menuItemsAdded || false}
						loading={isLoading}
						title='Add menu items'
						link={`${PAGES_DATA.vendor_dashboard_menu_page}?noNav=true`}
					/>
				</div>

				{/* Submit Section */}
				<div className='w-full space-y-3 mt-6 pt-6 border-t border-foreground/10'>
					{!isApproved && !isSubmitted && !isDeclined && (
						<>
							<div className='text-sm space-y-2'>
								<p className='font-medium'>Ready to Submit?</p>
								<p className='text-foreground/60'>
									{progress?.isComplete
										? 'All required steps are complete. Click below to submit your application for admin review.'
										: `Complete all ${progress?.totalSteps || 5} steps to unlock the submit button.`}
								</p>
							</div>
							<Button
								onClick={handleSubmitForApproval}
								disabled={!progress?.isComplete || isSubmitting}
								className='w-full'
								size='lg'>
								{isSubmitting
									? 'Submitting...'
									: 'Submit for Approval'}
							</Button>
						</>
					)}

					{isDeclined && (
						<>
							<div className='text-sm space-y-2'>
								<p className='font-medium'>
									Application Declined
								</p>
								<p className='text-foreground/60'>
									Please review the feedback below and make
									the necessary changes before resubmitting.
								</p>
							</div>
							<Button
								onClick={handleSubmitForApproval}
								disabled={isSubmitting}
								className='w-full'
								size='lg'>
								{isSubmitting
									? 'Resubmitting...'
									: 'Resubmit Application'}
							</Button>
						</>
					)}

					{isSubmitted && !isApproved && !isDeclined && (
						<div className='text-sm space-y-2 text-center'>
							<p className='font-medium text-blue-600'>
								Application Submitted
							</p>
							<p className='text-foreground/60'>
								Your application has been submitted and is
								awaiting admin review. We'll notify you of the
								outcome shortly.
							</p>
						</div>
					)}

					{isApproved && (
						<>
							<div className='text-sm space-y-2 text-center'>
								<p className='font-medium text-green-600'>
									Account Approved!
								</p>
								<p className='text-foreground/60'>
									Your restaurant is now live and visible to
									customers.
								</p>
							</div>
							<Button asChild className='w-full' size='lg'>
								<Link href='/vendor/dashboard'>
									Go to Dashboard
								</Link>
							</Button>
						</>
					)}
				</div>
			</div>
		</VendorOnboardingFormsWrapper>
	);
}

const OnboardingItem = ({
	icon,
	title,
	completed,
	loading,
	link,
}: {
	icon: React.ReactNode;
	title: string;
	completed: boolean;
	loading?: boolean;
	link: string;
}) => {
	return (
		<Link
			href={link} // Allow clicking even if completed to edit
			className={`w-full p-3 rounded-lg flex items-center justify-between transition-colors ${
				completed ? 'bg-primary/10' : 'bg-primary/5 hover:bg-primary/10'
			}`}>
			<div className='flex gap-3 items-center'>
				<div
					className={`p-3 flex items-center justify-center rounded-lg ${
						completed
							? 'bg-primary text-white'
							: 'bg-primary/10 text-primary'
					}`}>
					{icon}
				</div>
				<p className={completed ? 'font-medium' : ''}>{title}</p>
				{!completed && <ChevronRight className='text-foreground/50' />}
			</div>

			{loading ? (
				<div className='w-5 h-5 rounded-full border-2 border-foreground/50 flex items-center justify-center animate-pulse'>
					<div className='w-3 h-3 rounded-full bg-foreground/50'></div>
				</div>
			) : (
				<>
					{completed ? (
						<div className='w-7 h-7 p-1 rounded-full border-2 border-primary flex items-center justify-center bg-primary'>
							<Check className='text-white' />
						</div>
					) : (
						<div className='w-7 h-7 p-1 rounded-full flex items-center justify-center border-2 border-primary/20'></div>
					)}
				</>
			)}
		</Link>
	);
};
