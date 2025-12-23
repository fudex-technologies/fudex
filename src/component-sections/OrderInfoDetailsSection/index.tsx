import OrderInfoItem from '@/components/order-components/OrderInfoItem';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const OrderInfoDetailsSection = ({ orderId }: { orderId: string }) => {
	return (
		<>
			<div className='w-full max-w-lg p-5 space-y-5'>
				<div className='text-center'>
					<p className='font-light'>Order ID</p>
					<p className='font-semibold text-xl'>#{orderId}</p>
					<p>Estimated ready in 5 minutes</p>
				</div>

				<div className='w-full flex flex-col gap-14 px-5'>
					<StatusIndicator status='done' title='Order placed' />
					<StatusIndicator
						status='in-progress'
						title='Preparing your order'
					/>
					<StatusIndicator
						status='pending'
						title='Rider is on the way'
					/>
					<StatusIndicator
						status='pending'
						title='Delivered'
						isLast={true}
					/>
				</div>

				<div className='mt-10'>
					<p className='text-lg mb-5'>Items ordered</p>
					<div className='w-full grid grid-cols-1 gap-5'>
						<OrderInfoItem
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
						/>
						<OrderInfoItem
							index={2}
							orderDetails={{
								main: 'Jollof Rice ',
								quantity: 1,
								totalAmount: 5000,
							}}
						/>
					</div>
				</div>
			</div>

			<>
				<div className='mb-[110px]' />
				<div className='bottom-0 left-0 fixed w-screen flex justify-center'>
					<div className='w-full max-w-lg bg-background border-t border-t-[#85858540] h-[100px] text-[#858585] px-5 flex justify-center'>
						<div className='w-full h-full flex items-center justify-between max-w-[1400px] gap-5'>
							<Button
								variant={'ghost'}
								className='flex-1 max-w-xs py-6'>
								Cancel order
							</Button>
							<Button
								variant={'outline'}
								className='flex-1 max-w-xs py-6 border-primary text-primary'>
								Contact support
							</Button>
						</div>
					</div>
				</div>
			</>
		</>
	);
};

export default OrderInfoDetailsSection;

const StatusIndicator = ({
	status,
	title,
	isLast = false,
}: {
	status: 'done' | 'pending' | 'in-progress';
	title: string;
	isLast?: boolean;
}) => {
	return (
		<div className='flex gap-2 items-center'>
			<div
				className={cn(
					'w-[25px] h-[25px] border flex items-center justify-center rounded-full relative z-10 bg-background',
					status === 'done' && 'border-primary',
					status === 'pending' && 'border-foreground/10',
					status === 'in-progress' && 'border-destructive'
				)}>
				<div
					className={cn(
						'w-[80%] h-[80%] rounded-full',
						status === 'done' && 'bg-primary',
						status === 'pending' && 'bg-background',
						status === 'in-progress' && 'bg-destructive'
					)}></div>
				{!isLast && (
					<div
						className={cn(
							'absolute w-0.5 h-[60px] z-0 top-6',
							status === 'done' && 'bg-primary',
							status === 'pending' && 'bg-foreground/10',
							status === 'in-progress' && 'bg-foreground/10'
						)}
					/>
				)}
			</div>
			<p
				className={cn(
					'text-lg',
					status === 'done' && 'font-semibold text-foreground',
					status === 'pending' && 'font-light text-foreground/50',
					status === 'in-progress' && 'font-semibold text-foreground'
				)}>
				{title}
			</p>
		</div>
	);
};
