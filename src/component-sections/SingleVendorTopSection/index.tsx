'use client';

import { Ellipsis, Search } from 'lucide-react';
import { GoHeart } from 'react-icons/go';
import VendorCover from '@/components/VendorCover';
import GoBackButton from '@/components/GoBackButton';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { Skeleton } from '@/components/ui/skeleton';

const SingleVendorTopSection = ({
	vendorId,
	image,
}: {
	vendorId: string;
	image?: string;
}) => {
	const { useGetVendorById } = useVendorProductActions();
	const { data: vendor, isLoading } = useGetVendorById({ id: vendorId });

	if (isLoading) {
		return (
			<div className='h-[180px] w-full relative'>
				<Skeleton className='w-full h-full' />
				<div className='absolute top-0 left-0 w-full p-5 flex justify-between gap-5'>
					<GoBackButton className='bg-[#0000004D]' />
					<div className='flex gap-2 items-center'>
						<Skeleton className='w-10 h-10 rounded-full' />
						<Skeleton className='w-10 h-10 rounded-full' />
						<Skeleton className='w-10 h-10 rounded-full' />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='h-[180px] w-full relative'>
			<VendorCover
				src={image || vendor?.coverImage}
				imageClassName='w-full h-full object-cover'
				className='w-full h-full'
				alt={vendor?.name || 'Vendor'}
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
