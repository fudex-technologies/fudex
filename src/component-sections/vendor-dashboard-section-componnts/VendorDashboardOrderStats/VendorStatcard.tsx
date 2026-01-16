import { cn } from '@/lib/utils';
import React from 'react';

const VendorStatcard = ({
	icon,
	statNumber,
	title,
	color,
}: {
	icon: React.ReactElement;
	title: string;
	statNumber: number;
	color?: string;
}) => {
	return (
		<div className='rounded-xl border w-full flex flex-col gap-5 shadow-sm p-5'>
			<div
				style={{ backgroundColor: color }}
				className={cn(
					'p-3 w-fit rounded-lg flex items-center justify-center lighteffect text-white',
					color ? `` : 'bg-primary'
				)}>
				{icon}
			</div>
			<p className='font-light text-foreground/50'>{title}</p>
			<p className='font-bold text-2xl'>{statNumber}</p>
		</div>
	);
};

export default VendorStatcard;
