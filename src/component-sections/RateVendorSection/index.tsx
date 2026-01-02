'use client';

import StarRatingComponent from '@/components/StarRatingComponent';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { useState } from 'react';

const RateVendorSection = ({ vendorId }: { vendorId: string }) => {
	const [rating, setRating] = useState(5);
	const [review, setreview] = useState('');
	return (
		<SectionWrapper className='space-y-5  max-w-lg w-full mx-auto px-0!'>
			<h3 className='w-full text-center font-bold text-xl p-5'>
				How would you rate your order from Bukolaryy?
			</h3>

			<Separator className='w-full ' />

			<div className='p-5 flex flex-col items-center justify-center gap-5'>
				<p className='font-light text-foreground/50'>
					Your overall rating
				</p>
				<StarRatingComponent
					rating={rating}
					setRating={setRating}
					className={'gap-5'}
					starSize={50}
				/>
				<p className='font-light text-foreground/50'>
					Tap a star to rate
				</p>
			</div>

			<Separator className='w-full ' />

			<div className='space-y-2 px-5'>
				<Label htmlFor='review' className='text-lg font-light'>
					Write a short review
				</Label>
				<Textarea
					id='review'
					value={review}
					onChange={(e) => setreview(e.target.value)}
					className='w-full'
					placeholder='Enter here'
				/>
			</div>
			<div className='w-full px-5 mt-10'>
				<Button
					disabled={!review}
					variant={'game'}
					className='w-full  py-6'>
					Submit
				</Button>
			</div>
		</SectionWrapper>
	);
};

export default RateVendorSection;
