'use client';

import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { PiHamburger } from 'react-icons/pi';
import { IoMdWallet } from 'react-icons/io';
import { FaStar } from 'react-icons/fa';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';
import { useSession } from '@/lib/auth-client';

const VendorDashboardQuickActionsSection = () => {
	const { data: session } = useSession();

	return (
		<SectionWrapper className='w-full space-y-2'>
			<h2>Quick Actions</h2>
			<div className='w-full flex items-center flex-wrap gap-5'>
				<Link
					href={PAGES_DATA.vendor_dashboard_menu_page}
					className='max-w-250px w-fit flex flex-col gap-3 items-center text-center text-[#52AA24] p-3'>
					<div className='p-3 flex items-center justify-center rounded-full bg-[#53aa2435] text-[#52AA24]'>
						<PiHamburger size={24} />
					</div>
					<p>Add New Item</p>
				</Link>
				<Link
					href={PAGES_DATA.vendor_dashboard_payouts_history_page}
					className='max-w-250px w-fit flex flex-col gap-3 items-center text-center text-[#2563EB] p-3'>
					<div className='p-3 flex items-center justify-center rounded-full bg-[#2564eb3c] text-[#2563EB]'>
						<IoMdWallet size={24} />
					</div>
					<p>View earnings</p>
				</Link>
				<Link
					href={PAGES_DATA.single_vendor_reviews_page(
						session?.user?.id || ''
					)}
					className='max-w-250px w-fit flex flex-col gap-3 items-center text-center text-[#F9C300] p-3'>
					<div className='p-3 flex items-center justify-center rounded-full bg-[#f9c3003c] text-[#F9C300]'>
						<FaStar size={24} />
					</div>
					<p>Reviews</p>
				</Link>
			</div>
		</SectionWrapper>
	);
};

export default VendorDashboardQuickActionsSection;
