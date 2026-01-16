'use client';

import StarRatingComponent from '@/components/StarRatingComponent';
import { Separator } from '@/components/ui/separator';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { Skeleton } from '@/components/ui/skeleton';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

const SingleVendorReviewsSection = ({ vendorId }: { vendorId: string }) => {
	const { useGetVendorById, useVendorReviewsInfinite } =
		useVendorProductActions();
	const { data: vendor, isLoading: vendorLoading } = useGetVendorById({
		id: vendorId,
	});
	const {
		data: reviewsData,
		isLoading: reviewsLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useVendorReviewsInfinite(vendorId, 10);

	const { ref, inView } = useInView();

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	const allReviews = reviewsData?.pages.flatMap((page) => page.items) ?? [];
	const rating = vendor?.reviewsAverage || 0;
	const reviewCount = vendor?.reviewsCount || 0;

	return (
		<>
			<Separator />
			<div className='max-w-lg mx-auto w-full py-5'>
				{vendorLoading ? (
					<div className='w-full flex items-center justify-center p-5 flex-col gap-5'>
						<Skeleton className='h-12 w-16' />
						<Skeleton className='h-6 w-32' />
						<Skeleton className='h-4 w-40' />
					</div>
				) : (
					<div className='w-full flex items-center justify-center p-5 flex-col gap-5'>
						<h1 className='font-semibold text-3xl'>
							{rating > 0 ? rating.toFixed(1) : 'N/A'}
						</h1>
						<StarRatingComponent
							hoverEffect={false}
							rating={Math.round(rating)}
						/>
						<p className='text-foreground/70'>
							{rating > 0 ? rating.toFixed(1) : 'No rating'} (
							{reviewCount} review{reviewCount !== 1 ? 's' : ''})
						</p>
					</div>
				)}
			</div>
			<Separator />

			<div className='max-w-lg mx-auto w-full px-5'>
				<h3 className='font-semibold text-lg my-5'>Reviews</h3>
				<div className='w-full flex flex-col gap-5'>
					{reviewsLoading ? (
						// Loading skeletons
						[1, 2, 3].map((i) => (
							<div
								key={i}
								className='w-full pt-5 border-t space-y-2'>
								<div className='w-full flex items-start justify-between'>
									<div className='space-y-2'>
										<Skeleton className='h-4 w-24' />
										<Skeleton className='h-3 w-16' />
									</div>
									<Skeleton className='h-4 w-32' />
								</div>
								<Skeleton className='h-16 w-full' />
							</div>
						))
					) : allReviews.length === 0 ? (
						<p className='text-center text-foreground/60 py-10'>
							No reviews yet. Be the first to review!
						</p>
					) : (
						<>
							{allReviews.map((review) => (
								<div
									key={review.id}
									className='w-full pt-5 border-t space-y-2'>
									<div className='w-full flex items-start justify-between'>
										<div>
											<p className='font-medium'>
												{review.user?.name ||
													'Anonymous'}
											</p>
											<StarRatingComponent
												hoverEffect={false}
												rating={review.rating}
												starSize={10}
											/>
										</div>
										<p className='text-foreground/50 text-sm'>
											{formatDistanceToNow(
												new Date(review.createdAt),
												{
													addSuffix: true,
												}
											)}
										</p>
									</div>
									{review.comment && (
										<p className='text-foreground/80'>
											{review.comment}
										</p>
									)}
								</div>
							))}

							{/* Infinite scroll trigger */}
							{hasNextPage && (
								<div
									ref={ref}
									className='w-full py-4 flex justify-center'>
									{isFetchingNextPage ? (
										<div className='space-y-2 w-full'>
											<div className='w-full pt-5 border-t space-y-2'>
												<div className='w-full flex items-start justify-between'>
													<div className='space-y-2'>
														<Skeleton className='h-4 w-24' />
														<Skeleton className='h-3 w-16' />
													</div>
													<Skeleton className='h-4 w-32' />
												</div>
												<Skeleton className='h-16 w-full' />
											</div>
										</div>
									) : null}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default SingleVendorReviewsSection;
