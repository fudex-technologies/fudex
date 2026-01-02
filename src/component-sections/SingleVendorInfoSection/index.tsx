import { Separator } from '@/components/ui/separator';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { FaStar } from 'react-icons/fa';
import { PiMapPinAreaFill } from 'react-icons/pi';

const SingleVendorInfoSection = ({ vendorId }: { vendorId: string }) => {
	return (
		<SectionWrapper className='w-full max-w-lg mx-auto p-0!'>
			<div className='w-full p-5'>
				<h1 className='w-full text-xl font-bold'>Bukolarry</h1>
				<div className='w-full flex items-center gap-3 my-5'>
					<PiMapPinAreaFill />
					<p className='flex-1 text-wrap text-start'>
						Bukolarry restaurant, Opposite God is good hostel, Phase
						2, Ekiti, Nigeria
					</p>
				</div>
			</div>
			<Separator orientation='horizontal' />
			<div className='my-5 w-full'>
				<p className='text-lg px-5'>Vendor rating</p>
				<Link href={PAGES_DATA.single_vendor_reviews_page(vendorId)}  className='w-full flex justify-between items-center p-5'>
					<div className='flex items-center gap-1'>
						<FaStar
							width={15}
							height={15}
							className='text-[#F9C300]'
						/>
						<p className='text-foreground/80'>
							4.6
							<span className='text-foreground/60'>
								(200 reviews)
							</span>
						</p>
					</div>

					<ChevronRight />
				</Link>
			</div>
			<Separator orientation='horizontal' />
			<div className='w-full p-5 space-y-3'>
				<h3 className='font-semibold text-lg'>Opening hours</h3>
				<div className='w-full'>
					<p className='font-normal'>Monday</p>
					<p className=''>9:00 am - 08:00 pm</p>
				</div>
				<div className='w-full'>
					<p className='font-normal'>Tuesday</p>
					<p className=''>9:00 am - 08:00 pm</p>
				</div>
				<div className='w-full'>
					<p className='font-normal'>Wednesday</p>
					<p className=''>9:00 am - 08:00 pm</p>
				</div>
				<div className='w-full'>
					<p className='font-normal'>Thursday</p>
					<p className=''>9:00 am - 08:00 pm</p>
				</div>
				<div className='w-full'>
					<p className='font-normal'>Friday</p>
					<p className=''>9:00 am - 08:00 pm</p>
				</div>
				<div className='w-full'>
					<p className='font-normal'>Saturday</p>
					<p className=''>9:00 am - 08:00 pm</p>
				</div>
				<div className='w-full'>
					<p className='font-normal'>Sunday</p>
					<p className=''>9:00 am - 08:00 pm</p>
				</div>
			</div>
		</SectionWrapper>
	);
};

export default SingleVendorInfoSection;
