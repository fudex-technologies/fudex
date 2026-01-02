"use client"

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { ClassNameValue } from 'tailwind-merge';

const StarRatingComponent = ({
	rating,
	setRating,
	totalStars = 5,
	starSize = 32,
	className,
	hoverEffect = true,
}: {
	rating: number;
	setRating?: Dispatch<SetStateAction<number>>;
	totalStars?: number;
	starSize?: number;
	className?: ClassNameValue;
	hoverEffect?:boolean;
}) => {
	const [hover, setHover] = useState(0);

	return (
		<div className={cn('flex justify-start gap-1 items-center', className)}>
			{[...Array(totalStars)].map((_, index) => {
				const starValue = index + 1;
				return (
					<button
						type='button'
						key={starValue}
						className='bg-transparent border-none'
						onClick={() => {
							setRating && setRating(starValue);
						}}
						onMouseEnter={() => hoverEffect && setHover(starValue)}
						onMouseLeave={() => hoverEffect && setHover(0)}>
						<Star
							size={starSize}
							fill={
								starValue <= (hover || rating)
									? '#FFC107'
									: '#E4E5E9'
							}
							color={
								starValue <= (hover || rating)
									? '#FFC107'
									: '#E4E5E9'
							}
						/>
					</button>
				);
			})}
		</div>
	);
};

export default StarRatingComponent;
