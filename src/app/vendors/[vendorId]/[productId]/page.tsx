import ProductDetailsSelectionSection from '@/component-sections/ProductDetailsSelectionSection';
import { Button } from '@/components/ui/button';
import { formatCurency } from '@/lib/commonFunctions';

interface Props {
	params: Promise<{ vendorId: string; productId: string }>;
}

export default async function VendorSingleProductPage({ params }: Props) {
	const { productId } = await params;

	return (
		<>
			<div className='flex flex-col gap-2 px-5'>
				<h1 className='font-semibold text-2xl'>Special Fried Rice </h1>
				<p className='text-foreground/50'>
					Flavorful basmatic fried rice with veggies{' '}
				</p>
				<p className='text-foreground/70'>From #1200.00</p>
			</div>

			<ProductDetailsSelectionSection />
		</>
	);
}
