import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const VendorDashboardTopSellingItems = () => {
	const items: any[] = [];
	return (
		<div className='w-full flex flex-col gap-3 pb-5'>
			<h2 className='text-lg font-semibold px-5'> <span className='rotate-12'>👑</span> Top Selling Items</h2>
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
				<div className='w-full flex flex-col items-center gap-2 justify-center text-center'>
					<ImageWithFallback
						src={'/assets/plate-illustration.png'}
						className='w-[150px]'
						alt='plate of food'
					/>
					<p className='text-foreground/50 text-center py-4 px-5'>
						Add menu to see top selling items
					</p>
				</div>
			)}
		</div>
	);
};

export default VendorDashboardTopSellingItems;
