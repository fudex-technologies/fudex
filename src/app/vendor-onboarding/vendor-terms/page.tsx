'use client';

import VendorTermsAndConditions from '@/components/terms-and-conditions/VendorTermsAndConditions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import VendorOnboardingFormsWrapper from '@/components/wrapers/VendorOnboardingFormsWrapper';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PAGES_DATA } from '@/data/pagesData';

export default function VendorOnboardingVendorTermsPage() {
	const router = useRouter();
	const [accepted, setAccepted] = useState(false);

	const handleAgree = () => {
		if (!accepted) return;

		// Clear localStorage onboarding data
		// Note: We're keeping the token for now in case it's needed

		// Navigate to onboarding progress page
		router.push('/vendor-onboarding/progress');
	};

	return (
		<VendorOnboardingFormsWrapper showLogo={false}>
			<div className='py-5'>
				<VendorTermsAndConditions />

				<div className='w-full flex gap-2 items-center my-5'>
					<Checkbox
						className='w-5 h-5'
						checked={accepted}
						onCheckedChange={(checked) =>
							setAccepted(checked as boolean)
						}
					/>
					<p className='text-lg leading-[100%]'>
						I confirm that I have read and accept the terms and
						conditions
					</p>
				</div>
				<div className='w-full flex items-center justify-end'>
					<Button
						variant={'game'}
						disabled={!accepted}
						onClick={handleAgree}>
						AGREE & CONTINUE
					</Button>
				</div>
			</div>
		</VendorOnboardingFormsWrapper>
	);
}
