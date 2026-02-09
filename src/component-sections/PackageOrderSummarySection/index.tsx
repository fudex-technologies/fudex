'use client';

import React, { useMemo } from 'react';
import { usePackageActions } from '@/api-hooks/usePackageActions';
import { usePackageCartStore } from '@/store/package-cart-store';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import { Button } from '@/components/ui/button';
import { formatCurency } from '@/lib/commonFunctions';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Trash2, Plus } from 'lucide-react';
import GoBackButton from '@/components/GoBackButton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import CounterComponent from '@/components/CounterComponent';

const PackageOrderSummarySection = ({
	packageSlug,
}: {
	packageSlug: string;
}) => {
	const router = useRouter();
	const { useGetPackageBySlug } = usePackageActions();
	const { data: packageData, isLoading } = useGetPackageBySlug({
		slug: packageSlug,
	});

	const {
		items: cartItems,
		updateItem,
		removeItem,
		getTotalItems,
		packageId,
	} = usePackageCartStore();

	// Get all package item IDs
	const packageItemIds = useMemo(
		() => cartItems.map((item) => item.packageItemId),
		[cartItems],
	);

	// Fetch package items
	const packageItemsMap = useMemo(() => {
		if (!packageData?.categories) return new Map();

		const map = new Map();
		packageData.categories.forEach((category) => {
			category.items?.forEach((item) => {
				map.set(item.id, { ...item, categoryName: category.name });
			});
		});
		return map;
	}, [packageData]);

	// Calculate total price
	const totalPrice = useMemo(() => {
		let total = 0;
		cartItems.forEach((cartItem) => {
			const packageItem = packageItemsMap.get(cartItem.packageItemId);
			if (packageItem) {
				total += packageItem.price * cartItem.quantity;
			}
		});
		return total;
	}, [cartItems, packageItemsMap]);

	const handleQuantityChange = (itemId: string, newQuantity: number) => {
		if (newQuantity === 0) {
			removeItem(itemId);
		} else {
			updateItem(itemId, newQuantity);
		}
	};

	if (isLoading) {
		return (
			<div className='w-full p-5 space-y-5'>
				<Skeleton className='h-10 w-48' />
				<div className='space-y-4'>
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className='h-32 w-full' />
					))}
				</div>
			</div>
		);
	}

	if (cartItems.length === 0) {
		return (
			<div className='w-full max-w-md p-5 flex flex-col gap-5 items-center justify-center my-20 mx-auto'>
				<ImageWithFallback
					src={'/assets/empty-tray.png'}
					className='w-full'
				/>
				<div className='text-center'>
					<h1 className='font-bold text-xl'>Your cart is empty</h1>
					<p className='text-sm font-light'>
						Add some items to get started.
					</p>
				</div>
				<Button
					variant={'game'}
					size={'lg'}
					className='w-full mt-10 py-5'
					onClick={() =>
						router.push(PAGES_DATA.package_page(packageSlug))
					}>
					Browse Packages
				</Button>
			</div>
		);
	}

	return (
		<div className='w-full pb-24'>
			{/* Header */}
			<div className='w-full px-5 py-4 flex items-center justify-between border-b'>
				<div className='flex items-center gap-3'>
					<GoBackButton />
					<div>
						<h1 className='text-xl font-semibold'>Order Summary</h1>
						<p className='text-sm text-foreground/60'>
							{getTotalItems()} item
							{getTotalItems() !== 1 ? 's' : ''} selected
						</p>
					</div>
				</div>
			</div>

			{/* Items List */}
			<div className='w-full p-5 space-y-4'>
				{cartItems.map((cartItem) => {
					const packageItem = packageItemsMap.get(
						cartItem.packageItemId,
					);
					if (!packageItem) return null;

					return (
						<div
							key={cartItem.id}
							className='flex gap-4 p-4 border rounded-lg'>
							{/* Image */}
							<div className='relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0'>
								<ImageWithFallback
									src={
										packageItem.images &&
										packageItem.images.length > 0
											? packageItem.images[0]
											: '/assets/empty-tray.png'
									}
									alt={packageItem.name}
									className='object-cover w-full h-full'
								/>
							</div>

							{/* Details */}
							<div className='flex-1 flex flex-col justify-between'>
								<div>
									<h3 className='font-medium'>
										{packageItem.name}
									</h3>
									{packageItem.description && (
										<p className='text-sm text-foreground/60 line-clamp-2'>
											{packageItem.description}
										</p>
									)}
									<p className='text-sm font-medium mt-1'>
										{formatCurency(packageItem.price)} each
									</p>
								</div>

								{/* Quantity Controls */}
								<div className='flex items-center justify-between mt-2'>
									<CounterComponent
										count={cartItem.quantity}
										countChangeEffect={(newCount) =>
											handleQuantityChange(
												cartItem.id,
												newCount,
											)
										}
										min={0}
										className='max-w-[120px]'
									/>
									<div className='flex items-center gap-4'>
										<p className='font-semibold'>
											{formatCurency(
												packageItem.price *
													cartItem.quantity,
											)}
										</p>
										<Button
											variant='ghost'
											size='icon'
											onClick={() =>
												removeItem(cartItem.id)
											}
											className='text-destructive hover:text-destructive'>
											<Trash2 className='h-4 w-4' />
										</Button>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Add More Items */}
			<div className='w-full flex justify-end p-5'>
				<Link
					className={cn(
						buttonVariants({
							className: 'bg-primary/10 text-primary',
						}),
					)}
					href={PAGES_DATA.package_page(packageSlug)}>
					<Plus className='mr-2 h-4 w-4' />
					Add more items
				</Link>
			</div>

			{/* Bottom Summary */}
			<div className='fixed bottom-0 left-0 w-screen bg-background border-t border-t-[#85858540] h-[100px] px-5 flex justify-center z-50'>
				<div className='w-full h-full flex items-center justify-between max-w-[1400px]'>
					<div>
						<p className='text-sm text-foreground/50'>Total</p>
						<p className='text-xl font-semibold text-foreground'>
							{formatCurency(totalPrice)}
						</p>
					</div>
					<Button
						variant={'game'}
						size={'lg'}
						onClick={() => {
							router.push(
								PAGES_DATA.package_checkout_recipient_page(
									packageSlug,
								),
							);
						}}>
						Proceed to checkout
					</Button>
				</div>
			</div>
		</div>
	);
};

export default PackageOrderSummarySection;
