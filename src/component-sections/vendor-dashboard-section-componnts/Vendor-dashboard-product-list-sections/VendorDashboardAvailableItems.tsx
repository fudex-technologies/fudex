import { buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const VendorDashboardAvailableItems = () => {
	const items: any[] = [];
	return (
		<div className='w-full flex flex-col gap-3 pb-5'>
			<h2 className='text-lg font-semibold px-5'>Available now</h2>
			{items.length > 0 ? (
				<ScrollArea className='w-screen max-w-[1400px] whitespace-nowrap'>
					<div className='flex w-max space-x-4 mx-5'>
						{items.map((item, index) => (
							<div className='w-[250px]' key={index}>
								{/* <RestaurantCard vendor={vendor} /> */}
							</div>
						))}
					</div>
					<ScrollBar orientation='horizontal' hidden />
				</ScrollArea>
			) : (
				<div className='w-full flex flex-col items-center gap-5 justify-center text-center'>
					<ImageWithFallback
						src={'/assets/closed-plate-illustration.png'}
						className='w-[150px]'
						alt='closed plate of food'
					/>
					<div className='w-full'>
						<div className='font-semibold text-lg leading-[100%]'>
							You currently have no available Items
						</div>
						<p className='text-foreground/50 text-center'>
							Add menu to see top selling items
						</p>
					</div>

					<div className='w-full px-5 flex justify-center'>
						<Link
							href={'#'}
							className={cn(
								buttonVariants({
									variant: 'game',
									size: 'lg',
								}),
								'w-full max-w-sm'
							)}>
							Add Menu Items
						</Link>
					</div>
				</div>
			)}
		</div>
	);
};

export default VendorDashboardAvailableItems;
