'use client';

import SectionWrapper from '@/components/wrapers/SectionWrapper';
import VendorStatcard from './VendorStatcard';
import { RiShoppingBag2Line } from 'react-icons/ri';
import {
	AlarmClock,
	BadgeCheck,
	Check
} from 'lucide-react';
import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { OrderStatus } from '@prisma/client';


const VendorDashboardOrdertats = () => {
	const { useGetMyOrderCounts } = useVendorDashboardActions();
	const { data: counts = [] } = useGetMyOrderCounts();

	const getCount = (statuses: OrderStatus[]) => {
		return counts
			.filter((c) => statuses.includes(c.status))
			.reduce((acc, curr) => acc + curr.count, 0);
	};

	const totalOrders = counts.reduce((acc, curr) => acc + curr.count, 0);

	return (
		<SectionWrapper className='w-full space-y-2'>
			<h2>Dashboard Order Stats</h2>
			<div className='w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-5'>
				<VendorStatcard
					title='Total orders'
					statNumber={totalOrders}
					icon={<RiShoppingBag2Line size={20} />}
					color='#2563EB'
				/>
				<VendorStatcard
					title='Accepted'
					statNumber={getCount(['ACCEPTED'])}
					icon={<Check size={20} />}
					color='#3DC200'
				/>
				<VendorStatcard
					title='Ongoing'
					statNumber={getCount(['ACCEPTED', 'PREPARING'])}
					icon={<AlarmClock size={20} />}
					color='#F59E0B'
				/>
				<VendorStatcard
					title='Ready'
					statNumber={getCount(['READY'])}
					icon={<BadgeCheck size={20} />}
					color='#52AA24'
				/>
				{/* <VendorStatcard
					title='On route'
					statNumber={getCount(['OUT_FOR_DELIVERY'])}
					icon={<FaBicycle size={20} />}
					color='#10B981'
				/> */}
				{/* <VendorStatcard
					title='Completed'
					statNumber={getCount(['DELIVERED'])}
					icon={<CheckCircle size={20} />}
					color='#22C55E'
				/> */}
				{/* <VendorStatcard
					title='Cancelled'
					statNumber={getCount(['CANCELLED'])}
					icon={<XCircle size={20} />}
					color='#EF4444'
				/> */}
			</div>
		</SectionWrapper>
	);
};

export default VendorDashboardOrdertats;
