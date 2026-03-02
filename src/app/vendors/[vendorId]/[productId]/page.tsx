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

	const cheapestItem =
		product.items.length > 0
			? product.items.reduce((min: any, item: any) =>
					item.finalPrice < min.finalPrice ? item : min,
				)
			: null;

	const minPrice = cheapestItem?.finalPrice ?? 0;
	const hasDiscount = cheapestItem?.hasDiscount ?? false;
	const basePrice = (cheapestItem as any)?.basePrice ?? 0;

	return (
		<>
			<SingleVendorTopSection
				image={product?.items[0]?.images[0] ?? undefined}
				vendorId={vendorId}
			/>
			<div className='flex flex-col gap-2 px-5'>
				<h1 className='font-semibold text-2xl'>{product.name}</h1>
				{product.description && (
					<p className='text-foreground/50'>{product.description}</p>
				)}
				{minPrice > 0 && (
					<div className='flex items-center gap-2'>
						<p className='text-foreground/70'>
							From {formatCurency(minPrice)}
						</p>
						{hasDiscount && basePrice > minPrice && (
							<p className='text-sm text-foreground/30 line-through'>
								{formatCurency(basePrice)}
							</p>
						)}
					</div>
				)}
			</div>

			<Suspense
				fallback={
					<div className='p-5'>Loading product details...</div>
				}>
				<ProductDetailsSelectionSection
					vendorId={vendorId}
					productItems={product.items}
				/>
			</Suspense>
		</>
	);
}
