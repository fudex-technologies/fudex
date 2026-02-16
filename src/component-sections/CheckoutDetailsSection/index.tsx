'use client';

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { formatCurency, shortenText } from '@/lib/commonFunctions';
import { ChevronRight, Phone } from 'lucide-react';
import { PiMapPinAreaBold } from 'react-icons/pi';
import { PiStorefrontBold } from 'react-icons/pi';
import { FaBicycle } from 'react-icons/fa';
import { Button, buttonVariants } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { useOrderingActions } from '@/api-hooks/useOrderingActions';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import AddressesDrawer from './AddressesDrawer';
import AddPhoneNumberDrawer from './AddPhoneNumberDrawer';
import WalletPaymentSelection from '@/components/Checkout/WalletPaymentSelection';
import { useProfileActions } from '@/api-hooks/useProfileActions';
import { isVendorOpen } from '@/lib/vendorUtils';
import { motion, AnimatePresence } from 'motion/react';

const CheckoutDetailsSection = ({ vendorId }: { vendorId: string }) => {
	const router = useRouter();
	const { data: session, isPending } = useSession();
	const { getVendorPacks, clearVendor } = useCartStore();
	const trpc = useTRPC();
	const [selectedAddressId, setSelectedAddressId] = useState<string>('');
	const [noteToStore, setNoteToStore] = useState('');
	const [noteToRider, setNoteToRider] = useState('');
	const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
	const [isAddPhoneDrawerOpen, setIsAddPhoneDrawerOpen] = useState(false);
	const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'PICKUP'>(
		'DELIVERY',
	);
	const [walletAmount, setWalletAmount] = useState(0);
	const packs = getVendorPacks(vendorId);

	const { getProfile, getAddresses } = useProfileActions();
	const { getReferralStats } = useProfileActions();

	const { data: referralData, isLoading: isLoadingReferralData } =
		getReferralStats();
	const confirmedReferred = referralData?.confirmedReferred || 0;

	const referralPromoInitiated =
		!isLoadingReferralData && confirmedReferred === 5;

	// Fetch user information
	const { data: prodileData, refetch: refetchProfile } = getProfile();
	// Fetch addresses
	const { data: addresses = [] } = getAddresses();
	// Fetch vendor info
	const { data: vendor } = useVendorProductActions().useGetVendorById(
		vendorId ? { id: vendorId } : { id: '' },
	);

	// Check if vendor is open
	const vendorIsOpen = isVendorOpen(
		vendor?.openingHours,
		vendor?.availabilityStatus,
	);

	// Set default address
	useMemo(() => {
		if (addresses.length > 0 && !selectedAddressId) {
			const defaultAddress =
				addresses.find((a) => a.isDefault) || addresses[0];
			if (defaultAddress) {
				setSelectedAddressId(defaultAddress.id);
			}
		}
	}, [addresses, selectedAddressId]); // eslint-disable-line react-hooks/exhaustive-deps

	const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

	// Collect all product item IDs needed for price calculation
	const allProductItemIds = useMemo(() => {
		const mainIds = packs.map((p) => p.productItemId);
		const addonIds = packs.flatMap(
			(p) => p.addons?.map((a) => a.addonProductItemId) || [],
		);
		return Array.from(new Set([...mainIds, ...addonIds]));
	}, [packs]);

	// Fetch all product items for price calculation
	const { data: productItems = [] } =
		useVendorProductActions().useGetProductItemsByIds({
			ids: allProductItemIds,
		});

	// Create a map for quick lookup
	const productItemsMap = useMemo(() => {
		const map = new Map();
		productItems.forEach((item) => {
			map.set(item.id, item);
		});
		return map;
	}, [productItems]);

	// Calculate subtotal from packs
	const subTotal = useMemo(() => {
		if (productItems.length === 0) return 0;

		let total = 0;

		for (const pack of packs) {
			const mainItem = productItemsMap.get(pack.productItemId);
			if (!mainItem) continue;

			// Calculate price for ONE pack
			let singlePackPrice = 0;

			// Main item price * quantity (works for both FIXED and PER_UNIT)
			const packPrice = mainItem.price * pack.quantity;
			singlePackPrice += packPrice;

			// Add packaging fee for PER_UNIT items (once per pack)
			if (mainItem.pricingType === 'PER_UNIT' && mainItem.packagingFee) {
				singlePackPrice += mainItem.packagingFee;
			}

			// Add addon prices - DO NOT multiply by pack.quantity
			if (pack.addons) {
				for (const addon of pack.addons) {
					const addonItem = productItemsMap.get(
						addon.addonProductItemId,
					);
					if (addonItem) {
						// Addons are per pack, not per unit of the main item
						singlePackPrice += addonItem.price * addon.quantity;
					}
				}
			}

			// Multiply by numberOfPacks (e.g., if user wants 2 packs of this configuration)
			const numberOfPacks = pack.numberOfPacks || 1;
			total += singlePackPrice * numberOfPacks;
		}

		return total;
	}, [packs, productItemsMap, productItems.length]);

	// Fetch delivery fee based on selected address area
	const { data: deliveryFeeData, isLoading: isLoadingDeliveryFeeData } =
		useQuery(
			trpc.users.calculateDeliveryFee.queryOptions(
				{
					areaId: selectedAddress?.areaId || null,
				},
				{
					enabled: !!selectedAddress,
				},
			),
		);

	// Fetch service fee
	const { data: serviceFeeData, isLoading: isLoadingServiceFee } = useQuery(
		trpc.users.getServiceFee.queryOptions(undefined),
	);

	const deliveryFee =
		deliveryType === 'PICKUP' || referralPromoInitiated
			? 0
			: deliveryFeeData?.deliveryFee || 0;
	const serviceFee = serviceFeeData?.serviceFee || 0;
	const subTotalWithFees = subTotal + deliveryFee + serviceFee;
	const total = Math.max(0, subTotalWithFees - walletAmount);

	// Create payment mutation
	const createPaymentMutation = useOrderingActions().createPayment({
		onSuccess: (data: any) => {
			// Redirect to Paystack checkout
			if (data.checkoutUrl) {
				// Clear cart before redirecting (order is already created)
				clearVendor(vendorId);
				// Redirect to Paystack checkout page
				window.location.href = data.checkoutUrl;
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

	// Create order mutation
	const createOrderMutation = useOrderingActions().createOrder({
		onSuccess: async (order: any) => {
			// Create payment after order is created
			// Build callback URL for payment redirect
			const baseUrl =
				typeof window !== 'undefined'
					? window.location.origin
					: process.env.NEXT_PUBLIC_BASE_URL || '';
			const callbackUrl = `${baseUrl}/orders/${order.id}/payment-callback`;

			createPaymentMutation.mutate({
				orderId: order.id,
				callbackUrl,
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

	const handleCheckout = () => {
		// Check authentication
		if (!session) {
			toast.error('Please login to continue');
			router.push(PAGES_DATA.login_page);
			return;
		}

		// Check cart
		if (packs.length === 0) {
			toast.error('Your cart is empty');
			router.push(PAGES_DATA.tray_page);
			return;
		}

		// Check if vendor is open
		if (!vendorIsOpen) {
			toast.error(
				`${vendor?.name || 'This vendor'} is currently closed`,
				{
					description: 'Please try again when they are open',
				},
			);
			return;
		}

		// Check address
		if (!selectedAddressId) {
			toast.error('Please select a delivery address');
			setIsAddressDialogOpen(true);
			return;
		}
		// Check phone
		if (!prodileData?.phone) {
			toast.error('Please provide a contact phone number');
			setIsAddPhoneDrawerOpen(true);
			return;
		}

		// Transform packs into order items
		// IMPORTANT: Each pack may have numberOfPacks > 1, so we need to create separate order items
		// for each pack instance to ensure backend calculates correct total
		const items = packs.flatMap((pack) => {
			const numberOfPacks = pack.numberOfPacks || 1;
			// Create numberOfPacks copies of this pack configuration
			return Array.from({ length: numberOfPacks }, () => ({
				productItemId: pack.productItemId,
				quantity: pack.quantity,
				groupKey: pack.groupKey,
				addons: pack.addons,
			}));
		});

		// Combine notes
		const notes = [noteToStore, noteToRider].filter(Boolean).join(' | ');

		// Create order first, then create payment
		createOrderMutation.mutate({
			addressId: selectedAddressId,
			items,
			notes: notes || undefined,
			deliveryType,
			walletAmount,
		});
	};

	if (isPending) {
		return (
			<div className='w-full max-w-lg space-y-5 mx-auto p-5'>
				<Skeleton className='h-5' />
				<Skeleton className='h-10' />
				<Skeleton className='h-20' />
				<Skeleton className='h-5' />
				<Skeleton className='h-5' />
			</div>
		);
	}

	if (!session && !isPending) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className='w-full flex justify-center pb-10'>
				<div className='max-w-lg w-full flex flex-col items-center gap-5 p-10'>
					<ImageWithFallback
						src={'/assets/fudex-tackout-pack.png'}
						className='w-full'
					/>
					<p className='text-center text-foreground/70'>
						Please login or create an account to continue with
						checkout
					</p>
					<Link
						href={`${
							PAGES_DATA.login_page
						}?redirect=${encodeURIComponent(
							PAGES_DATA.checkout_page(vendorId),
						)}`}
						className={cn(
							buttonVariants({
								variant: 'game',
								size: 'lg',
								className: 'w-full',
							}),
						)}>
						Login / Sign Up
					</Link>
				</div>
			</motion.div>
		);
	}

	if (packs.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className='w-full flex justify-center pb-10'>
				<div className='max-w-lg w-full flex flex-col items-center gap-5 p-10'>
					<p className='text-center text-foreground/70'>
						Your tray is empty
					</p>
					<Button
						variant='game'
						size='lg'
						onClick={() => router.push(PAGES_DATA.home_page)}>
						Browse Vendors
					</Button>
				</div>
			</motion.div>
		);
	}

	const sectionVariants = {
		hidden: { opacity: 0, y: 10 },
		show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
	};

	return (
		<>
			<div className='w-full flex justify-center pb-10'>
				<motion.div
					initial='hidden'
					animate='show'
					variants={{
						show: { transition: { staggerChildren: 0.05 } },
					}}
					className='max-w-lg w-full flex flex-col'>
					{/* Order Summary */}
					<motion.div
						variants={sectionVariants}
						className='w-full flex flex-col'>
						<div className='px-5 py-2 bg-muted text-muted-foreground'>
							<p className='text-lg font-bold'>Your order</p>
						</div>
						<div className='flex items-center justify-between p-5'>
							<p>
								{packs.length} pack{packs.length > 1 ? 's' : ''}{' '}
								from{' '}
								<span className='text-primary'>
									{vendor?.name || 'Vendor'}
								</span>
							</p>
							<ChevronRight size={14} />
						</div>
					</motion.div>

					{/* Delivery/Pickup Toggle */}
					<motion.div
						variants={sectionVariants}
						className='w-full flex flex-col'>
						<div className='px-5 py-2 bg-muted text-muted-foreground'>
							<p className='text-lg font-bold'>Delivery Option</p>
						</div>
						<div className='p-5 flex gap-4'>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={() => setDeliveryType('DELIVERY')}
								className={cn(
									'flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
									deliveryType === 'DELIVERY'
										? 'border-primary bg-primary/5 text-primary'
										: 'border-muted bg-transparent text-muted-foreground',
								)}>
								<FaBicycle size={24} />
								<span className='font-bold'>Delivery</span>
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={() => setDeliveryType('PICKUP')}
								className={cn(
									'flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
									deliveryType === 'PICKUP'
										? 'border-primary bg-primary/5 text-primary'
										: 'border-muted bg-transparent text-muted-foreground',
								)}>
								<PiStorefrontBold size={24} />
								<span className='font-bold'>Pickup</span>
							</motion.button>
						</div>
					</motion.div>

					{/* Delivery Address - Only show for Delivery */}
					<AnimatePresence>
						{deliveryType === 'DELIVERY' && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								className='w-full flex flex-col overflow-hidden'>
								<div className='px-5 py-2 bg-muted text-muted-foreground'>
									<p className='text-lg font-bold'>
										Delivery address
									</p>
								</div>
								<button
									onClick={() => setIsAddressDialogOpen(true)}
									className='flex items-center justify-between p-5 hover:bg-muted/50 transition-colors'>
									<div className='flex gap-2 items-center flex-1'>
										<PiMapPinAreaBold size={20} />
										{selectedAddress ? (
											<p className='text-left'>
												{shortenText(
													`${selectedAddress.line1}${
														selectedAddress.line2
															? ', ' +
																selectedAddress.line2
															: ''
													}, ${selectedAddress.city}`,
													40,
												)}
											</p>
										) : (
											<p className='text-foreground/50'>
												Select address
											</p>
										)}
									</div>
									<ChevronRight size={14} />
								</button>
							</motion.div>
						)}
					</AnimatePresence>
					{/* Phone number */}
					<motion.div
						variants={sectionVariants}
						className='w-full flex flex-col'>
						<div className='px-5 py-2 bg-muted text-muted-foreground'>
							<p className='text-lg font-bold'>
								Contact Information
							</p>
						</div>
						<div className='flex items-center justify-between p-5'>
							<div className='flex gap-2 items-center flex-1'>
								<Phone size={20} />
								{prodileData?.phone ? (
									<div className='flex items-center gap-2'>
										<p>{prodileData.phone}</p>
										{prodileData.phoneVerified ? (
											<span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full'>
												Verified
											</span>
										) : (
											<span className='text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full'>
												Unverified
											</span>
										)}
									</div>
								) : (
									<p className='text-foreground/50'>
										No Phone Number
									</p>
								)}
							</div>
							{!prodileData?.phoneVerified && (
								<Button
									variant='outline'
									size='sm'
									onClick={() => {
										if (prodileData?.phone) {
											router.push(
												`${
													PAGES_DATA.profile_verify_phone_page
												}?redirect=${encodeURIComponent(
													PAGES_DATA.checkout_page(
														vendorId,
													),
												)}`,
											);
										} else {
											setIsAddPhoneDrawerOpen(true);
										}
									}}>
									{prodileData?.phone
										? 'Verify Now'
										: 'Add Phone Number'}
								</Button>
							)}
						</div>
					</motion.div>

					{/* Instructions */}
					<motion.div
						variants={sectionVariants}
						className='w-full flex flex-col'>
						<div className='px-5 py-2 bg-muted text-muted-foreground'>
							<p className='text-lg font-bold'>Instructions</p>
						</div>
						<div className='w-full px-5'>
							<Accordion
								type='single'
								collapsible
								className='w-full'>
								<AccordionItem
									value='note-to-store'
									className='py-2 border-b! border-foreground/50'>
									<AccordionTrigger>
										<div className='flex gap-2 items-center text-base font-normal'>
											<PiStorefrontBold size={20} />
											<p>Note to store</p>
										</div>
									</AccordionTrigger>
									<AccordionContent className='w-full'>
										<Textarea
											placeholder='Add delivery instructions'
											className='w-full resize-none'
											rows={4}
											value={noteToStore}
											onChange={(e) =>
												setNoteToStore(e.target.value)
											}
										/>
									</AccordionContent>
								</AccordionItem>

								<AccordionItem
									value='note-to-rider'
									className='py-2'>
									<AccordionTrigger>
										<div className='flex gap-2 items-center text-base font-normal'>
											<FaBicycle size={20} />
											<p>Note to rider</p>
										</div>
									</AccordionTrigger>
									<AccordionContent className='w-full'>
										<Textarea
											placeholder='Add note to rider'
											className='w-full resize-none'
											rows={4}
											value={noteToRider}
											onChange={(e) =>
												setNoteToRider(e.target.value)
											}
										/>
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						</div>
					</motion.div>

					{/* Payment Method */}
					<motion.div
						variants={sectionVariants}
						className='w-full flex flex-col'>
						<div className='px-5 py-2 bg-muted text-muted-foreground'>
							<p className='text-lg font-bold'>Payment Method</p>
						</div>
						<div className='p-5'>
							<WalletPaymentSelection
								onWalletAmountChange={setWalletAmount}
								walletAmount={walletAmount}
								totalAmount={
									subTotal + deliveryFee + serviceFee
								}
							/>
						</div>
					</motion.div>

					{/* Payment Summary */}
					<motion.div
						variants={sectionVariants}
						className='w-full flex flex-col'>
						<div className='px-5 py-2 bg-muted text-muted-foreground'>
							<p className='text-lg font-bold'>Payment Summary</p>
						</div>
						<div className='py-5 space-y-2'>
							<div className='flex items-center justify-between px-5'>
								<p>
									Sub-total ({packs.length} pack
									{packs.length > 1 ? 's' : ''})
								</p>
								<p className='font-semibold'>
									{formatCurency(subTotal)}
								</p>
							</div>
							<div className='flex items-center justify-between px-5'>
								<p>Delivery fee</p>
								<p className='font-semibold'>
									{deliveryType === 'PICKUP'
										? 'Free (Pickup)'
										: referralPromoInitiated
											? 'Free (Referral Promo)'
											: isLoadingDeliveryFeeData
												? 'Loading...'
												: formatCurency(deliveryFee)}
								</p>
							</div>
							<div className='flex items-center justify-between px-5'>
								<p>Service fee</p>
								<p className='font-semibold'>
									{isLoadingServiceFee
										? 'Loading...'
										: formatCurency(serviceFee)}
								</p>
							</div>
							<div className='flex items-center justify-between px-5 font-bold text-primary'>
								<p>Total to Pay</p>
								<p>
									{isLoadingDeliveryFeeData ||
									isLoadingServiceFee
										? 'Loading...'
										: formatCurency(total)}
								</p>
							</div>
						</div>
					</motion.div>

					{/* Checkout Button */}
					<motion.div
						variants={sectionVariants}
						className='px-5 py-2 bg-background sticky bottom-5'>
						<Button
							variant={'game'}
							size={'lg'}
							className='w-full'
							onClick={handleCheckout}
							disabled={
								createOrderMutation.isPending ||
								createPaymentMutation.isPending ||
								// !selectedAddressId ||
								// !prodileData?.phone ||
								!vendorIsOpen
							}>
							{createOrderMutation.isPending ||
							createPaymentMutation.isPending
								? 'Processing...'
								: !vendorIsOpen
									? 'Vendor is Closed'
									: 'Make Payment'}
						</Button>
					</motion.div>
				</motion.div>
			</div>
			<AddressesDrawer
				isAddressDialogOpen={isAddressDialogOpen}
				setIsAddressDialogOpen={setIsAddressDialogOpen}
				addresses={addresses}
				selectedAddressId={selectedAddressId}
				setSelectedAddressId={setSelectedAddressId}
			/>
			<AddPhoneNumberDrawer
				isOpen={isAddPhoneDrawerOpen}
				onClose={() => {
					setIsAddPhoneDrawerOpen(false);
					refetchProfile();
				}}
				redirectUrl={PAGES_DATA.checkout_page(vendorId)}
			/>
		</>
	);
};

export default CheckoutDetailsSection;
