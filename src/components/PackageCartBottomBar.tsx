'use client';

import React, { useMemo } from 'react';
import { usePackageCartStore } from '@/store/package-cart-store';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { formatCurency } from '@/lib/commonFunctions';

interface PackageCartBottomBarProps {
	packageSlug: string;
	packageItemsData?: Array<{
		id: string;
		name: string;
		price: number;
	}>;
	addonsData?: Array<{
		productItemId: string;
		name: string;
		price: number;
	}>;
	isPreorder?: boolean;
}

const PackageCartBottomBar = ({
	packageSlug,
	packageItemsData = [],
	addonsData = [],
	isPreorder = false,
}: PackageCartBottomBarProps) => {
	const router = useRouter();
	const { items, addons, getTotalItems, isEmpty } = usePackageCartStore();

	// Calculate total amount
	const totalAmount = useMemo(() => {
		let total = 0;

		// Add package items total
		items.forEach((cartItem) => {
			const packageItem = packageItemsData.find(
				(item) => item.id === cartItem.packageItemId,
			);
			if (packageItem) {
				total += packageItem.price * cartItem.quantity;
			}
		});

		// Add addons total
		addons.forEach((cartAddon) => {
			const addonItem = addonsData.find(
				(item) => item.productItemId === cartAddon.productItemId,
			);
			if (addonItem) {
				total += addonItem.price * cartAddon.quantity;
			}
		});

		return total;
	}, [items, addons, packageItemsData, addonsData]);

	const totalItems = getTotalItems();

	// Don't render if cart is empty
	if (isEmpty()) {
		return null;
	}

	const handleCheckout = () => {
		router.push(`/packages/${packageSlug}/order-summary`);
	};

	return (
		<div className='fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50 safe-area-inset-bottom'>
			<div className='max-w-[1400px] mx-auto px-5 py-4'>
				<div className='flex items-center justify-between gap-4'>
					{/* Total amount and items count */}
					<div className='flex flex-col'>
						<p className='text-lg font-semibold text-foreground'>
							{formatCurency(totalAmount)}
						</p>
						<p className='text-sm text-muted-foreground'>
							{totalItems} {totalItems === 1 ? 'item' : 'items'}
						</p>
					</div>

					{/* Checkout button */}
					<Button
						onClick={handleCheckout}
						size='lg'
						className='min-w-[180px] bg-[#FF305A]'>
						{isPreorder ? 'Pre-order' : 'Order Now'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default PackageCartBottomBar;
