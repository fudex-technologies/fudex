'use client';

import SectionWrapper from '@/components/wrapers/SectionWrapper';
import OperatorRiderListInfinite from '@/component-sections/operator-dashboard-section-componnts/OperatorRiderListInfinite';

export default function OperatorRidersPage() {
	return (
		<SectionWrapper className='p-0'>
			<OperatorRiderListInfinite />
		</SectionWrapper>
	);
}
