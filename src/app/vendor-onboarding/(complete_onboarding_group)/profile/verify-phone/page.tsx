'use client';

import GoBackButton from '@/components/GoBackButton';
import InputField from '@/components/InputComponent';
import { Button, buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function VendorOnboardingPhoneVerificationPage() {
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
						Verify your phone number
					</p>
				</div>
				<form className='w-full'>
					<InputField
						type='tel'
						label='Phone number'
						value={form.phone}
						onChange={handleChange('phone')}
						placeholder='7012345678'
						icon={
							<ImageWithFallback
								src={'/assets/nigeriaflagicon.svg'}
								className='w-5 h-5'
							/>
						}
						error={
							touched.phone &&
							(errorsNow.phone || availabilityErrors.phone)
						}
						hint={
							isCheckingPhone
								? 'Checking availability...'
								: 'This phone number should be your store number, and will also be used to communicate with you on WhatsApp'
						}
						required
					/>

					<div className='mt-20 w-full'>
						<Button
							type='submit'
							variant={'game'}
							className='w-full py-5'
							disabled={
								!isFormValid
								// || isPending
							}>
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
