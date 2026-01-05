'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Suspense } from 'react';
import CategorySelectionCard, {
	CategorySelectionCardSkeleton,
} from './CategorySelectionCard';
import { useCategoryActions } from '@/api-hooks/useCategoryActions';

const CategorySelectionSection = () => {
	const { useListCategories } = useCategoryActions();
	const { data: categories = [], isLoading } = useListCategories({ take: 20 });

	if (isLoading) {
		return (
			<div className='w-full flex flex-col gap-3'>
				<h2 className='text-xl font-semibold px-5'>Categories</h2>
				<ScrollArea className='w-screen max-w-[1400px] whitespace-nowrap'>
					<div className='flex w-max space-x-4 mx-5'>
						{Array.from({ length: 6 }).map((_, index) => (
							<CategorySelectionCardSkeleton key={index} />
						))}
					</div>
					<ScrollBar orientation='horizontal' hidden />
				</ScrollArea>
			</div>
		);
	}

	return (
		<div className='w-full flex flex-col gap-3'>
			<h2 className='text-xl font-semibold px-5'>Categories</h2>
			{categories.length > 0 ? (
				<ScrollArea className='w-screen max-w-[1400px] whitespace-nowrap'>
					<div className='flex w-max space-x-4 mx-5'>
						{categories.map((category) => (
							<Suspense key={category.id} fallback={<CategorySelectionCardSkeleton />}>
								<CategorySelectionCard
									categoryId={category.id}
									categoryName={category.name}
									image={category.image || '/assets/food/rice.png'}
								/>
							</Suspense>
						))}
					</div>
					<ScrollBar orientation='horizontal' hidden />
				</ScrollArea>
			) : (
				<p className='text-foreground/50 text-center py-8 px-5'>No categories available</p>
			)}
		</div>
	);
};

export default CategorySelectionSection;
