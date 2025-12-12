import RestaurantCard from '@/components/RestaurantCard';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { restaurantsDDummyData } from '@/lib/dummyData';

const RestaurantsListSection = ({ title }: { title?: string }) => {
	return (
		<SectionWrapper className='w-full flex flex-col gap-3'>
			{title && <h2 className='text-lg font-semibold '>{title}</h2>}
			<div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
				{restaurantsDDummyData.map((restaurant, index) => (
					<RestaurantCard {...restaurant} key={index} />
				))}
			</div>
		</SectionWrapper>
	);
};

export default RestaurantsListSection;
