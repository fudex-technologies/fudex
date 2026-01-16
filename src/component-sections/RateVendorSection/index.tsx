'use client';

import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import StarRatingComponent from '@/components/StarRatingComponent';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';

const RateVendorSection = ({ vendorId }: { vendorId: string }) => {
	const [rating, setRating] = useState(5);
	const [review, setreview] = useState('');
	const router = useRouter();

	const { useGetVendorById, addReview } = useVendorProductActions();
	const { data: vendor, isLoading } = useGetVendorById({ id: vendorId });

	const { mutate: addReviewMutate, isPending: isAddingReview } = addReview({
		silent: false,
		onSuccess: () => {
			router.push(PAGES_DATA.single_vendor_reviews_page(vendorId));
		},
	});

	const handleSubmitSubmit = () => {
		const payload = {
			vendorId,
			comment: review,
			rating,
		};
		addReviewMutate(payload);
	};

	if (isLoading) {
		return (
			<SectionWrapper className='space-y-5  max-w-lg w-full mx-auto px-0!'>
				<div className='w-full flex justify-center p-5'>
					<Skeleton className='h-8 w-3/4' />
				</div>
				<Separator className='w-full ' />
				<div className='p-5 flex flex-col items-center justify-center gap-5'>
					<Skeleton className='h-4 w-32' />
					<div className='flex gap-5'>
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton
								key={i}
								className='h-12 w-12 rounded-full'
							/>
						))}
					</div>
					<Skeleton className='h-4 w-24' />
				</div>

				<Separator className='w-full ' />

				<div className='space-y-2 px-5'>
					<Skeleton className='h-6 w-40' />
					<Skeleton className='h-32 w-full' />
				</div>
				<div className='w-full px-5 mt-10'>
					<Skeleton className='h-14 w-full' />
				</div>
			</SectionWrapper>
		);
	}

	if (!vendor) {
		return (
			<SectionWrapper className='space-y-5'>
				<p className='text-foreground/50'>Vendor not found</p>
			</SectionWrapper>
		);
	}

	return (
		<SectionWrapper className='space-y-5  max-w-lg w-full mx-auto px-0!'>
			{vendor?.name && (
				<h3 className='w-full text-center font-bold text-xl p-5'>
					How would you rate your order from {vendor.name}?
				</h3>
			)}

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
					disabled={!review || isAddingReview}
					variant={'game'}
					className='w-full  py-6'
					onClick={handleSubmitSubmit}>
					Submit
				</Button>
			</div>
		</SectionWrapper>
	);
};

export default RateVendorSection;
