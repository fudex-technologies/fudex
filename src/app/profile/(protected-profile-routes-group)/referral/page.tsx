'use client';

import CopyDataComponent from '@/components/CopyDataComponent';
import GoBackButton from '@/components/GoBackButton';
import MobileBottomNav from '@/components/navigation-components/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { cn } from '@/lib/utils';
import { RefreshCw, Copy } from 'lucide-react';
import { useProfileActions } from '@/api-hooks/useProfileActions';
import { toast } from 'sonner';

export default function ReferralPage() {
	const { getReferralStats, generateReferralCode } = useProfileActions();
	const { data: referralData, isLoading, refetch } = getReferralStats();
	const { mutate: generateCode, isPending: isGeneratingCode } =
		generateReferralCode({
			onSuccess: () => {
				// Refetch stats to get the newly generated code
				refetch();
			},
		});

	const referralCode = referralData?.referralCode || '';
	const confirmedReferred = referralData?.confirmedReferred || 0;
	const totalCapacity = 5;
	const percentageFilled = (confirmedReferred / totalCapacity) * 100;

	const handleGenerateCode = () => {
		generateCode();
	};

	const handleShare = async () => {
		const referralLink = `${window.location.origin}/onboarding?ref=${referralCode}`;

		// Try native share first if available
		if (navigator.share) {
			try {
				await navigator.share({
					title: 'Join FUDEX',
					text: `Join FUDEX using my referral code: ${referralCode}`,
					url: referralLink,
				});
				return;
			} catch (err: any) {
				// User cancelled native share, fall through to copy
				if (err.name !== 'AbortError') {
					console.log('Share failed:', err);
				}
			}
		}

		// Fall back to copying to clipboard
		try {
			await navigator.clipboard.writeText(referralLink);
			toast.success('Link copied to clipboard!', {
				description:
					'Share this link with your friends to earn rewards',
			});
		} catch (err) {
			toast.error('Failed to copy link', {
				description: 'Please try again',
			});
			console.log('Copy failed:', err);
		}
	};

	if (isLoading) {
		return (
			<PageWrapper className='flex flex-col items-center'>
				<div className='flex items-center gap-10 w-full px-5'>
					<GoBackButton />
					<h1 className='font-semibold text-xl'>Refer and Earn</h1>
				</div>
				<SectionWrapper className='flex flex-col items-center max-w-lg px-5!'>
					<div className='w-full text-center'>
						<p>Loading referral data...</p>
					</div>
				</SectionWrapper>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper className='flex flex-col items-center'>
			<div className='flex items-center gap-10 w-full px-5'>
				<GoBackButton />
				<h1 className='font-semibold text-xl'>Refer and Earn</h1>
			</div>
			<SectionWrapper className='flex flex-col items-center max-w-lg px-5!'>
				<div className='w-full space-y-5'>
					<ImageWithFallback
						src={'/assets/referralillustration.png'}
						className='w-full'
					/>
					<div className='w-full text-center'>
						<h3 className='text-3xl font-bold'>
							Invite friends and earn food credits!
						</h3>
						<p>
							Earn #500 food credits for 5 friends who join FUDEX
							using your referral code
						</p>
					</div>

					<div className='w-full my-5 space-y-2'>
						<p>Referral Code</p>
						{referralCode ? (
							<div className='w-full p-5 rounded-lg border border-foreground flex items-center justify-between'>
								<p className='font-mono text-lg font-bold'>
									{referralCode}
								</p>
								<CopyDataComponent data={referralCode} />
							</div>
						) : (
							<Button
								variant={'game'}
								size={'lg'}
								className='w-full p-6'
								onClick={handleGenerateCode}
								disabled={isGeneratingCode}>
								{isGeneratingCode ? (
									<>
										<RefreshCw className='w-4 h-4 mr-2 animate-spin' />
										Generating...
									</>
								) : (
									'Generate Referral Code'
								)}
							</Button>
						)}
					</div>

					<div className='w-full flex justify-center'>
						{referralCode && (
							<Button
								variant={'game'}
								size={'lg'}
								className='w-fit p-6'
								onClick={handleShare}>
								Copy Share Link
								<Copy className='w-4 h-4' />
							</Button>
						)}
					</div>

					<div className='w-full'>
						<p className='text-lg text-gray-500'>Referrals</p>
						<div className='w-full flex gap-5 items-end mb-6'>
							<div className='relative flex-1 flex rounded-full h-7 overflow-hidden bg-foreground/10 items-center justify-center'>
								<div
									className={cn(
										'h-full bg-primary absolute top-0 left-0 transition-all',
									)}
									style={{ width: `${percentageFilled}%` }}
								/>
								<p className='relative z-10 text-sm font-semibold'>
									{confirmedReferred >= totalCapacity
										? totalCapacity
										: confirmedReferred}
									/{totalCapacity}
								</p>
							</div>
							<ImageWithFallback
								src={'/assets/gift.png'}
								className='w-[34px]'
							/>
						</div>

						{/* Referral List */}
						<div className='space-y-4'>
							{referralData?.referrals &&
							referralData.referrals.length > 0 ? (
								<div className='rounded-xl border bg-card overflow-hidden'>
									<div className='divide-y'>
										{referralData.referrals.map(
											(referral: any) => (
												<div
													key={referral.id}
													className='p-4 flex items-center justify-between'>
													<div>
														<p className='font-semibold'>
															{referral.userName ||
																'Unknown User'}
														</p>
														<p className='text-xs text-muted-foreground'>
															Joined{' '}
															{new Date(
																referral.createdAt,
															).toLocaleDateString()}
														</p>
													</div>
													<div className='flex flex-col items-end gap-1'>
														<span
															className={cn(
																'px-2 py-0.5 rounded-full text-xs font-medium',
																referral.status ===
																	'CONFIRMED'
																	? 'bg-green-500/10 text-green-600'
																	: 'bg-yellow-500/10 text-yellow-600',
															)}>
															{referral.status ===
															'CONFIRMED'
																? 'Confirmed'
																: 'Pending'}
														</span>
														{referral.status ===
															'PENDING' && (
															<span className='text-[10px] text-muted-foreground'>
																Needs to
																complete signup
															</span>
														)}
													</div>
												</div>
											),
										)}
									</div>
								</div>
							) : (
								<div className='text-center py-10 border rounded-xl border-dashed bg-muted/30'>
									<p className='text-muted-foreground mb-2'>
										No referrals yet
									</p>
									<p className='text-xs text-muted-foreground max-w-xs mx-auto'>
										Share your code with friends to start
										earning rewards!
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</SectionWrapper>
			<MobileBottomNav />
		</PageWrapper>
	);
}
