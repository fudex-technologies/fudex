import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Suspense } from 'react';
import CategorySelectionCard, {
	CategorySelectionCardSkeleton,
} from './CategorySelectionCard';

const demoData = [
	{
		category: 'Rice',
		image: '/assets/food/rice.png',
	},
	{
		category: 'Swallow',
		image: '/assets/food/swallow.png',
	},
	{
		category: 'Fast Food',
		image: '/assets/food/shawarma.png',
	},
	{
		category: 'Pasteries',
		image: '/assets/food/meatpie.png',
	},
	{
		category: 'Fast Food',
		image: '/assets/food/shawarma.png',
	},
	{
		category: 'Pasteries',
		image: '/assets/food/meatpie.png',
	},
];
const CategorySelectionSection = () => {
	return (
		<div className='w-full flex flex-col gap-3'>
			<h2 className='text-xl font-semibold px-5'>Categories</h2>
			<ScrollArea className='w-screen max-w-[1400px] whitespace-nowrap'>
				<div className='flex w-max space-x-4 mx-5'>
					{demoData.map((category, index) => (
						<Suspense fallback={<CategorySelectionCardSkeleton />}>
							<CategorySelectionCard
								key={index}
								category={category.category}
								image={category.image}
							/>
						</Suspense>
					))}
				</div>
				<ScrollBar orientation='horizontal' hidden />
			</ScrollArea>
		</div>
	);
};

export default CategorySelectionSection;
