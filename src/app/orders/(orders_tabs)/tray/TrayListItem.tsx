'use client';

import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { buttonVariants } from '@/components/ui/button';
import VendorCover from '@/components/VendorCover';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import Link from 'next/link';

const TrayListItem = ({ vendorId }: { vendorId: string }) => {
	const { getVendorPackCount } = useCartStore();
	const { data: vendor } = useVendorProductActions().useGetVendorById(
		vendorId ? { id: vendorId } : { id: '' }
	);

	return (
		<div className='p-5 border-b border-foreground/50 space-y-4'>
			<div className='w-full flex gap-2'>
				{vendor && (
					<div className='relative w-[80px] h-[80px]'>
						<VendorCover
							src={vendor.coverImage}
							className='w-full h-full rounded-md'
							imageClassName='object-cover rounded-md'
							alt={vendor.name}
						/>
					</div>
				)}
				<div className='flex-1 flex flex-col gap-2'>
					<div className='w-full flex flex-wrap gap-1 justify-between'>
						<h3 className='text-lg font-normal'>
							{vendor?.name || 'Vendor'}
						</h3>
					</div>
					<div className='w-full font-light flex flex-row gap-2'>
						<p>
							{getVendorPackCount(vendorId)} pack
							{getVendorPackCount(vendorId) > 1 ? 's' : ''}
						</p>
					</div>
				</div>
			</div>
			<Link
				href={PAGES_DATA.order_summary_page(vendorId)}
				className={cn(
					buttonVariants({
						variant: 'game',
						size: 'lg',
						className: 'w-full py-5',
					})
				)}>
				View Order Summary
			</Link>
		</div>
	);
};

export default TrayListItem;
