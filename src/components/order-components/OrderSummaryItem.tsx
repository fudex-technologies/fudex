'use client';

import { Trash } from 'lucide-react';
import { useState } from 'react';
import CounterComponent from '../CounterComponent';
import { formatCurency } from '@/lib/commonFunctions';

interface IOrderItemDetails {
	main: string;
	quantity: number;
	additions?: {
		name: string;
		quantity?: string;
		number?: number;
		size?: string;
	}[];
	totalAmount: number;
}

const OrderSummaryItem = ({
	index,
	handleCountChange,
	orderDetails,
}: {
	index: number;
	handleCountChange?: (count: number) => void;
	orderDetails: IOrderItemDetails;
}) => {
	const [count, setCount] = useState(orderDetails.quantity || 0);
	return (
		<div className='p-5 border-b border-foreground/50'>
			<div className='flex justify-between mb-3'>
				<p className='font-semibold'>Pack #{index}</p>
				<span className='p-2 rounded-full bg-destructive/10 text-destructive'>
					<Trash size={12} />
				</span>
			</div>
			<div className='flex justify-between items-start'>
				<div className=''>
					<div className='flex gap-1 items-center'>
						<span className='w-2 h-2 rounded-full bg-foreground' />{' '}
						<p className='text-lg'>{orderDetails.main} </p>
					</div>
					{orderDetails.additions &&
						orderDetails.additions.length > 0 && (
							<div className='flex flex-col gap-1 pl-3'>
								{orderDetails.additions.map(
									(addition, index) => (
										<p className='font-light' key={index}>
											{addition.name}{' '}
											{addition?.size && addition.size}{' '}
											{addition?.quantity &&
												addition.quantity}{' '}
											{addition?.number &&
												`X${addition.number}`}{' '}
										</p>
									)
								)}
							</div>
						)}
				</div>
				<CounterComponent
					count={count}
					setCount={setCount}
					className='w-[150px] py-2'
				/>
			</div>
			<p className='font-semibold text-lg mt-2 pl-3'>
				{formatCurency(orderDetails.totalAmount)}
			</p>
		</div>
	);
};

export default OrderSummaryItem;
