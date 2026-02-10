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
import { Trash2, Plus, Info } from 'lucide-react';
import GoBackButton from '@/components/GoBackButton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import CounterComponent from '@/components/CounterComponent';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
		addons: cartAddons,
		updateItem,
		removeItem,
		updateAddon,
		removeAddon,
		addAddon,
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

	// Create addons map
	const addonsMap = useMemo(() => {
		if (!packageData?.addons) return new Map();
		const map = new Map();
		packageData.addons.forEach((addon) => {
			map.set(addon.productItemId, addon.productItem);
		});
		return map;
	}, [packageData]);

	// Calculate total price
	const totalPrice = useMemo(() => {
		let total = 0;
		// Add package items total
		cartItems.forEach((cartItem) => {
			const packageItem = packageItemsMap.get(cartItem.packageItemId);
			if (packageItem) {
				total += packageItem.price * cartItem.quantity;
			}
		});
		// Add addons total
		cartAddons.forEach((cartAddon) => {
			const addon = addonsMap.get(cartAddon.productItemId);
			if (addon) {
				total += addon.price * cartAddon.quantity;
			}
		});
		return total;
	}, [cartItems, packageItemsMap, cartAddons, addonsMap]);

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
					className='w-full mt-10 py-5 bg-[#FF305A]'
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
										className='max-w-[120px] py-1'
									/>
									<div className='flex items-center gap-4'>
										<p className='font-semibold'>
											{formatCurency(
												packageItem.price *
													cartItem.quantity,
											)}
										</p>
										{/* <Button
											variant='ghost'
											size='icon'
											onClick={() =>
												removeItem(cartItem.id)
											}
											className='text-destructive hover:text-destructive'>
											<Trash2 className='h-4 w-4' />
										</Button> */}
									</div>
								</div>
							</div>
						</div>
					);
				})}

				{/* Addons Section */}
				{cartAddons.length > 0 && (
					<>
						<h2 className='text-sm font-semibold text-muted-foreground mt-6 mb-2'>
							Extra meal
						</h2>
						{cartAddons.map((cartAddon) => {
							const addon = addonsMap.get(
								cartAddon.productItemId,
							);
							if (!addon) return null;

							return (
								<div
									key={cartAddon.id}
									className='flex gap-4 p-4 border rounded-lg border-dashed'>
									{/* Image */}
									<div className='relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0'>
										<ImageWithFallback
											src={
												addon.images?.[0] ||
												'/assets/empty-tray.png'
											}
											alt={addon.product?.name || 'addon'}
											className='object-cover w-full h-full'
										/>
									</div>

									{/* Details */}
									<div className='flex-1 flex flex-col justify-between'>
										<div>
											<div className='flex items-center gap-2'>
												<h3 className='font-medium'>
													{addon.product?.name ||
														addon.name}
												</h3>
												<span className='text-xs px-2 py-0.5 bg-[#FF305A]/10 text-[#FF305A] rounded-full'>
													Extra
												</span>
											</div>
											{addon.product?.vendor && (
												<p className='text-xs text-foreground/60 mt-0.5'>
													by{' '}
													{addon.product.vendor.name}
												</p>
											)}
											<p className='text-sm font-medium mt-1'>
												{formatCurency(addon.price)}{' '}
												each
											</p>
										</div>

										{/* Quantity Controls */}
										<div className='flex items-center justify-between mt-2'>
											<CounterComponent
												count={cartAddon.quantity}
												countChangeEffect={(
													newCount,
												) => {
													if (newCount === 0) {
														removeAddon(
															cartAddon.id,
														);
													} else {
														updateAddon(
															cartAddon.id,
															newCount,
														);
													}
												}}
												min={0}
												className='max-w-[120px] py-1'
											/>
											<div className='flex items-center gap-4'>
												<p className='font-semibold'>
													{formatCurency(
														addon.price *
															cartAddon.quantity,
													)}
												</p>
												{/* <Button
													variant='ghost'
													size='icon'
													onClick={() =>
														removeAddon(
															cartAddon.id,
														)
													}
													className='text-destructive hover:text-destructive'>
													<Trash2 className='h-4 w-4' />
												</Button> */}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</>
				)}
			</div>

			{/* Available Addons Section */}
			{packageData?.addons && packageData.addons.length > 0 && (
				<div className='w-full px-5 pt-6 pb-4'>
					<div className='mb-4'>
						<h2 className='text-lg font-semibold mb-1'>
							Add Extra Meal
						</h2>
						<p className='text-sm text-muted-foreground'>
							Enhance your package with these curated additions
						</p>
					</div>

					<div className='grid grid-cols-1 gap-3'>
						{packageData.addons
							.filter(
								(addon) => addon.isActive && addon.productItem,
							)
							.map((addon) => {
								const productItem = addon.productItem;
								const product = productItem.product;
								const cartAddon = cartAddons.find(
									(ca) =>
										ca.productItemId ===
										addon.productItemId,
								);
								const quantity = cartAddon?.quantity || 0;

								return (
									<div
										key={addon.id}
										className={`border rounded-lg p-3 flex gap-3 transition-all ${
											quantity > 0
												? 'border-[#FF305A] bg-[#FF305A]/5 ring-1 ring-[#FF305A]'
												: 'bg-card hover:border-[#FF305A]/50'
										}`}>
										<div className='relative w-20 h-20 rounded-md overflow-hidden shrink-0 bg-muted'>
											<ImageWithFallback
												src={
													productItem.images?.[0] ||
													'/assets/empty-tray.png'
												}
												alt={product?.name || 'addon'}
												className='object-cover w-full h-full'
											/>
										</div>

										<div className='flex-1 flex flex-col justify-between min-w-0'>
											<div>
												<div className='flex items-center gap-2'>
													<h4 className='font-medium text-sm truncate'>
														{product?.name ||
															productItem.name}
													</h4>
													{productItem.description && (
														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger
																	asChild>
																	<Info className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
																</TooltipTrigger>
																<TooltipContent className='max-w-[200px] text-xs'>
																	{
																		productItem.description
																	}
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													)}
												</div>
												<p className='text-xs text-muted-foreground truncate'>
													from {product?.vendor.name}
												</p>
												<p className='font-bold text-[#FF305A] text-sm mt-1'>
													{formatCurency(
														productItem.price,
													)}
												</p>
											</div>

											<div className='flex items-center justify-end mt-2'>
												{quantity === 0 ? (
													<Button
														variant='outline'
														size='sm'
														className='h-7 text-xs rounded-full hover:bg-[#FF305A] hover:text-[#FF305A]-foreground border-[#FF305A]/20 text-[#FF305A]'
														onClick={() =>
															addAddon(
																addon.productItemId,
																1,
															)
														}>
														<Plus className='w-3 h-3 mr-1' />{' '}
														Add
													</Button>
												) : (
													<CounterComponent
														count={quantity}
														countChangeEffect={(
															newCount,
														) => {
															if (
																newCount === 0
															) {
																removeAddon(
																	cartAddon!
																		.id,
																);
															} else {
																updateAddon(
																	cartAddon!
																		.id,
																	newCount,
																);
															}
														}}
														min={0}
														className='max-w-[110px] h-7'
													/>
												)}
											</div>
										</div>
									</div>
								);
							})}
					</div>
				</div>
			)}

			{/* Add More Items */}
			<div className='w-full flex justify-end p-5'>
				<Link
					className={cn(
						buttonVariants({
							className: 'bg-[#FF305A]/10 text-[#FF305A]',
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
						}}
						className={'bg-[#FF305A]'}>
						Proceed to checkout
					</Button>
				</div>
			</div>
		</div>
	);
};

export default PackageOrderSummarySection;
