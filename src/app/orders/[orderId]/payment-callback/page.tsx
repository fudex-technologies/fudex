'use client';

import { Suspense } from 'react';
import PaymentCallbackSection from '@/component-sections/PaymentCallbackSection';
import PageWrapper from '@/components/wrapers/PageWrapper';

interface Props {
	params: Promise<{ orderId: string }>;
}

export default function PaymentCallbackPage({ params }: Props) {
	return (
		<PageWrapper>
			<Suspense
				fallback={
					<div className='p-5'>Loading payment callback...</div>
				}>
				<PaymentCallbackSection />
			</Suspense>
		</PageWrapper>
	);
}
