'use client';

import AuthPageWrapper from '@/components/wrapers/AuthPageWrapper';
import ProfileVerifyPhonePageUi from '@/component-sections/ProfileVerifyPhonePageUi';
import { Suspense } from 'react';

export default function VerifyPhonePage() {
	return (
		<AuthPageWrapper canSkip={false}>
			<Suspense fallback={<div>Loading...</div>}>
				<ProfileVerifyPhonePageUi />
			</Suspense>
		</AuthPageWrapper>
	);
}
