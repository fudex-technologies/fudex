'use client';

import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { PAGES_DATA } from '@/data/pagesData';
import { useCartStore } from '@/store/cart-store';
import { useRouter } from 'next/navigation';
import TrayListItem from './TrayListItem';

export default function TrayPage() {
	const router = useRouter();
	const { vendors, isCartEmpty } = useCartStore();

	return (
		<div className='w-full flex justify-center'>
			{/* Empty state */}
			{isCartEmpty() && (
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
			{!isCartEmpty() && (
				<div className='w-full'>
					{Object.keys(vendors).map((vendor) => (
						<TrayListItem key={vendor} vendorId={vendor} />
					))}
				</div>
			)}
		</div>
	);
}
