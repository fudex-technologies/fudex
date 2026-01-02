'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { PAGES_DATA } from '@/data/pagesData';
import { formatCurency, normalizePhoneNumber } from '@/lib/commonFunctions';
import { FUDEX_PHONE_NUMBER } from '@/lib/staticData/contactData';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const CompletedOrderDetailsSection = ({ orderId }: { orderId: string }) => {
	return (
		<>
			<div className='w-full max-w-lg py-10 space-y-5'>
				<div className='w-full space-y-5 px-5'>
					<div className='w-full'>
						<p className='font-light'>
							Picked at 14 Jan 2025 at 4:42 PM
						</p>
						<p className='font-semibold'>
							God is good, Phase 2, Ekiti
						</p>
					</div>
					<div className='w-full'>
						<p className='font-light'>
							Picked at 14 Jan 2025 at 4:42 PM
						</p>
						<p className='font-semibold'>
							God is good, Phase 2, Ekiti
						</p>
					</div>
				</div>
				<div className='w-full flex flex-col'>
					<div className='px-5 py-2 bg-muted text-muted-foreground'>
						<p className='text-lg font-bold'>Payment Summary</p>
					</div>
					<div className='flex items-center justify-between py-1 px-5'>
						<p>Sub-total (2 items)</p>
						<p className='font-semibold'>{formatCurency(1400)}</p>
					</div>
					<div className='flex items-center justify-between py-1 px-5'>
						<p>Delivery fee</p>
						<p className='font-semibold'>{formatCurency(1000)}</p>
					</div>
					<div className='flex items-center justify-between py-1 px-5'>
						<p>Service fee</p>
						<p className='font-semibold'>{formatCurency(60)}</p>
					</div>
					<div className='flex items-center justify-between py-1 px-5'>
						<p className='font-semibold'>Total</p>
						<p className='font-semibold'>{formatCurency(1560)}</p>
					</div>
				</div>
				<div className='w-full flex flex-col'>
					<div className='px-5 py-2 bg-muted text-muted-foreground'>
						<p className='text-lg font-bold'>Package Details</p>
					</div>
					<div className='flex flex-col  text-start justify-between py-1 px-5'>
						<p className='font-light'>Package ID</p>
						<p className='font-semibold'>#FDX-238491</p>
					</div>
					<div className='flex flex-col  text-start justify-between py-1 px-5'>
						<p className='font-light'>Package items</p>
						<p className='font-semibold'>Food and Drink</p>
					</div>
					<div className='flex flex-col  text-start justify-between py-1 px-5'>
						<p className='font-light'>Date</p>
						<p className='font-semibold'>14 Jan 2025 at 5:06 PM</p>
					</div>
					<div className='flex flex-col  text-start justify-between py-1 px-5'>
						<p className='font-light'>Delivery instructions</p>
						<p className='font-semibold'>
							Call when you get to hostel gate, don’t knock.
						</p>
					</div>
				</div>
			</div>
			<>
				{/* <div className='mb-[60px]' /> */}
				<div className='fixed bottom-0 left-0 w-screen  bg-background border-t border-t-[#85858540] h-[100px] text-[#858585] px-5 flex justify-center'>
					<div className='w-full h-full flex gap-5 items-center justify-between max-w-lg'>
						<a
							href={`https://wa.me/${normalizePhoneNumber(
								FUDEX_PHONE_NUMBER
							)}?text=Hello%20FUDEX%20`}
							target='__blacnk'
							rel='noreferrer'
							className={cn(
								buttonVariants({
									variant: 'outline',
									className:
										'border-primary text-primary flex-1 py-6',
								})
							)}>
							Need help?
						</a>
						<Link
							href={PAGES_DATA.single_vendor_page('12')}
							className={cn(
								buttonVariants({
									variant: 'game',
									className: 'flex-1 py-6',
								})
							)}>
							Rate your order
						</Link>
					</div>
				</div>
			</>
		</>
	);
};

export default CompletedOrderDetailsSection;
