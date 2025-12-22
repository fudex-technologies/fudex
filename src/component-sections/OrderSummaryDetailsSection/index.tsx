import OrderSummaryItem from '@/components/order-components/OrderSummaryItem';
import { Button, buttonVariants } from '@/components/ui/button';
import { PAGES_DATA } from '@/data/pagesData';
import { formatCurency } from '@/lib/commonFunctions';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const OrderSummaryDetailsSection = () => {
	return (
		<>
			<div className='w-full'>
				<div className='w-full px-5 flex items-center justify-between'>
					<p>
						2 items from{' '}
						<span className='text-primary'>Bukolary</span>
					</p>
					<Button variant={'link'} className='text-destructive'>
						Clear Order
					</Button>
				</div>

				<div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
					<OrderSummaryItem
						index={1}
						orderDetails={{
							main: 'Special Fried Rice ',
							quantity: 2,
							additions: [
								{
									name: 'Beef',
									number: 3,
								},
								{
									name: 'Bottle water',
									quantity: '70 ltrs',
									number: 2,
								},
								{
									name: 'Chicken',
								},
							],
							totalAmount: 7500,
						}}
						// handleCountChange={() => {}}
					/>
					<OrderSummaryItem
						index={2}
						orderDetails={{
							main: 'Jollof Rice ',
							quantity: 1,
							totalAmount: 5000,
						}}
						// handleCountChange={() => {}}
					/>
				</div>
			</div>
			<div className='w-full flex justify-end p-5'>
				<Link
					className={cn(
						buttonVariants({
							className: 'bg-primary/10 text-primary',
						})
					)}
					href={PAGES_DATA.single_vendor_page('1')}>
					<Plus />
					Add more items
				</Link>
			</div>

			<>
				<div className='mb-[110px]' />
				<div className='fixed bottom-0 left-0 w-screen bg-background border-t border-t-[#85858540] h-[100px] text-[#858585] px-5 flex justify-center'>
					<div className='w-full h-full flex items-center justify-between max-w-[1400px]'>
						<div className=''>
							<p className='text-sm text-foreground/50'>Total</p>
							<p className='text-xl font-semibold text-foreground'>
								{formatCurency(12500)}
							</p>
						</div>
						<Link
							className={cn(
								buttonVariants({
									size: 'lg',
									variant: 'game',
								})
							)}
							href={PAGES_DATA.checkout_page('123123')}>
							Proceed to checkout
						</Link>
					</div>
				</div>
			</>
		</>
	);
};

export default OrderSummaryDetailsSection;
