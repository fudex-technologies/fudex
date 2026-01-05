'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import Link from 'next/link';

const GoToCartBottom = ({ vendorId }: { vendorId: string }) => {
	const { isVendorCartEmpty } = useCartStore();

	if (isVendorCartEmpty(vendorId)) return null;
	return (
		<>
			<div className='mb-[110px]' />
			<div className='fixed bottom-0 left-0 w-screen bg-background border-t border-t-[#85858540] h-[100px] text-[#858585] px-5 flex justify-center'>
				<div className='w-full h-full flex items-center justify-between max-w-[1400px]'>
					<div className=''>
						<p className='text-sm text-foreground/50'>Total</p>
						<p className='text-xl font-semibold text-foreground'>
							{/* {formatCurency(totalPrice)} */}
						</p>
					</div>
					<Link
						href={PAGES_DATA.tray_page}
						className={cn(
							buttonVariants({
								variant: 'game',
								size: 'lg',
								// disabled: isEmpty,
							})
						)}>
						Go to tray
					</Link>
				</div>
			</div>
		</>
	);
};

export default GoToCartBottom;
