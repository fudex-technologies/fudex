'use client';

import { Plus } from 'lucide-react';
import DynamicCover from '../VendorCover';
import { formatCurency, shortenText } from '@/lib/commonFunctions';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';

interface ProductData {
	id: string;
	name: string;
	description?: string | null;
}

interface ProductItemData {
	id: string;
	name: string;
	description?: string | null;
	price: number;
	images?: string[] | null;
	vendorId: string;
	productId?: string | null;
	product?: ProductData | null;
	slug?: string;
	isActive?: boolean;
	inStock?: boolean;
}

const ProductListItem = ({ productItem }: { productItem: ProductItemData }) => {
	// Use product name if available, otherwise fallback to productItem name
	const displayName = productItem?.product?.name || productItem?.name || '';

	// Use productItem description if available, otherwise fallback to product description
	const description =
		productItem?.description || productItem?.product?.description || '';

	const productId = productItem?.productId || productItem?.id;

	// Build URL with slug as query parameter if available
	const baseUrl = PAGES_DATA.single_vendor_product_page(
		productItem?.vendorId,
		productId,
	);
	const url = productItem?.slug
		? `${baseUrl}?variant=${encodeURIComponent(productItem.slug)}`
		: baseUrl;

	const isAvailable =
		productItem?.isActive !== false && productItem?.inStock !== false;

	return (
		<Link
			href={url}
			onClick={(e) => !isAvailable && e.preventDefault()}
			className={cn(
				'w-full min-h-[100px] flex relative gap-2 p-5 transition-all',
				!isAvailable && 'opacity-60 cursor-not-allowed grayscale-[0.5]',
			)}>
			<div className='relative w-[100px] h-[100px] shrink-0'>
				<DynamicCover
					src={
						productItem?.images && productItem?.images?.length > 0
							? productItem?.images[0]
							: null
					}
					alt={displayName}
					className='w-full h-full rounded-md overflow-hidden'
					imageClassName='object-cover'
				/>
				{!isAvailable && (
					<div className='absolute inset-0 bg-black/60 z-1 flex items-center justify-center pointer-events-none'>
						<div className='mx-auto flex flex-col items-center text-white/90 justify-center text-center'>
							<p className='font-bold text-sm uppercase tracking-wider'>
								{productItem?.isActive === false
									? 'Unavailable'
									: 'Sold Out'}
							</p>
						</div>
					</div>
				)}
			</div>
			<div className='flex-1 flex justify-between flex-wrap gap-x-2 py-1'>
				<div className='flex flex-col'>
					<p className='font-medium'>
						{shortenText(
							`${productItem?.product?.name}`,
							30,
						)}
					</p>
					{description && (
						<p className='text-foreground/50 text-sm'>
							{shortenText(description, 50)}
						</p>
					)}
				</div>
				<p className=' text-sm'>
					From {formatCurency(productItem?.price)}
				</p>
			</div>

			{isAvailable && (
				<div className='absolute bottom-5 right-5 p-1 rounded-full flex items-center justify-center bg-primary text-primary-foreground'>
					<Plus width={15} height={15} />
				</div>
			)}
		</Link>
	);
};

export default ProductListItem;
