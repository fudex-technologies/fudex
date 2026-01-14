import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { formatCurency } from '@/lib/commonFunctions';
import React from 'react';

const ProductItemListItem = () => {
	return (
		<div className='w-full py-3 flex gap-2 flex-wrap justify-between items-center'>
			<div className='flex ites-center gap-2'>
				<p>Spaghetti</p>
				<p>{formatCurency(12000)}</p>
			</div>

			<div className='flex items-center gap-2'>
				<Switch />
				<p className='text-primary'>In Stock</p>
				<Button size={'sm'} variant={'ghost'}>
					Edit
				</Button>
			</div>
		</div>
	);
};

export default ProductItemListItem;
