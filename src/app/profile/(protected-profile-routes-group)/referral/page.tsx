'use client';

import CopyDataComponent from '@/components/CopyDataComponent';
import GoBackButton from '@/components/GoBackButton';
import MobileBottomNav from '@/components/navigation-components/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { cn } from '@/lib/utils';
import { RefreshCw, Copy, ChevronRight, ScrollText } from 'lucide-react';
import Link from 'next/link';
import { useProfileActions } from '@/api-hooks/useProfileActions';
import { toast } from 'sonner';

import { ReferralLeaderboard } from './ReferralLeaderboard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
				<div className='flex items-center gap-10 w-full px-5 py-4 border-b bg-background sticky top-0 z-50'>
					<GoBackButton />
					<h1 className='font-semibold text-xl'>Refer and Earn</h1>
				</div>
				<SectionWrapper className='flex flex-col items-center max-w-lg px-5!'>
					<div className='w-full text-center py-20'>
						<RefreshCw className='w-8 h-8 animate-spin mx-auto text-primary mb-4' />
						<p className='text-muted-foreground font-medium'>
							Loading your referral status...
						</p>
					</div>
				</SectionWrapper>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper className='flex flex-col items-center'>
			<div className='flex items-center gap-10 w-full px-5 py-4 border-b bg-background sticky top-0 z-50'>
				<GoBackButton />
				<h1 className='font-semibold text-xl'>Refer and Earn</h1>
			</div>
			<SectionWrapper className='flex flex-col items-center max-w-lg px-5! pb-24'>
				<div className='w-full space-y-8'>
					<div className='relative rounded-2xl overflow-hidden bg-linear-to-br from-primary/10 to-secondary/10 p-6 border border-primary/20'>
						<ImageWithFallback
							src={'/assets/referralillustration.png'}
							className='w-full max-w-[200px] mx-auto mb-4 drop-shadow-xl'
						/>
						<div className='w-full text-center'>
							<h3 className='text-2xl font-bold mb-2'>
								Earn ₦150 Per Order!
							</h3>
							<p className='text-sm text-balance text-muted-foreground'>
								Invite your friends to FUDEX. You earn ₦150 for
								every order they make (up to their 5th order).
							</p>
						</div>
					</div>

					{/* Rules Link */}
					<Link
						href='/profile/referral/rules'
						className='w-full flex items-center justify-between p-4 rounded-xl border bg-card/60 hover:bg-muted/40 transition-colors group'>
						<div className='flex items-center gap-3'>
							<div className='p-2 rounded-lg bg-primary/10'>
								<ScrollText className='w-4 h-4 text-primary' />
							</div>
							<div>
								<p className='font-semibold text-sm'>
									Referral Program Rules
								</p>
								<p className='text-xs text-muted-foreground'>
									How it works, eligibility & fair use
								</p>
							</div>
						</div>
						<ChevronRight className='w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors' />
					</Link>

					<div className='w-full space-y-3'>
						<div className='flex items-center justify-between px-1'>
							<span className='text-sm font-medium'>
								Your Referral Code
							</span>
						</div>
						{referralCode ? (
							<div className='group relative w-full p-5 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex items-center justify-between overflow-hidden transition-all hover:border-primary/50'>
								<div className='absolute inset-0 bg-linear-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000' />
								<p className='font-mono text-2xl font-black tracking-widest text-primary relative z-10'>
									{referralCode}
								</p>
								<div className='relative z-10'>
									<CopyDataComponent data={referralCode} />
								</div>
							</div>
						) : (
							<Button
								variant={'game'}
								size={'lg'}
								className='w-full p-8 text-lg'
								onClick={handleGenerateCode}
								disabled={isGeneratingCode}>
								{isGeneratingCode ? (
									<>
										<RefreshCw className='w-5 h-5 mr-2 animate-spin' />
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
								className='w-full sm:w-fit p-6 gap-3'
								onClick={handleShare}>
								<Copy className='w-5 h-5' />
								Share Referral Link
							</Button>
						)}
					</div>

					<div className='w-full bg-card/50 backdrop-blur-sm border rounded-xl p-4 flex items-center justify-between'>
						<div>
							<p className='text-sm text-muted-foreground'>
								Total Confirmed Referrals
							</p>
							<p className='text-2xl font-bold'>
								{confirmedReferred}
							</p>
						</div>
						<div className='h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600'>
							<RefreshCw className='w-5 h-5' />
						</div>
					</div>
					<div className='w-full space-y-4'>
						<div className='flex items-center justify-between'>
							<p className='text-lg font-bold'>My Referrals</p>
						</div>

						{referralData?.referrals &&
						referralData.referrals.length > 0 ? (
							<div className='rounded-2xl border bg-card/50 backdrop-blur-sm overflow-hidden'>
								<div className='divide-y border-t'>
									{referralData.referrals.map(
										(referral: any) => (
											<div
												key={referral.id}
												className='p-4 flex items-center justify-between hover:bg-muted/30 transition-colors'>
												<div className='flex items-center gap-3'>
													<Avatar className='w-10 h-10 border-2 border-primary/10'>
														<AvatarImage
															src={
																referral.user
																	?.image ||
																''
															}
														/>
														<AvatarFallback>
															{referral.user?.name.charAt(
																0,
															)}
														</AvatarFallback>
													</Avatar>
													<div>
														<p className='font-bold text-sm'>
															{referral.user
																?.name ||
																'Anonymous'}
														</p>
														<div className='flex items-center gap-2'>
															<p className='text-[10px] text-muted-foreground'>
																Joined{' '}
																{new Date(
																	referral.createdAt,
																).toLocaleDateString()}
															</p>
															<span
																className={cn(
																	'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
																	referral
																		.user
																		?.orderCount >=
																		5
																		? 'bg-slate-100 text-slate-500'
																		: 'bg-primary/10 text-primary',
																)}>
																{referral.user
																	?.orderCount ||
																	0}
																/5 Orders
															</span>
														</div>
													</div>
												</div>
												<div className='flex flex-col items-end gap-1'>
													<span
														className={cn(
															'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
															referral.status ===
																'CONFIRMED'
																? 'bg-green-500/10 text-green-600 border border-green-500/20'
																: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20',
														)}>
														{referral.status ===
														'CONFIRMED'
															? 'Confirmed'
															: 'Pending'}
													</span>
													{referral.status ===
														'PENDING' && (
														<p className='text-[9px] font-medium text-muted-foreground'>
															Needs 1st Delivery
														</p>
													)}
													{referral.status ===
														'CONFIRMED' &&
														referral.user
															?.orderCount >=
															5 && (
															<p className='text-[9px] font-medium text-slate-400'>
																Max Bonus
																Reached
															</p>
														)}
												</div>
											</div>
										),
									)}
								</div>
							</div>
						) : (
							<div className='text-center py-12 border-2 border-dashed rounded-2xl bg-muted/5'>
								<div className='bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3'>
									<RefreshCw className='w-6 h-6 text-muted-foreground rotate-45' />
								</div>
								<p className='text-muted-foreground font-semibold mb-1'>
									No referrals yet
								</p>
								<p className='text-xs text-muted-foreground px-10'>
									Share your unique code with friends to start
									earning ₦150 per order!
								</p>
							</div>
						)}
					</div>

					<div className='w-full space-y-4'>
						<ReferralLeaderboard />
					</div>
				</div>
			</SectionWrapper>
			<MobileBottomNav />
		</PageWrapper>
	);
}
