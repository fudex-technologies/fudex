import { formatCurency } from '@/lib/commonFunctions';

interface IOrderItemDetails {
	main: string;
	quantity: number;
	unitName?: string | null;
	pricingType?: 'FIXED' | 'PER_UNIT';
	additions?: {
		name: string;
		quantity?: string;
		number?: number;
		size?: string;
	}[];
	totalAmount: number;
}

const OrderInfoItem = ({
	index,
	orderDetails,
}: {
	index: number;
	orderDetails: IOrderItemDetails;
}) => {
	return (
		<div className=''>
			<div className='flex justify-between mb-3'>
				<p className='font-semibold'>Pack #{index}</p>
			</div>
			<div className='flex justify-between items-start bg-muted/50 border  rounded-lg p-5'>
				<div className=''>
					<div className='flex gap-1 items-center'>
						<span className='w-2 h-2 rounded-full bg-foreground' />{' '}
						<p className='text-lg'>
							{orderDetails.main}
							{orderDetails.pricingType === 'PER_UNIT' &&
								orderDetails.unitName && (
									<span className='text-sm text-foreground/50 ml-1'>
										({orderDetails.quantity} {orderDetails.unitName}
										{orderDetails.quantity !== 1 ? 's' : ''})
									</span>
								)}
						</p>
					</div>
					{orderDetails.pricingType === 'PER_UNIT' &&
						orderDetails.unitName && (
							<p className='text-xs text-foreground/50 pl-3 mt-1'>
								Per {orderDetails.unitName}
							</p>
						)}
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
				<p className='font-semibold text-lg mt-2 pl-3'>
					{formatCurency(orderDetails.totalAmount)}
				</p>
			</div>
		</div>
	);
};

export default OrderInfoItem;
