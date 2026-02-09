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
	isPreorder?: boolean;
}

const PackageCartBottomBar = ({
	packageSlug,
	packageItemsData = [],
	isPreorder = false,
}: PackageCartBottomBarProps) => {
	const router = useRouter();
	const { items, getTotalItems, isEmpty } = usePackageCartStore();

	// Calculate total amount
	const totalAmount = useMemo(() => {
		return items.reduce((sum, cartItem) => {
			const packageItem = packageItemsData.find(
				(item) => item.id === cartItem.packageItemId
			);
			if (packageItem) {
				return sum + packageItem.price * cartItem.quantity;
			}
			return sum;
		}, 0);
	}, [items, packageItemsData]);

	const totalItems = getTotalItems();

	// Don't render if cart is empty
	if (isEmpty()) {
		return null;
	}

	const handleCheckout = () => {
		// Navigate to recipient details page
		router.push(`/packages/${packageSlug}/recipient-details`);
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
						className='min-w-[180px]'>
						{isPreorder ? 'Pre-order' : 'Order Now'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default PackageCartBottomBar;
