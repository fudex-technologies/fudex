import { Ellipsis, Search } from 'lucide-react';
import { GoHeart } from 'react-icons/go';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import GoBackButton from '@/components/GoBackButton';

const SingleVendorTopSection = ({ vendorId }: { vendorId: string }) => {
	return (
		<div className='h-[180px] w-full relative'>
			<ImageWithFallback
				src={'/assets/restaurants/restaurant1.png'}
				className='w-full h-full object-cover'
			/>
			<div className='absolute top-0 left-0 w-full p-5 flex justify-between gap-5 text-white'>
				<GoBackButton className='bg-[#0000004D]' />

				<div className='flex gap-2 items-center'>
					<div className='w-10 aspect-square flex justify-center items-center  rounded-full bg-[#0000004D]'>
						<Search width={20} height={20} />
					</div>
					<div className='w-10 aspect-square flex justify-center items-center  rounded-full bg-[#0000004D]'>
						<GoHeart width={20} height={20} />
					</div>
					<div className='w-10 aspect-square flex justify-center items-center  rounded-full bg-[#0000004D]'>
						<Ellipsis width={20} height={20} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default SingleVendorTopSection;
