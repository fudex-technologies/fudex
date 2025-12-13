import { Plus } from 'lucide-react';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { formatCurency, shortenText } from '@/lib/commonFunctions';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';

const ProductListItem = ({
	name,
	image,
	description,
	price,
}: {
	name: string;
	image: string;
	description: string;
	price: number;
}) => {
	return (
		<Link
			href={PAGES_DATA.vendor_product_page('1', '3')}
			className='w-full min-h-[100px] flex relative gap-2 p-5'>
			<ImageWithFallback
				src={image}
				alt={name}
				className='h-full max-h-[100px] aspect-square object-cover rounded-md'
			/>
			<div className='flex-1 flex justify-between flex-wrap gap-x-2 py-1'>
				<div className='flex flex-col'>
					<p className=''>{shortenText(name, 30)}</p>
					<p className='text-foreground/50 text-sm'>{(shortenText(description, 50))}</p>
				</div>
				<p className=' text-sm'>From {formatCurency(price)}</p>
			</div>

			<div className='absolute bottom-5 right-5 p-1 rounded-full flex items-center justify-center bg-primary text-primary-foreground'>
				<Plus width={15} height={15} />
			</div>
		</Link>
	);
};

export default ProductListItem;
