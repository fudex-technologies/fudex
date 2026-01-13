import SectionWrapper from '@/components/wrapers/SectionWrapper';
import React from 'react';
import { PiHamburger } from 'react-icons/pi';
import { IoMdWallet } from 'react-icons/io';
import { FaStar } from 'react-icons/fa';

const VendorDashboardQuickActionsSection = () => {
	return (
		<SectionWrapper className='w-full space-y-2'>
			<h2>Quick Actions</h2>
			<div className='w-full flex items-center flex-wrap gap-5'>
				<div className='max-w-250px w-fit flex flex-col gap-3 items-center text-center text-[#52AA24] p-3'>
					<div className='p-3 flex items-center justify-center rounded-full bg-[#53aa2435] text-[#52AA24]'>
						<PiHamburger size={24} />
					</div>
					<p>Add New Item</p>
				</div>
				<div className='max-w-250px w-fit flex flex-col gap-3 items-center text-center text-[#2563EB] p-3'>
					<div className='p-3 flex items-center justify-center rounded-full bg-[#2564eb3c] text-[#2563EB]'>
						<IoMdWallet size={24} />
					</div>
					<p>View earnings</p>
				</div>
				<div className='max-w-250px w-fit flex flex-col gap-3 items-center text-center text-[#F9C300] p-3'>
					<div className='p-3 flex items-center justify-center rounded-full bg-[#f9c3003c] text-[#F9C300]'>
						<FaStar size={24} />
					</div>
					<p>Reviews</p>
				</div>
			</div>
		</SectionWrapper>
	);
};

export default VendorDashboardQuickActionsSection;
