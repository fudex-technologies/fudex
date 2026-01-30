'use client';

import OrderSummaryItem from '@/components/order-components/OrderSummaryItem';
import { Button, buttonVariants } from '@/components/ui/button';
import { PAGES_DATA } from '@/data/pagesData';
import { formatCurency } from '@/lib/commonFunctions';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart-store';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

const OrderSummaryDetailsSection = ({ vendorId }: { vendorId: string }) => {
	const router = useRouter();
	const { getVendorPacks, clearVendor, removePack, updatePack } =
		useCartStore();
	const packs = getVendorPacks(vendorId);

	// Fetch vendor info
	const vendorQueryResult = useVendorProductActions().useGetVendorById({
		id: vendorId || '',
	});
	const { data: vendor } = vendorQueryResult;

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

			// Main item price * quantity (this handles both FIXED and PER_UNIT correctly)
			const packPrice = mainItem.price * pack.quantity;
			total += packPrice;

			// Add addon prices - DO NOT multiply by pack.quantity
			if (pack.addons) {
				for (const addon of pack.addons) {
					const addonItem = productItemsMap.get(
						addon.addonProductItemId
					);
					if (addonItem) {
						// Addons are per pack, not per unit
						total += addonItem.price * addon.quantity;
					}
				}
			}
		}

		return total;
	}, [packs, productItemsMap]);

	const isEmpty = packs.length === 0;

	if (isEmpty) {
		return (
			<div className='w-full max-w-md p-5 flex flex-col gap-5 items-center justify-center my-20 mx-auto'>
				<ImageWithFallback
					src={'/assets/empty-tray.png'}
					className='w-full'
				/>
				<div className='text-center'>
					<h1 className='font-bold text-xl'>Your tray is empty</h1>
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
		);
	}

	return (
		<>
			<div className='w-full'>
				<div className='w-full px-5 flex items-center justify-between'>
					<p>
						{packs.length} pack{packs.length > 1 ? 's' : ''} from{' '}
						<span className='text-primary'>
							{vendor?.name || 'Vendor'}
						</span>
					</p>
					<Button
						variant={'link'}
						className='text-destructive'
						onClick={() => clearVendor(vendorId)}>
						Clear Order
					</Button>
				</div>

				<div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
					{packs.map((pack, index) => (
						<OrderSummaryItem
							key={pack.id}
							index={index + 1}
							pack={pack}
							onRemove={() => removePack(vendorId, pack.id)}
							onUpdate={(updates) =>
								updatePack(vendorId, pack.id, updates)
							}
						/>
					))}
				</div>
			</div>
			<div className='w-full flex justify-end p-5'>
				<Link
					className={cn(
						buttonVariants({
							className: 'bg-primary/10 text-primary',
						})
					)}
					href={
						vendorId
							? PAGES_DATA.single_vendor_page(vendorId)
							: PAGES_DATA.home_page
					}>
					<Plus />
					Add more items
				</Link>
			</div>

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
						<Button
							variant={'game'}
							size={'lg'}
							onClick={() => {
								router.push(PAGES_DATA.checkout_page(vendorId));
							}}>
							Proceed to checkout
						</Button>
					</div>
				</div>
			</>
		</>
	);
};

export default OrderSummaryDetailsSection;
