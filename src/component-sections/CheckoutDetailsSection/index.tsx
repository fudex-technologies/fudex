'use client';

import { ChevronRight } from 'lucide-react';

const CheckoutDetailsSection = () => {
	return (
		<div className='w-full flex justify-center'>
			<div className='max-w-lg w-full flex flex-col'>
                
				<div className='w-full flex flex-col'>
					<div className='px-5 py-2 bg-muted text-muted-foreground'>
						<p className='text-lg font-bold'>Your order</p>
					</div>
					<div className='flex items-center justify-between p-5'>
						<p>
							2 items from{' '}
							<span className='text-primary'>Bukolary</span>
						</p>
                        <ChevronRight />
					</div>
				</div>

				<div className='w-full flex flex-col'>
					<div className='px-5 py-2 bg-muted text-muted-foreground'>
						<p className='text-lg font-bold'>Delivery address</p>
					</div>
					<div className='flex items-center justify-between p-5'>
						<p>
							2 items from{' '}
							<span className='text-primary'>Bukolary</span>
						</p>
                        <ChevronRight />
					</div>
				</div>
			</div>
		</div>
	);
};

export default CheckoutDetailsSection;
