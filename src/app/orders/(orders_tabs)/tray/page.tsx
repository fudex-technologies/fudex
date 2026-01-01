'use client';

import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { PAGES_DATA } from '@/data/pagesData';
import { useCartStore } from '@/store/cart-store';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function TrayPage() {
	const router = useRouter();
	const { packs, vendorId, getTotalPacks } = useCartStore();
	const isEmpty = packs.length === 0;

	const { data: vendor } = useVendorProductActions().useGetVendorById(
		vendorId ? { id: vendorId } : { id: '' }
	);

	return (
		<div className='w-full flex justify-center'>
			{/* Empty state */}
			{isEmpty && (
				<div className='w-full max-w-md p-5 flex flex-col gap-5 items-center justify-center my-20'>
					<ImageWithFallback
						src={'/assets/empty-tray.png'}
						className='w-full'
					/>
					<div className='text-center'>
						<h1 className='font-bold text-xl'>
							Your tray is empty
						</h1>
						<p className='text-sm font-light'>
							Add some meals to get started.
						</p>
					</div>
					<Button
						variant={'game'}
						size={'lg'}
						className='w-full mt-10 py-5'
						onClick={() => router.push(PAGES_DATA.home_page)}>
						Browse vendors
					</Button>
				</div>
			)}

			{/* With data state */}
			{!isEmpty && (
				<div className='w-full'>
					<div className='p-5 border-b border-foreground/50 space-y-2'>
						<div className='w-full flex gap-2'>
							{vendor?.coverImage && (
								<ImageWithFallback
									width={80}
									height={80}
									src={vendor.coverImage}
									className='object-cover rounded-md'
								/>
							)}
							<div className='flex-1 flex flex-col gap-2'>
								<div className='w-full flex flex-wrap gap-1 justify-between'>
									<h3 className='text-lg font-normal'>
										{vendor?.name || 'Vendor'}
									</h3>
								</div>
								<div className='w-full font-light flex flex-row gap-2'>
									<p>
										{getTotalPacks()} pack
										{getTotalPacks() > 1 ? 's' : ''}
									</p>
								</div>
							</div>
						</div>
						<Link
							href={PAGES_DATA.order_summary_page('temp')}
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
				</div>
			)}
		</div>
	);
}
