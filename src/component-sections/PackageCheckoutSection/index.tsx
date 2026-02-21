'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { PAGES_DATA } from '@/data/pagesData';
import { usePackageCheckoutStore } from '@/store/package-checkout-store';
import { usePackageCartStore } from '@/store/package-cart-store';
import { usePackageActions } from '@/api-hooks/usePackageActions';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { Button } from '@/components/ui/button';
import GoBackButton from '@/components/GoBackButton';
import { formatCurency } from '@/lib/commonFunctions';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useTRPC } from '@/trpc/client';
import WalletPaymentSelection from '@/components/Checkout/WalletPaymentSelection';
import { useState } from 'react';

const PackageCheckoutSection = ({ packageSlug }: { packageSlug: string }) => {
	const router = useRouter();
	const { data: session } = useSession();
	const checkoutStore = usePackageCheckoutStore();
	const {
		items: cartItems,
		addons: cartAddons,
		packageId,
		clearCart,
	} = usePackageCartStore();
	const { useGetPackageBySlug, createPackageOrder, createPackagePayment } =
		usePackageActions();
	const trpc = useTRPC();
	const [walletAmount, setWalletAmount] = useState(0);

	const { usePublicPlatformSettings } = useVendorProductActions();
	const { data: platformSettings, isLoading: isLoadingSettings } =
		usePublicPlatformSettings();

	const { data: packageData, isLoading: isLoadingPackage } =
		useGetPackageBySlug({
			slug: packageSlug,
		});

	// Get package items map
	const packageItemsMap = useMemo(() => {
		if (!packageData?.categories) return new Map();

		const map = new Map();
		packageData.categories.forEach((category) => {
			category.items?.forEach((item) => {
				map.set(item.id, item);
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

	// Calculate totals
	const productAmount = useMemo(() => {
		let total = 0;
		// Package items
		cartItems.forEach((cartItem) => {
			const packageItem = packageItemsMap.get(cartItem.packageItemId);
			if (packageItem) {
				total += packageItem.price * cartItem.quantity;
			}
		});
		// Addons
		cartAddons.forEach((cartAddon) => {
			const addon = addonsMap.get(cartAddon.productItemId);
			if (addon) {
				total += addon.price * cartAddon.quantity;
			}
		});
		return total;
	}, [cartItems, packageItemsMap, cartAddons, addonsMap]);

	// Calculate delivery fee from platform settings
	const deliveryFee = useMemo(() => {
		if (!platformSettings) return 1000; // Fallback
		const baseDeliveryFee =
			((platformSettings as any)?.BASE_DELIVERY_FEE as number) ?? 1000;
		return baseDeliveryFee;
	}, [platformSettings]);

	// Calculate service fee from platform settings
	const serviceFee = useMemo(() => {
		if (!platformSettings) return 0;
		const systemServiceFee = (platformSettings as any)?.SERVICE_FEE;

		if (!systemServiceFee) return 0;
		return systemServiceFee;
	}, [productAmount, platformSettings]);

	const subTotalWithFees = productAmount + deliveryFee + serviceFee;
	const totalAmount = Math.max(0, subTotalWithFees - walletAmount);

	// Create order mutation
	const createOrderMutation = createPackageOrder({
		onSuccess: async (order: any) => {
			// Create payment after order is created
			const baseUrl =
				typeof window !== 'undefined'
					? window.location.origin
					: process.env.NEXT_PUBLIC_BASE_URL || '';
			const callbackUrl = `${baseUrl}/packages/orders/${order.id}/payment-callback`;

			createPaymentMutation.mutate({
				packageOrderId: order.id,
				callbackUrl,
				// walletAmount,
			});
		},
		onError: (err) => {
			toast.error('Failed to create order', {
				description:
					err instanceof Error ? err.message : 'Unknown error',
			});
		},
		silent: false,
	});

	// Create payment mutation
	const createPaymentMutation = createPackagePayment({
		onSuccess: (data: any) => {
			// Redirect to Paystack checkout or directly to callback for wallet-only
			if (data.checkoutUrl) {
				// Clear cart and checkout state before redirecting
				clearCart();
				checkoutStore.clearCheckout();
				// Redirect to Paystack checkout page
				window.location.href = data.checkoutUrl;
			} else if (data.reference) {
				// Wallet ONLY payment (no Paystack checkoutUrl)
				clearCart();
				checkoutStore.clearCheckout();
				// Redirect to internal callback to verify and show success
				const baseUrl =
					typeof window !== 'undefined'
						? window.location.origin
						: process.env.NEXT_PUBLIC_BASE_URL || '';
				window.location.href = `${baseUrl}/packages/orders/${data.payment.packageOrderId}/payment-callback?reference=${data.reference}`;
			} else {
				toast.error(
					'Payment initialization failed - no checkout URL received',
				);
			}
		},
		onError: (err) => {
			toast.error('Failed to create payment', {
				description:
					err instanceof Error ? err.message : 'Unknown error',
			});
		},
		silent: false,
	});

	const handleCheckout = () => {
		// Check authentication
		if (!session) {
			toast.error('Please login to continue');
			router.push(PAGES_DATA.login_page);
			return;
		}

		// Check cart
		if (cartItems.length === 0) {
			toast.error('Your cart is empty');
			router.push(PAGES_DATA.package_page(packageSlug));
			return;
		}

		// Validate checkout details
		if (!checkoutStore.isCheckoutComplete()) {
			toast.error('Please complete all checkout steps');
			return;
		}

		// Validate package ID matches
		if (!packageId || !packageData || packageId !== packageData.id) {
			toast.error('Package mismatch. Please start over.');
			return;
		}

		// Prepare order items
		const orderItems = cartItems.map((cartItem) => ({
			packageItemId: cartItem.packageItemId,
			quantity: cartItem.quantity,
		}));

		// Prepare order addons
		const orderAddons = cartAddons.map((cartAddon) => ({
			productItemId: cartAddon.productItemId,
			quantity: cartAddon.quantity,
		}));

		// Create order
		createOrderMutation.mutate({
			packageId: packageData.id,
			items: orderItems,
			addons: orderAddons,
			recipientName: checkoutStore.recipientName,
			recipientPhone: checkoutStore.recipientPhone,
			recipientAddressLine1: checkoutStore.recipientAddressLine1,
			recipientAddressLine2:
				checkoutStore.recipientAddressLine2 || undefined,
			recipientCity: checkoutStore.recipientCity,
			recipientState: checkoutStore.recipientState || undefined,
			recipientAreaId: checkoutStore.recipientAreaId || undefined,
			recipientCustomArea: checkoutStore.recipientCustomArea || undefined,
			senderName: checkoutStore.senderName,
			deliveryDate: checkoutStore.deliveryDate!,
			timeSlot: checkoutStore.timeSlot!,
			cardType: checkoutStore.cardType!,
			customCardMessage: checkoutStore.customCardMessage || undefined,
			notes: checkoutStore.notes || undefined,
			walletAmount,
		});
	};

	if (isLoadingPackage || isLoadingSettings) {
		return (
			<div className='w-full p-5 space-y-5'>
				<Skeleton className='h-10 w-48' />
				<Skeleton className='h-64 w-full' />
			</div>
		);
	}

	if (cartItems.length === 0) {
		return (
			<div className='w-full p-5 text-center'>
				<p className='text-foreground/50'>Your cart is empty</p>
				<Button
					variant='outline'
					onClick={() =>
						router.push(PAGES_DATA.package_page(packageSlug))
					}
					className='mt-4'>
					Browse Packages
				</Button>
			</div>
		);
	}

	return (
		<div className='w-full pb-24'>
			{/* Header */}
			<div className='w-full px-5 py-4 flex items-center gap-3 border-b'>
				<GoBackButton />
				<h1 className='text-xl font-semibold'>Checkout</h1>
			</div>

			{/* Content */}
			<div className='w-full p-5 space-y-6'>
				{/* Order Items Summary */}
				<Accordion type='single' collapsible className='w-full'>
					<AccordionItem value='items'>
						<AccordionTrigger>
							Package Items ({cartItems.length})
						</AccordionTrigger>
						<AccordionContent>
							<div className='space-y-3 pt-2'>
								{cartItems.map((cartItem) => {
									const packageItem = packageItemsMap.get(
										cartItem.packageItemId,
									);
									if (!packageItem) return null;

									return (
										<div
											key={cartItem.id}
											className='flex gap-3 items-center'>
											<div className='relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0'>
												<ImageWithFallback
													src={
														packageItem.images &&
														packageItem.images
															.length > 0
															? packageItem
																	.images[0]
															: '/assets/empty-tray.png'
													}
													alt={packageItem.name}
													className='w-14 h-14 rounded-lg object-cover shrink-0'
												/>
											</div>
											<div className='flex-1'>
												<p className='font-medium text-sm'>
													{packageItem.name}
												</p>
												<p className='text-xs text-foreground/60'>
													Qty: {cartItem.quantity} ×{' '}
													{formatCurency(
														packageItem.price,
													)}
												</p>
											</div>
											<p className='font-semibold text-sm'>
												{formatCurency(
													packageItem.price *
														cartItem.quantity,
												)}
											</p>
										</div>
									);
								})}
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>

				{/* Recipient Details */}
				<Accordion type='single' collapsible className='w-full'>
					<AccordionItem value='recipient'>
						<AccordionTrigger>Recipient Details</AccordionTrigger>
						<AccordionContent>
							<div className='space-y-2 pt-2 text-sm'>
								<p>
									<strong>Sender:</strong>{' '}
									{checkoutStore.senderName}
								</p>
								<p>
									<strong>Recipient:</strong>{' '}
									{checkoutStore.recipientName}
								</p>
								<p>
									<strong>Phone:</strong>{' '}
									{checkoutStore.recipientPhone}
								</p>
								<p>
									<strong>Address:</strong>{' '}
									{checkoutStore.recipientAddressLine1}
									{checkoutStore.recipientAddressLine2 &&
										`, ${checkoutStore.recipientAddressLine2}`}
								</p>
								<p>
									<strong>City:</strong>{' '}
									{checkoutStore.recipientCity}
									{checkoutStore.recipientState &&
										`, ${checkoutStore.recipientState}`}
								</p>
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>

				{/* Delivery Details */}
				<Accordion type='single' collapsible className='w-full'>
					<AccordionItem value='delivery'>
						<AccordionTrigger>Delivery Details</AccordionTrigger>
						<AccordionContent>
							<div className='space-y-2 pt-2 text-sm'>
								{checkoutStore.deliveryDate && (
									<p>
										<strong>Date:</strong>{' '}
										{format(
											checkoutStore.deliveryDate,
											'EEEE, MMMM do, yyyy',
										)}
									</p>
								)}
								{checkoutStore.timeSlot && (
									<p>
										<strong>Time Slot:</strong>{' '}
										{checkoutStore.timeSlot}
									</p>
								)}
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>

				{/* Card Details */}
				<Accordion type='single' collapsible className='w-full'>
					<AccordionItem value='card'>
						<AccordionTrigger>Card Customization</AccordionTrigger>
						<AccordionContent>
							<div className='space-y-2 pt-2 text-sm'>
								<p>
									<strong>Type:</strong>{' '}
									{checkoutStore.cardType === 'ADMIN_CREATED'
										? 'Let us create a custom card for you'
										: 'Customized by you'}
								</p>
								{checkoutStore.cardType === 'CUSTOM' &&
									checkoutStore.customCardMessage && (
										<div className='mt-2 p-3 bg-muted rounded'>
											<p className='text-xs text-foreground/60 mb-1'>
												Your Message:
											</p>
											<p className='whitespace-pre-wrap'>
												{
													checkoutStore.customCardMessage
												}
											</p>
										</div>
									)}
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>

				{/* Wallet Payment Selection */}
				<div className='pt-2'>
					<WalletPaymentSelection
						onWalletAmountChange={setWalletAmount}
						walletAmount={walletAmount}
						totalAmount={productAmount + deliveryFee + serviceFee}
					/>
				</div>

				{/* Fees Breakdown */}
				<div className='border-t pt-4 space-y-2'>
					<div className='flex justify-between text-sm'>
						<span>Subtotal</span>
						<span>{formatCurency(productAmount)}</span>
					</div>
					<div className='flex justify-between text-sm'>
						<span>Delivery Fee</span>
						<span>{formatCurency(deliveryFee)}</span>
					</div>
					<div className='flex justify-between text-sm'>
						<span>Service Fee</span>
						<span>{formatCurency(serviceFee)}</span>
					</div>
					<div className='flex justify-between font-bold text-lg pt-2 border-t text-primary'>
						<span>Total to Pay</span>
						<span>{formatCurency(totalAmount)}</span>
					</div>
				</div>
			</div>

			{/* Submit Button */}
			<div className='fixed bottom-0 left-0 w-screen bg-background border-t border-t-[#85858540] h-[100px] px-5 flex justify-center z-50'>
				<div className='w-full h-full flex items-center justify-between max-w-[1400px]'>
					<div>
						<p className='text-sm text-foreground/50'>Total</p>
						<p className='text-xl font-semibold text-foreground'>
							{formatCurency(totalAmount)}
						</p>
					</div>
					<Button
						variant={'game'}
						size={'lg'}
						onClick={handleCheckout}
						disabled={
							createOrderMutation.isPending ||
							createPaymentMutation.isPending ||
							!checkoutStore.isCheckoutComplete()
						}
						className='bg-[#FF305A]'>
						{createOrderMutation.isPending ||
						createPaymentMutation.isPending
							? 'Processing...'
							: 'Proceed to Payment'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default PackageCheckoutSection;
