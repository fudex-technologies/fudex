'use client';

import VendorTermsAndConditions from '@/components/terms-and-conditions/VendorTermsAndConditions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import VendorOnboardingFormsWrapper from '@/components/wrapers/VendorOnboardingFormsWrapper';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PAGES_DATA } from '@/data/pagesData';
import { useVendorOnboardingActions } from '@/api-hooks/useVendorOnboardingActions';
import { localStorageStrings } from '@/constants/localStorageStrings';
import { normalizePhoneNumber } from '@/lib/commonFunctions';
import { toast } from 'sonner';

export default function VendorOnboardingVendorTermsPage() {
	const router = useRouter();
	const [accepted, setAccepted] = useState(false);

	const { finalizeVendorOnboarding } = useVendorOnboardingActions();

	const { mutate: finalizeMutate, isPending } = finalizeVendorOnboarding({
		onSuccess: () => {
			router.push(PAGES_DATA.vendor_onboarding_progress_page);
		},
	});

	const handleAgree = () => {
		if (!accepted) return;

		// Load all data from localStorage
		const detailsRaw = localStorage.getItem(
			localStorageStrings.vendorOnboardinPersonalDetailsstring,
		);
		const locationRaw = localStorage.getItem(
			localStorageStrings.vendorOnboardingLocationData,
		);
		const tokenRaw = localStorage.getItem(
			localStorageStrings.vendorOnboardingEmailVerificationToken,
		);

		if (!detailsRaw || !locationRaw || !tokenRaw) {
			toast.error('Missing onboarding data. Please start again.');
			router.push(PAGES_DATA.vendor_onboarding_personal_details_page);
			return;
		}

		try {
			const details = JSON.parse(detailsRaw);
			const location = JSON.parse(locationRaw);

			finalizeMutate({
				email: details.email,
				phone: normalizePhoneNumber(details.phone),
				firstName: details.firstName,
				lastName: details.lastName,
				businessName: details.businessName,
				businessDescription: details.businessDescription || '',
				verificationToken: tokenRaw,
				address: location.businessAddress,
				areaId: location.areaId,
			});
		} catch (e) {
			console.error('Finalization error:', e);
			toast.error('Failed to process data. Please start again.');
			router.push(PAGES_DATA.vendor_onboarding_personal_details_page);
		}
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
						disabled={!accepted || isPending}
						onClick={handleAgree}>
						{isPending ? 'AGREEING...' : 'AGREE & CONTINUE'}
					</Button>
				</div>
			</div>
		</VendorOnboardingFormsWrapper>
	);
}
