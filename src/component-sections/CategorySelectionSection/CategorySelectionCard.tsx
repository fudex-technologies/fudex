import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import Link from 'next/link';

const CategorySelectionCard = ({
	image,
	category,
	link,
}: {
	image: string;
	category: string;
	link?: string;
}) => {
	return (
		<Link
			href={link || '#'}
			className='border bg-muted text-muted-foreground flex flex-col gap-2 w-[100px] p-3 rounded-md'>
			<p className=''>{category}</p>
			<div className='relative w-full'>
				<ImageWithFallback
					src={image}
					alt={category}
					className='object-contain w-full aspect-square'
				/>
			</div>
		</Link>
	);
};

export default CategorySelectionCard;
