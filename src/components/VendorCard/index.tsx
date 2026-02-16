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
import { VendorAvailabilityStatus } from '@prisma/client';
import { motion } from 'motion/react';

import { useVendorProductActions } from '@/api-hooks/useVendorActions';

interface VendorData {
	id: string;
	name: string;
	coverImage?: string | null;
	reviewsAverage?: number | null;
	reviewsCount?: number | null;
	availabilityStatus?: VendorAvailabilityStatus;
	openingHours?: any[];
	minPrice?: number | null;
}

interface Props {
	vendor: VendorData;
	deliveryPrice?: number; // Optional override
	deliveryTime?: string;
}
const VendorCard = ({ vendor, deliveryPrice, deliveryTime }: Props) => {
	const { usePublicPlatformSettings } = useVendorProductActions();
	const { data: platformSettings } = usePublicPlatformSettings();

	const baseDeliveryFee =
		((platformSettings as any)?.BASE_DELIVERY_FEE as number) ?? 600;
	const finalDeliveryPrice = deliveryPrice ?? baseDeliveryFee;
	const rating = vendor.reviewsAverage ?? undefined;
	const numberFoRatings = vendor.reviewsCount ?? undefined;
	const image = vendor.coverImage || '/assets/restaurants/restaurant1.png';

	const isOpen = isVendorOpen(
		vendor.openingHours,
		vendor.availabilityStatus || 'AUTO',
	);
	const nextOpenTime = !isOpen
		? getNextOpenTime(vendor?.openingHours || [])
		: null;

	return (
		<motion.div
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			transition={{ duration: 0.2 }}>
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

				<div className='w-full flex flex-col'>
					<div className='flex justify-between '>
						<p className='font-semibold'>{vendor.name}</p>
						<div className='flex items-center gap-1 text-[14px]'>
							<FaBicycle />
							<p>From {formatCurency(finalDeliveryPrice)}</p>
						</div>
					</div>
					{vendor.minPrice !== undefined &&
						vendor.minPrice !== null && (
							<p className='text-xs text-primary/80 font-medium'>
								Menu starts from{' '}
								{formatCurency(vendor.minPrice)}
							</p>
						)}
				</div>

				<div className='flex items-center text-[14px] text-foreground/50'>
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
		</motion.div>
	);
};

export default VendorCard;
