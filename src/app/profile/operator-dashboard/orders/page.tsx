'use client';

import SectionWrapper from '@/components/wrapers/SectionWrapper';
import OperatorOrderListInfinite from '@/component-sections/operator-dashboard-section-componnts/OperatorOrderListInfinite';

export default function OperatorOrdersPage() {
	return (
		<SectionWrapper className='p-0'>
			<div className='px-5 py-6'>
				<h2 className='text-3xl font-extrabold tracking-tight'>
					Orders
				</h2>
				<p className='text-muted-foreground'>
					Manage all customer orders and rider assignments
				</p>
			</div>

			<OperatorOrderListInfinite />
		</SectionWrapper>
	);
}
