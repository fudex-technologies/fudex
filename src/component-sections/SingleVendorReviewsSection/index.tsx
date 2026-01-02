import StarRatingComponent from '@/components/StarRatingComponent';
import { Separator } from '@/components/ui/separator';

const SingleVendorReviewsSection = ({ vendorId }: { vendorId: string }) => {
	return (
		<>
			<Separator />
			<div className='max-w-lg mx-auto w-full py-5'>
				<div className='w-full flex items-center justify-center p-5 flex-col gap-5'>
					<h1 className='font-semibold text-3xl'>4.2</h1>
					<StarRatingComponent hoverEffect={false} rating={4} />
					<p>4.9 (326 reviews)</p>
				</div>
			</div>
			<Separator />

			<div className='max-w-lg mx-auto w-full px-5'>
				<h3 className='font-semibold text-lg my-5'>Reviews</h3>
				<div className='w-full flex flex-col gap-5'>
					<div className='w-full pt-5 border-t space-y-2'>
						<div className='w-full flex items-start justify-between'>
							<div className=''>
								<p>Olaide</p>
								<StarRatingComponent
									hoverEffect={false}
									rating={4}
									starSize={10}
								/>
							</div>
							<p className='text-foreground/50'>
								January 20, 2026
							</p>
						</div>
						<p>
							Every food i got tasted nice, i really recommend
							their spag esepcially to everyone
						</p>
					</div>
					<div className='w-full pt-5 border-t space-y-2'>
						<div className='w-full flex items-start justify-between'>
							<div className=''>
								<p>Glory</p>
								<StarRatingComponent
									hoverEffect={false}
									rating={2}
									starSize={10}
								/>
							</div>
							<p className='text-foreground/50'>
								January 20, 2026
							</p>
						</div>
						<p>Nice packaging</p>
					</div>
					<div className='w-full pt-5 border-t space-y-2'>
						<div className='w-full flex items-start justify-between'>
							<div className=''>
								<p>Daniel</p>
								<StarRatingComponent
									hoverEffect={false}
									rating={4}
									starSize={10}
								/>
							</div>
							<p className='text-foreground/50'>
								January 20, 2026
							</p>
						</div>
						<p>Worth the amount, highly recommend</p>
					</div>
				</div>
			</div>
		</>
	);
};

export default SingleVendorReviewsSection;
