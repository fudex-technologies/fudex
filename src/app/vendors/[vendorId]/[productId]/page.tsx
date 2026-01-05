import ProductDetailsSelectionSection from '@/component-sections/ProductDetailsSelectionSection';
import SingleVendorTopSection from '@/component-sections/SingleVendorTopSection';
import { formatCurency } from '@/lib/commonFunctions';
import { caller } from '@/trpc/server';
import { Suspense } from 'react';

interface Props {
	params: Promise<{ vendorId: string; productId: string }>;
}

export default async function VendorSingleProductPage({ params }: Props) {
	const { productId, vendorId } = await params;

	const product = await caller.vendors.getProductWithItems({ id: productId });

	if (!product) {
		return (
			<>
				<SingleVendorTopSection vendorId={vendorId} />
				<div>Product not found</div>
			</>
		);
	}

	const minPrice =
		product.items.length > 0
			? Math.min(...product.items.map((item) => item.price))
			: 0;

	return (
		<>
			<SingleVendorTopSection vendorId={vendorId} />
			<div className='flex flex-col gap-2 px-5'>
				<h1 className='font-semibold text-2xl'>{product.name}</h1>
				{product.description && (
					<p className='text-foreground/50'>{product.description}</p>
				)}
				{minPrice > 0 && (
					<p className='text-foreground/70'>
						From {formatCurency(minPrice)}
					</p>
				)}
			</div>

			<Suspense fallback={<div className='p-5'>Loading product details...</div>}>
				<ProductDetailsSelectionSection
					productId={productId}
					vendorId={vendorId}
					productItems={product.items}
				/>
			</Suspense>
		</>
	);
}
