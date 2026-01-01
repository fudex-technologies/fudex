'use client';

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { formatCurency, shortenText } from '@/lib/commonFunctions';
import { ChevronRight } from 'lucide-react';
import { PiMapPinAreaBold } from 'react-icons/pi';
import { PiStorefrontBold } from 'react-icons/pi';
import { FaBicycle } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { useOrderingActions } from '@/api-hooks/useOrderingActions';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';

const CheckoutDetailsSection = () => {
	const router = useRouter();
	const { data: session } = useSession();
	const { packs, vendorId, clearCart } = useCartStore();
	const trpc = useTRPC();
	const [selectedAddressId, setSelectedAddressId] = useState<string>('');
	const [noteToStore, setNoteToStore] = useState('');
	const [noteToRider, setNoteToRider] = useState('');
	const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

	// Fetch addresses
	const { data: addresses = [] } = useQuery(
		trpc.users.listAddresses.queryOptions(undefined)
	);

	// Fetch vendor info
	const { data: vendor } = useVendorProductActions().useGetVendorById(
		vendorId ? { id: vendorId } : { id: '' }
	);

	// Set default address
	useMemo(() => {
		if (addresses.length > 0 && !selectedAddressId) {
			const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
			if (defaultAddress) {
				setSelectedAddressId(defaultAddress.id);
			}
		}
	}, [addresses, selectedAddressId]); // eslint-disable-line react-hooks/exhaustive-deps

	const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

	// Calculate totals
	const { subTotal, deliveryFee, serviceFee, total } = useMemo(() => {
		// For now, use placeholder values
		// In production, you'd calculate from actual product prices
		const subTotal = 0; // Calculate from packs
		const deliveryFee = 600;
		const serviceFee = 300;
		const total = subTotal + deliveryFee + serviceFee;
		return { subTotal, deliveryFee, serviceFee, total };
	}, [packs]);

	// Create order mutation
	const createOrderMutation = useOrderingActions().createOrder({
		onSuccess: async (order: any) => {
			// Create payment after order is created
			// Build callback URL for payment redirect
			const baseUrl = typeof window !== 'undefined' 
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
				description: err instanceof Error ? err.message : 'Unknown error',
			});
		},
		silent: false,
	});

	// Create payment mutation
	const createPaymentMutation = useOrderingActions().createPayment({
		onSuccess: (data: any) => {
			// Redirect to Paystack checkout
			if (data.checkoutUrl) {
				// Clear cart before redirecting (order is already created)
				clearCart();
				// Redirect to Paystack checkout page
				window.location.href = data.checkoutUrl;
			} else {
				toast.error('Payment initialization failed - no checkout URL received');
			}
		},
		onError: (err) => {
			toast.error('Failed to create payment', {
				description: err instanceof Error ? err.message : 'Unknown error',
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

		// Check address
		if (!selectedAddressId) {
			toast.error('Please select a delivery address');
			setIsAddressDialogOpen(true);
			return;
		}

		// Convert cart packs to order items
		const items = packs.map((pack) => ({
			productItemId: pack.productItemId,
			quantity: pack.quantity,
			groupKey: pack.groupKey,
			addons: pack.addons,
		}));

		// Combine notes
		const notes = [noteToStore, noteToRider]
			.filter(Boolean)
			.join(' | ');

		// Create order first, then create payment
		createOrderMutation.mutate({
			addressId: selectedAddressId,
			items,
			notes: notes || undefined,
		});
	};

	if (!session) {
		return (
			<div className='w-full flex justify-center pb-10'>
				<div className='max-w-lg w-full flex flex-col items-center gap-5 p-10'>
					<p className='text-center text-foreground/70'>
						Please login or create an account to continue with checkout
					</p>
					<Button
						variant='game'
						size='lg'
						onClick={() => router.push(PAGES_DATA.login_page)}>
						Login / Sign Up
					</Button>
				</div>
			</div>
		);
	}

	if (packs.length === 0) {
		return (
			<div className='w-full flex justify-center pb-10'>
				<div className='max-w-lg w-full flex flex-col items-center gap-5 p-10'>
					<p className='text-center text-foreground/70'>
						Your cart is empty
					</p>
					<Button
						variant='game'
						size='lg'
						onClick={() => router.push(PAGES_DATA.home_page)}>
						Browse Vendors
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='w-full flex justify-center pb-10'>
			<div className='max-w-lg w-full flex flex-col'>
				{/* Order Summary */}
				<div className='w-full flex flex-col'>
					<div className='px-5 py-2 bg-muted text-muted-foreground'>
						<p className='text-lg font-bold'>Your order</p>
					</div>
					<div className='flex items-center justify-between p-5'>
						<p>
							{packs.length} pack{packs.length > 1 ? 's' : ''} from{' '}
							<span className='text-primary'>{vendor?.name || 'Vendor'}</span>
						</p>
						<ChevronRight size={14} />
					</div>
				</div>

				{/* Delivery Address */}
				<div className='w-full flex flex-col'>
					<div className='px-5 py-2 bg-muted text-muted-foreground'>
						<p className='text-lg font-bold'>Delivery address</p>
					</div>
					<button
						onClick={() => setIsAddressDialogOpen(true)}
						className='flex items-center justify-between p-5 hover:bg-muted/50 transition-colors'>
						<div className='flex gap-2 items-center flex-1'>
							<PiMapPinAreaBold size={20} />
							{selectedAddress ? (
								<p className='text-left'>
									{shortenText(
										`${selectedAddress.line1}${selectedAddress.line2 ? ', ' + selectedAddress.line2 : ''}, ${selectedAddress.city}`,
										40
									)}
								</p>
							) : (
								<p className='text-foreground/50'>Select address</p>
							)}
						</div>
						<ChevronRight size={14} />
					</button>
				</div>

				{/* Address Selection Dialog */}
				<Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Select Delivery Address</DialogTitle>
						</DialogHeader>
						{addresses.length === 0 ? (
							<div className='space-y-4'>
								<p className='text-foreground/70'>
									No addresses found. Please add an address first.
								</p>
								<Button
									variant='game'
									onClick={() => {
										setIsAddressDialogOpen(false);
										router.push(PAGES_DATA.profile_addresses_page);
									}}>
									Add Address
								</Button>
							</div>
						) : (
							<RadioGroup
								value={selectedAddressId}
								onValueChange={(value) => {
									setSelectedAddressId(value);
									setIsAddressDialogOpen(false);
								}}
								className='space-y-2'>
								{addresses.map((address) => (
									<div key={address.id}>
										<div className='flex items-center gap-3 p-3 rounded border'>
											<RadioGroupItem
												value={address.id}
												id={`address-${address.id}`}
											/>
											<Label
												htmlFor={`address-${address.id}`}
												className='flex-1 cursor-pointer'>
												<div>
													{address.label && (
														<p className='font-semibold'>{address.label}</p>
													)}
													<p className='text-sm'>
														{address.line1}
														{address.line2 && `, ${address.line2}`}
													</p>
													<p className='text-sm text-foreground/50'>
														{address.city}
														{address.state && `, ${address.state}`}
													</p>
												</div>
											</Label>
										</div>
										{addresses.indexOf(address) < addresses.length - 1 && (
											<Separator className='my-2' />
										)}
									</div>
								))}
							</RadioGroup>
						)}
					</DialogContent>
				</Dialog>

				{/* Instructions */}
				<div className='w-full flex flex-col'>
					<div className='px-5 py-2 bg-muted text-muted-foreground'>
						<p className='text-lg font-bold'>Instructions</p>
					</div>
					<div className='w-full px-5'>
						<Accordion type='single' collapsible className='w-full'>
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
										onChange={(e) => setNoteToStore(e.target.value)}
									/>
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value='note-to-rider' className='py-2'>
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
										onChange={(e) => setNoteToRider(e.target.value)}
									/>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</div>

				{/* Payment Summary */}
				<div className='w-full flex flex-col'>
					<div className='px-5 py-2 bg-muted text-muted-foreground'>
						<p className='text-lg font-bold'>Payment Summary</p>
					</div>
					<div className='py-5 space-y-2'>
						<div className='flex items-center justify-between px-5'>
							<p>Sub-total ({packs.length} pack{packs.length > 1 ? 's' : ''})</p>
							<p className='font-semibold'>{formatCurency(subTotal)}</p>
						</div>
						<div className='flex items-center justify-between px-5'>
							<p>Delivery fee</p>
							<p className='font-semibold'>{formatCurency(deliveryFee)}</p>
						</div>
						<div className='flex items-center justify-between px-5'>
							<p>Service fee</p>
							<p className='font-semibold'>{formatCurency(serviceFee)}</p>
						</div>
						<div className='flex items-center justify-between px-5'>
							<p className='font-semibold'>Total</p>
							<p className='font-semibold'>{formatCurency(total)}</p>
						</div>
					</div>
				</div>

				{/* Checkout Button */}
				<div className='px-5 py-2 bg-background sticky bottom-5'>
					<Button
						variant={'game'}
						size={'lg'}
						className='w-full'
						onClick={handleCheckout}
						disabled={
							createOrderMutation.isPending ||
							createPaymentMutation.isPending ||
							!selectedAddressId
						}>
						{createOrderMutation.isPending || createPaymentMutation.isPending
							? 'Processing...'
							: 'Make Payment'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CheckoutDetailsSection;
