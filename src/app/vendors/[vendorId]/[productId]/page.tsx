import ProductDetailsSelectionSection from '@/component-sections/ProductDetailsSelectionSection';
import CounterComponent from '@/components/CounterComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
				<p className='text-foreground/50 text-sm'>
					Flavorful basmatic fried rice with veggies{' '}
				</p>
				<p className='text-foreground/70'>From #1200.00</p>
			</div>

			<ProductDetailsSelectionSection />

			<>
				<div className='mb-[110px]' />
				<div className='fixed bottom-0 left-0 w-screen bg-background border-t border-t-[#85858540] h-[100px] text-[#858585] px-5 flex justify-center'>
					<div className='w-full h-full flex items-center justify-between max-w-[1400px]'>
						<div className=''>
							<p className='text-sm text-foreground/50'>Total</p>
							<p className='text-xl font-semibold'>
								{formatCurency(1500)}
							</p>
						</div>
						<Button
							variant={'game'}
							size={'lg'}
							className=''>
							Add to tray
						</Button>
					</div>
				</div>
			</>
		</>
	);
}
