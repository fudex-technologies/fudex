'use client';

import SectionWrapper from '@/components/wrapers/SectionWrapper';
import OperatorPackageOrderList from '@/component-sections/operator-dashboard-section-componnts/OperatorPackageOrderList';

export default function OperatorPackageOrdersPage() {
	return (
		<SectionWrapper className='p-0'>
			<div className='px-5 py-6'>
				<h2 className='text-3xl font-extrabold tracking-tight'>
					Package Orders 🎁
				</h2>
				<p className='text-muted-foreground'>
					Manage all package orders and delivery schedules
				</p>
			</div>

			<OperatorPackageOrderList />
		</SectionWrapper>
	);
}
