'use client';

import { ChevronDown, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@prisma/client';
import { useState } from 'react';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import VendorDashboardOrderItemByPack from './VendorDashboardOrderItemByPack';

const dummyAddonItems = [
	{ id: 'addon1', name: 'Extra Cheese' },
	{ id: 'addon2', name: 'Extra Ketchup' },
	{ id: 'addon3', name: 'Coca-cola' },
];

const dummyPacks = [
	{
		mainItem: { id: 'item1', name: 'Jollof Rice with chicken' },
		addons: [{ addonProductItemId: 'addon3', quantity: 1 }],
		packTotal: 7000,
	},
	{
		mainItem: { id: 'item2', name: 'Fried Rice' },
		addons: [
			{ addonProductItemId: 'addon1', quantity: 2 },
			{ addonProductItemId: 'addon2', quantity: 1 },
		],
		packTotal: 7000,
	},
];

const VendorDashboardOrderCardItem = ({
	isNew = false,
	status,
}: {
	isNew?: boolean;
	status: OrderStatus;
}) => {
	const [showMore, setShowMore] = useState(false);
	return (
		<div className='relative min-w-xs w-full max-w-md rounded-lg  bg-muted text-muted-foreground z-10 overflow-hidden shadow-sm'>
			{isNew && (
				<div className='w-full px-5 py-2 bg-[#24AA9A] text-white'>
					<p>New Order</p>
				</div>
			)}
			<div className={cn('w-full p-5')}>
				<div className='w-full space-y-1 border-b'>
					<div className='flex flex-wrap items-center gap-2'>
						{status === 'PAID' && (
							<div className='px-2 w-fit h-fit py-1 rounded-lg bg-[#24AA9A] text-white flex items-center justify-center text-sm'>
								New
							</div>
						)}
						<p className='text-foreground/50'>Order ID:</p>
						<p>#FDX-238491</p>
						{status === 'DELIVERED' && (
							<div className='text-xs px-2 w-fit h-fit py-1 bg-[#24aa9a3c] text-[#24AA9A] flex items-center justify-center rounded-full'>
								Out for delivery
							</div>
						)}
					</div>
					<div className='w-full flex items-center justify-between flex-wrap gap-2 '>
						<div className='flex gap-2'>
							<p className='text-foreground/50'>2 items:</p>
							<p>#14.000</p>
						</div>

						<Button
							onClick={() => setShowMore((prev) => !prev)}
							variant={'link'}>
							See {showMore ? 'Less' : 'More'}{' '}
							<ChevronDown
								className={cn(
									'transition-all easy-out',
									showMore && 'rotate-180'
								)}
							/>
						</Button>
					</div>
				</div>
				<Collapsible open={showMore} className='border-b'>
					<CollapsibleContent>
						{dummyPacks.map((pack, index) => (
							<VendorDashboardOrderItemByPack
								key={index}
								pack={pack}
								index={index}
								addonItems={dummyAddonItems}
								packTotal={pack.packTotal}
							/>
						))}
					</CollapsibleContent>
				</Collapsible>

				<div className='w-full flex gap-2 pt-5'>
					<Store />{' '}
					<div className=''>
						<p className=''>Note to store</p>
						<p className=''>
							Please ensure the food is being packed well
						</p>
					</div>
				</div>
				<div className='w-full mt-5 flex flex-wrap gap-x-5 gap-y-3'>
					{status === 'PAID' && (
						<>
							<Button
								className='flex-1 border-destructive text-destructive'
								variant={'outline'}>
								Reject Order
							</Button>
							<Button className='flex-1 ' variant={'game'}>
								Accept Order
							</Button>
						</>
					)}
					{status === 'PREPARING' && (
						<>
							<Button className='w-full' variant={'game'}>
								Mark as Ready
							</Button>
							<Button
								className='w-full border-primary text-primary'
								variant={'outline'}>
								Contact Support
							</Button>
						</>
					)}
					{status === 'ASSIGNED' && (
						<>
							<Button className='w-full' variant={'game'}>
								Given to Rider
							</Button>
							<Button
								className='w-full border-primary text-primary'
								variant={'outline'}>
								Contect Support
							</Button>
						</>
					)}
					{status === 'DELIVERED' && (
						<>
							<Button
								className='w-full border-primary text-primary'
								variant={'outline'}>
								Contect Support
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default VendorDashboardOrderCardItem;
