import { shortenText } from '@/lib/commonFunctions';
import Image from 'next/image';

const VendorDashboardProfileCircle = () => {
	return (
		<div className='w-fit flex gap-2 items-center'>
			<Image
				width={40}
				height={40}
				src={'/assets/restaurants/restaurant1.png'}
				alt='vendor display image'
				className='rounded-full'
			/>
			<div className='text-start'>
				<p className='text-sm text-foreground/50 m-0'>Welcome back</p>
				<h1 className='text-lg font-bold m-0 leading-[100%]'>
					{shortenText('Follyfem', 30)}
				</h1>
			</div>
		</div>
	);
};

export default VendorDashboardProfileCircle;
