import VendorDashboardOrderCardItem from '@/component-sections/vendor-dashboard-section-componnts/VendorDashboardOrderListSections/VendorDashboardOrderCardItem';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import Image from 'next/image';

export default function VendorDashboardOngoingOrdersPage() {
	const isEmpty = false;
	return (
		<div className='w-full p-5'>
			{isEmpty && (
				<div className='w-full flex flex-col items-center justify-center py-10 text-center'>
					<Image
						src={'/assets/fudex-tackout-pack.png'}
						width={250}
						height={250}
						alt='fudex tackout package'
						className='object-contain'
					/>
					<p className='font-semibold'>No order ongoing yet</p>
					<p className=''>
						When customers places an order, it will appear here
					</p>
				</div>
			)}
			{!isEmpty && (
				<SectionWrapper className='py-5 px-0! w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
					{[1, 2, 3, 4, 5].map((order) => (
						<VendorDashboardOrderCardItem
							isNew={false}
							status={'PREPARING'}
						/>
					))}
				</SectionWrapper>
			)}
		</div>
	);
}
