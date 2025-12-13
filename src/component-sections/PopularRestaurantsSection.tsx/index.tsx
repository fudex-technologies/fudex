import RestaurantCard from '@/components/VendorCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { restaurantsDDummyData } from '@/lib/dummyData';

const PopularRestaurantsSection = () => {
	return (
		<div className='w-full flex flex-col gap-3 pb-5'>
			<h2 className='text-lg font-semibold px-5'>Popular Restaurant</h2>
			<ScrollArea className='w-screen max-w-[1400px] whitespace-nowrap'>
				<div className='flex w-max space-x-4 mx-5'>
					{restaurantsDDummyData.map((restaurant, index) => (
						<div className='w-[250px]' key={index}>
							<RestaurantCard {...restaurant}  />
						</div>
					))}
				</div>
				<ScrollBar orientation='horizontal' />
			</ScrollArea>
		</div>
	);
};

export default PopularRestaurantsSection;
