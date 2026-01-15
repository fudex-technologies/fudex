'use client';

import { formatCurency } from '@/lib/commonFunctions';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';
import DynamicCover from '@/components/VendorCover';

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
}

const VendorDashboardProductListItem = ({
	productItem,
}: {
	productItem: ProductItemData;
}) => {
	// Construct display name: "Product Name (Variant Name)" or just "Item Name"
	const displayName = productItem?.product
		? `${productItem.product.name} (${productItem.name})`
		: productItem.name;

	// Use productItem description if available, otherwise fallback to product description
	const description =
		productItem?.description || productItem?.product?.description || '';

	const productId = productItem?.productId || productItem?.id;

	// Build URL with slug as query parameter if available
	const baseUrl = PAGES_DATA.single_vendor_product_page(
		productItem?.vendorId,
		productId
	);
	const url = productItem?.slug
		? `${baseUrl}?variant=${encodeURIComponent(productItem.slug)}`
		: baseUrl;

	return (
		<div className='w-full flex flex-col shrink-0 space-y-1'>
			<div className='relative h-[150px] w-full'>
				<DynamicCover
					src={
						productItem?.images && productItem?.images?.length > 0
							? productItem?.images[0]
							: null
					}
					alt={displayName}
					className='h-full w-full rounded-lg'
					imageClassName='rounded-lg h-full w-full object-cover'
				/>
			</div>

			<div className='w-full flex flex-col gap-1'>
				<div className='flex justify-between items-start gap-2'>
					<p
						className='font-semibold line-clamp-1'
						title={displayName}>
						{displayName}
					</p>
					<p className='text-sm font-medium whitespace-nowrap'>
						{formatCurency(productItem?.price)}
					</p>
				</div>
				{description && (
					<p
						className='text-foreground/50 text-xs line-clamp-2'
						title={description}>
						{description}
					</p>
				)}
			</div>
		</div>
	);
};

export default VendorDashboardProductListItem;
