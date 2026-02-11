'use client';

import React from 'react';
import { usePackageActions } from '@/api-hooks/usePackageActions';
import { Skeleton } from '@/components/ui/skeleton';
import PackageCard from '@/component-sections/PackagesCategoriesSection/PackageCard';
import { usePackageCartStore } from '@/store/package-cart-store';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import GoBackButton from '@/components/GoBackButton';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { formatCurency } from '@/lib/commonFunctions';
import { useMemo } from 'react';

interface PackageCategorySectionProps {
	packageSlug: string;
	categorySlug: string;
}

const PackageCategorySection: React.FC<PackageCategorySectionProps> = ({
	packageSlug,
	categorySlug,
}) => {
	const router = useRouter();
	const { useGetPackageCategory } = usePackageActions();
	const { data, isLoading } = useGetPackageCategory({
		packageSlug,
		categorySlug,
	});

	const { items, addItem, updateItem, getItem, getTotalItems } =
		usePackageCartStore();

	// Set package ID when component mounts
	React.useEffect(() => {
		if (data?.package?.id) {
			usePackageCartStore.getState().setPackage(data.package.id);
		}
	}, [data?.package?.id]);

	const handleQuantityChange = (packageItemId: string, quantity: number) => {
		if (quantity === 0) {
			const item = getItem(packageItemId);
			if (item) {
				usePackageCartStore.getState().removeItem(item.id);
			}
		} else {
			const item = getItem(packageItemId);
			if (item) {
				updateItem(item.id, quantity);
			} else {
				addItem(packageItemId, quantity);
			}
		}
	};

	// Calculate total price
	const totalPrice = useMemo(() => {
		if (!data?.category?.items) return 0;

		return data.category.items.reduce((sum, item) => {
			const cartItem = getItem(item.id);
			if (cartItem) {
				return sum + item.price * cartItem.quantity;
			}
			return sum;
		}, 0);
	}, [data?.category?.items, items]);

	if (isLoading) {
		return (
			<div className='w-full p-5 space-y-5'>
				<Skeleton className='h-10 w-48' />
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<Skeleton
							key={i}
							className='aspect-square rounded-lg'
						/>
					))}
				</div>
			</div>
		);
	}

	if (!data || !data.category) {
		return (
			<div className='w-full p-5 text-center text-foreground/50'>
				Category not found
			</div>
		);
	}

	const packageItems = data.category.items || [];
	const hasItems = items.length > 0;

	return (
		<div className='w-full pb-24'>
			{/* Header */}
			<div className='w-full px-5 py-4 flex items-center justify-between border-b'>
				<div className='flex items-center gap-3'>
					<GoBackButton />
					<div>
						<h1 className='text-xl font-semibold'>
							{data.category.name}
						</h1>
						{data.category.description && (
							<p className='text-sm text-foreground/60'>
								{data.category.description}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Items Grid */}
			{packageItems.length > 0 ? (
				<div className='w-full p-5'>
					<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
						{packageItems.map((item) => {
							const cartItem = getItem(item.id);
							const quantity = cartItem?.quantity || 0;

							return (
								<div key={item.id} className='w-full'>
									<PackageCard
										singlePackage={{
											id: item.id,
											name: item.name,
											description: item.description || '',
											price: item.price,
											imageUrl:
												item.images &&
												item.images.length > 0
													? item.images[0]
													: '/assets/empty-tray.png',
										}}
										initialQuantity={quantity}
										onQuantityChange={(
											itemId,
											newQuantity,
										) =>
											handleQuantityChange(
												itemId,
												newQuantity,
											)
										}
									/>
								</div>
							);
						})}
					</div>
				</div>
			) : (
				<div className='w-full p-5 text-center text-foreground/50'>
					No items available in this category
				</div>
			)}

			{/* Bottom Cart Summary */}
			{hasItems && (
				<div className='fixed bottom-0 left-0 w-screen bg-background border-t border-t-[#85858540] h-[100px] px-5 flex justify-center z-50'>
					<div className='w-full h-full flex items-center justify-between max-w-[1400px]'>
						<div>
							<p className='text-sm text-foreground/50'>
								{getTotalItems()} item
								{getTotalItems() !== 1 ? 's' : ''} selected
							</p>
							<p className='text-xl font-semibold text-foreground'>
								{formatCurency(totalPrice)}
							</p>
						</div>
						<Button
							variant={'game'}
							size={'lg'}
							onClick={() => {
								router.push(
									PAGES_DATA.package_order_summary_page(
										packageSlug,
									),
								);
							}}
							className='bg-[#FF305A]'
							>
							<ShoppingCart className='mr-2 h-4 w-4' />
							View Cart
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default PackageCategorySection;
