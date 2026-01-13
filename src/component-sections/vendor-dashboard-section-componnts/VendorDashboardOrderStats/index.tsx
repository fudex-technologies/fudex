import SectionWrapper from '@/components/wrapers/SectionWrapper';
import React from 'react';
import VendorStatcard from './VendorStatcard';
import { RiShoppingBag2Line } from 'react-icons/ri';
import { AlarmClock, BadgeCheck, Check } from 'lucide-react';

const VendorDashboardOrdertats = () => {
	return (
		<SectionWrapper className='w-full space-y-2'>
			<h2>Dashboard Order Stats</h2>
			<div className='w-full grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5'>
				<VendorStatcard
					title='Total orders'
					statNumber={0}
					icon={<RiShoppingBag2Line size={20} />}
					color='#2563EB'
				/>
				<VendorStatcard
					title='Accepted'
					statNumber={0}
					icon={<Check size={20} />}
					color='#3DC200'
				/>
				<VendorStatcard
					title='Ongoing'
					statNumber={0}
					icon={<AlarmClock size={20} />}
					color='#F59E0B'
				/>
				<VendorStatcard
					title='Ready'
					statNumber={0}
					icon={<BadgeCheck size={20} />}
					color='#52AA24'
				/>
			</div>
		</SectionWrapper>
	);
};

export default VendorDashboardOrdertats;
