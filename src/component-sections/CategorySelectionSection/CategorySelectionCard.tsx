'use client';

import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Skeleton } from '@/components/ui/skeleton';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import { useSearchQueries } from '@/nuqs-hooks/useSearchQueries';
import { useRouter } from 'next/navigation';

const CategorySelectionCard = ({
	image,
	category,
}: {
	image: string;
	category: string;
}) => {
	const [search, setSearch] = useSearchQueries();
	const router = useRouter();

	const handleCatClick = () => {
		const isRemoving = search.cat.includes(category);
		const newCats = isRemoving
			? search.cat.filter((cat) => cat !== category)
			: [...search.cat, category];
		const maybePromise = setSearch({ cat: newCats });
		Promise.resolve(maybePromise)
			.then(() => {
				router.push(`${PAGES_DATA.search_page}?cat=${newCats}`);
			})
			.catch(() => {
				router.push(`${PAGES_DATA.search_page}?cat=${newCats}`);
			});
	};

	const isActive = search.cat.includes(category);
	return (
		<div
			// href={"/search"}
			onClick={handleCatClick}
			className={cn(
				'bg-muted text-muted-foreground flex flex-col gap-2 w-[100px] p-3 rounded-md',
				isActive &&
					'bg-secondary text-secondary-foreground transition-colors ease-linear'
			)}>
			<p className=''>{category}</p>
			<div className='relative w-full'>
				<ImageWithFallback
					src={image}
					alt={category}
					className='object-contain w-full aspect-square'
				/>
			</div>
		</div>
	);
};

export default CategorySelectionCard;


export const CategorySelectionCardSkeleton = () => {
	return (
		<div className='flex flex-col gap-2 w-[100px] p-3 rounded-md'>
			<Skeleton className='h-4 w-3/4' />
			<div className='relative w-full'>
				<Skeleton className='w-full aspect-square' />
			</div>
		</div>
	);
};