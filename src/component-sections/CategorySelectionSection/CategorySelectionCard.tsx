'use client';

import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Skeleton } from '@/components/ui/skeleton';
import { PAGES_DATA } from '@/data/pagesData';
import { shortenText } from '@/lib/commonFunctions';
import { cn } from '@/lib/utils';
import { useSearchQueries } from '@/nuqs-hooks/useSearchQueries';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const CategorySelectionCard = ({
	image,
	categoryId,
	categoryName,
}: {
	image: string;
	categoryId: string;
	categoryName: string;
}) => {
	const [search, setSearch] = useSearchQueries();
	const router = useRouter();

	const handleCatClick = () => {
		const isRemoving = search.cat.includes(categoryId);
		const newCats = isRemoving
			? search.cat.filter((cat) => cat !== categoryId)
			: [...search.cat, categoryId];
		const maybePromise = setSearch({ cat: newCats });
		Promise.resolve(maybePromise)
			.then(() => {
				router.push(
					`${PAGES_DATA.search_page}?cat=${newCats.join(',')}`,
				);
			})
			.catch(() => {
				router.push(
					`${PAGES_DATA.search_page}?cat=${newCats.join(',')}`,
				);
			});
	};

	const isActive = search.cat.includes(categoryId);
	return (
		<div
			onClick={handleCatClick}
			className={cn(
				'bg-muted text-muted-foreground flex flex-col gap-2 w-[75px] p-3 rounded-lg shadow-sm border cursor-pointer overflow-hidden',
				isActive &&
					'bg-secondary text-secondary-foreground transition-colors ease-linear border-0',
			)}>
			<p className='text-sm capitalize'>{shortenText(categoryName, 7)}</p>
			<div className='relative w-full aspect-square'>
				<Image
					src={image}
					alt={categoryName}
					className='object-cover'
					fill
				/>
			</div>
		</div>
	);
};

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

export default CategorySelectionCard;
