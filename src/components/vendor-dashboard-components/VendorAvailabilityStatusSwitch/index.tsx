'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

const VendorAvailabilityStatusSwitch = () => {
	const [open, setOpen] = useState(false);
	return (
		<div className='flex items-center gap-2'>
			<p className='text-sm'>Status:</p>

			<div
				onClick={() => setOpen((prev) => !prev)}
				className={cn(
					'relative flex items-center w-fit px-3 py-2 rounded-full cursor-pointer',
					'transition-colors duration-300 ease-out',
					open ? 'bg-primary pr-8' : 'bg-foreground/10 pl-8'
				)}>
				<p
					className={cn(
						'text-sm transition-all duration-300 ease-out',
						open
							? 'text-primary-foreground '
							: 'text-black'
					)}>
					{open ? 'Open' : 'Closed'}
				</p>

				<div
					className={cn(
						'absolute w-5 h-5 rounded-full',
						'transition-transform duration-300 ease-out',
						open
							? 'translate-x-10 bg-primary-foreground'
							: '-translate-x-6 bg-primary'
					)}
				/>
			</div>
		</div>
	);
};

export default VendorAvailabilityStatusSwitch;
