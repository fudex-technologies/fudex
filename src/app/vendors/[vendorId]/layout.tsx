import PageWrapper from '@/components/wrapers/PageWrapper';
import React from 'react';

interface Props {
	params: Promise<{ vendorId: string }>;
	children: React.ReactNode;
}

export default async function VendorLayout({ params, children }: Props) {
	const { vendorId } = await params;

	return (
		<PageWrapper className={'pt-0 relative'}>
			{children}
		</PageWrapper>
	);
}
