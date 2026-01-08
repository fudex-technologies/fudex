import { ImageWithFallback } from '../ui/ImageWithFallback';
import { getNextOpenTime, isVendorOpen } from '@/lib/vendorUtils';
import { FaStar } from 'react-icons/fa6';
import { FaBicycle } from 'react-icons/fa';
import { FavoriteToggle } from '../FavoriteToggle';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';
import { Separator } from '../ui/separator';
import { formatCurency } from '@/lib/commonFunctions';
import VendorCover from '../VendorCover';

interface VendorData {
	id: string;
	name: string;
	coverImage?: string | null;
	reviewsAverage?: number | null;
	reviewsCount?: number | null;
	openingHours?: any[]; // Using any[] to avoid strict type dependency for now, or import type
}

interface Props {
	vendor: VendorData;
	deliveryPrice?: number; // Optional, defaults to 600
	deliveryTime?: string;
}
const VendorCard = ({ vendor, deliveryPrice = 600, deliveryTime }: Props) => {
	const rating = vendor.reviewsAverage ?? undefined;
	const numberFoRatings = vendor.reviewsCount ?? undefined;
	const image = vendor.coverImage || '/assets/restaurants/restaurant1.png';

	const isOpen = isVendorOpen(vendor.openingHours);
	const nextOpenTime = !isOpen
		? getNextOpenTime(vendor?.openingHours || [])
		: null;

	return (
		<Link
			href={PAGES_DATA.single_vendor_page(vendor.id)}
			className='w-full flex flex-col shrink-0 space-y-1'>
			<div className='relative h-[150px] w-full'>
				<FavoriteToggle
					vendorId={vendor.id}
					className='absolute top-3 right-3 z-10'
					iconSize={25}
				/>
				{!isOpen && (
					<div className='absolute inset-0 bg-black/60 z-1 rounded-lg flex items-center justify-center pointer-events-none'>
						<div className='mx-auto flex flex-col items-center text-white/90 justify-center text-center'>
							<p className='font-semibold'>Closed</p>
							{nextOpenTime && (
								<span className='text-xs font-medium'>
									Opens {nextOpenTime}
								</span>
							)}
						</div>
					</div>
				)}
				<VendorCover
					src={vendor.coverImage}
					imageClassName='rounded-lg h-full w-full object-cover'
					className='h-full w-full rounded-lg'
					alt={vendor.name}
				/>
			</div>

			<div className='w-full flex justify-between'>
				<p className='font-semibold '>{vendor.name}</p>
				{rating && (
					<div className='flex items-center gap-1'>
						<FaStar
							width={15}
							height={15}
							className='text-[#F9C300]'
						/>
						<p className='text-foreground/80'>
							{rating.toFixed(1)}
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
						<Separator
							orientation='vertical'
							className='h-full mx-2'
						/>
						<p>{deliveryTime}</p>
					</>
				)}
			</div>
		</Link>
	);
};

export default VendorCard;
