import { ImageWithFallback } from '../ui/ImageWithFallback';
import { FaStar } from 'react-icons/fa6';
import { FaBicycle } from 'react-icons/fa';
import { GoHeart } from 'react-icons/go';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';
import { Separator } from '../ui/separator';
import { formatCurency } from '@/lib/commonFunctions';

interface Props {
	image: string;
	name: string;
	rating?: number;
	numberFoRatings?: number;
	deliveryPrice: number;
	deliveryTime?: string;
}
const VendorCard = ({
	deliveryPrice,
	image,
	name,
	numberFoRatings,
	rating,
	deliveryTime,
}: Props) => {
	return (
		<Link
			href={PAGES_DATA.single_vendor_page('1')}
			className='w-full flex flex-col shrink-0 space-y-1'>
			<div className='relative h-[150px] w-full'>
				<GoHeart
					width={25}
					height={25}
					className='absolute top-3 right-3 text-white font-bold'
				/>
				<ImageWithFallback
					src={image}
					className='rounded-lg h-full w-full object-cover'
					alt='restaurant'
				/>
			</div>

			<div className='w-full flex justify-between'>
				<p className='font-semibold '>{name}</p>
				{rating && (
					<div className='flex items-center gap-1'>
						<FaStar
							width={15}
							height={15}
							className='text-[#F9C300]'
						/>
						<p className='text-foreground/80'>
							{rating}
							{numberFoRatings && (
								<span className='text-foreground/60'>
									({numberFoRatings})
								</span>
							)}
						</p>
					</div>
				)}
			</div>

			<div className='flex items-center text-[14px] text-foreground/50'>
				<div className='flex items-center gap-1'>
					<FaBicycle />
					<p>From {formatCurency(deliveryPrice)}</p>
				</div>
				{deliveryTime && (
					<>
						<Separator orientation='vertical' className='h-full mx-2' />
						<p>{deliveryTime}</p>
					</>
				)}
			</div>
		</Link>
	);
};

export default VendorCard;
