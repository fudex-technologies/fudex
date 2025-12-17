'use client';

import CounterComponent from '@/components/CounterComponent';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { formatCurency } from '@/lib/commonFunctions';
import { useState } from 'react';

const ProductDetailsSelectionSection = () => {
	const [numberOfItems, setNumberOfItems] = useState(1);
	return (
		<div className='space-y-5'>
			<div className='w-full bg-muted  flex items-center gap-3 p-5 text-lg'>
				<p>Select Size</p>{' '}
				<Badge
					variant={'outline'}
					className='border-destructive text-destructive'>
					Required
				</Badge>
			</div>

			<div className='px-5 space-y-2'>
				<p className='text-lg text-foreground/50'>SELECT 1</p>
				<RadioGroup defaultValue='big_pack' className='w-full max-w-sm'>
					<div className='flex gap-3 w-full items-center justify-between'>
						<Label htmlFor='r1' className='flex-1'>
							<div className=''>
								<p className='text-lg '>Big Pack</p>
								<p className='text-foreground/50'>
									{formatCurency(1500)}
								</p>
							</div>
						</Label>
						<RadioGroupItem
							value='big_pack'
							id='r1'
							className='w-6 h-6'
						/>
					</div>
					<Separator />
					<div className='flex gap-3 w-full items-center justify-between'>
						<Label htmlFor='r2' className='flex-1'>
							<div className=''>
								<p className='text-lg '>Small Pack</p>
								<p className='text-foreground/50'>
									{formatCurency(1000)}
								</p>
							</div>
						</Label>
						<RadioGroupItem
							value='small_pack'
							id='r2'
							className='w-6 h-6'
						/>
					</div>
				</RadioGroup>
			</div>

			<div className='p-5 space-y-2'>
				<p className='text-lg'>Number Of Orders</p>
				<CounterComponent
					count={numberOfItems}
					setCount={setNumberOfItems}
				/>
			</div>
		</div>
	);
};

export default ProductDetailsSelectionSection;
