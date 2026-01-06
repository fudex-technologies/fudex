'use client';

import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { buttonVariants } from '@/components/ui/button';
import { PAGES_DATA } from '@/data/pagesData';
import { formatCurency } from '@/lib/commonFunctions';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import Link from 'next/link';
import { useMemo } from 'react';

const GoToCartBottom = ({ vendorId }: { vendorId: string }) => {
	const { getVendorPacks, isVendorCartEmpty } = useCartStore();
	const packs = getVendorPacks(vendorId);

	// Collect all product item IDs needed for price calculation
	const allProductItemIds = useMemo(() => {
		const mainIds = packs.map((p) => p.productItemId);
		const addonIds = packs.flatMap(
			(p) => p.addons?.map((a) => a.addonProductItemId) || []
		);
		return Array.from(new Set([...mainIds, ...addonIds]));
	}, [packs]);

	// Fetch all product items for price calculation
	const productItemsQueryResult =
		useVendorProductActions().useGetProductItemsByIds({
			ids: allProductItemIds,
		});
	const { data: productItems = [] } = productItemsQueryResult;

	// Create a map for quick lookup
	const productItemsMap = useMemo(() => {
		const map = new Map();
		productItems.forEach((item) => {
			map.set(item.id, item);
		});
		return map;
	}, [productItems]);

	// Calculate total price from packs
	const totalPrice = useMemo(() => {
		if (productItems.length === 0) return 0;

		let total = 0;

		for (const pack of packs) {
			const mainItem = productItemsMap.get(pack.productItemId);
			if (!mainItem) continue;

			// Main item price * quantity
			const packPrice = mainItem.price * pack.quantity;
			total += packPrice;

			// Add addon prices
			if (pack.addons) {
				for (const addon of pack.addons) {
					const addonItem = productItemsMap.get(
						addon.addonProductItemId
					);
					if (addonItem) {
						total +=
							addonItem.price * addon.quantity * pack.quantity;
					}
				}
			}
		}

		return total;
	}, [packs, productItemsMap]);

	if (isVendorCartEmpty(vendorId)) return null;
	return (
		<>
			<div className='mb-[110px]' />
			<div className='fixed bottom-0 left-0 w-screen bg-background border-t border-t-[#85858540] h-[100px] text-[#858585] px-5 flex justify-center'>
				<div className='w-full h-full flex items-center justify-between max-w-[1400px]'>
					<div className=''>
						<p className='text-sm text-foreground/50'>Total</p>
						<p className='text-xl font-semibold text-foreground'>
							{formatCurency(totalPrice)}
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
