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

			<div className='space-y-5'>
				<div className='w-full bg-muted  flex items-center gap-3 p-5 text-lg'>
					<p>Select Size</p>{' '}
					<Badge
						variant={'outline'}
						className='border-destructive text-destructive'>
						Required
					</Badge>
				</div>

				<div className='px-5'>
					<p className='text-lg text-foreground/50'>SELECT 1</p>
					<RadioGroup
						defaultValue='big_pack'
						className='w-full space-y-3'>
						<div className='flex gap-3 w-full  items-center justify-between'>
							<Label htmlFor='r1'>
								<div className=''>
									<p className='text-lg '>Big Pack</p>
									<p className='text-sm'>
										{formatCurency(1500)}
									</p>
								</div>
							</Label>
							<RadioGroupItem
								value='big_pack'
								id='r1'
								className='w-6 h-6'
							/>
						</div>
						<div className='flex gap-3 w-full  items-center justify-between'>
							<Label htmlFor='r2'>
								<div className=''>
									<p className='text-lg '>Small Pack</p>
									<p className='text-sm'>
										{formatCurency(1000)}
									</p>
								</div>
							</Label>
							<RadioGroupItem
								value='small_pack'
								id='r2'
								className='w-6 h-6'
							/>
						</div>
					</RadioGroup>
				</div>

				<div className='p-5'>
					<p className='text-lg'>Number Of Orders</p>
					<div className='p-5 bg-muted text-foreground rounded-full flex text-lg font-semibold'>
						<div className='flex-1 flex items-center justify-center'>
							-
						</div>
						<div className='flex-1 flex items-center justify-center'>
							1
						</div>
						<div className='flex-1 flex items-center justify-center'>
							+
						</div>
					</div>
				</div>
			</div>

			<>
				<div className='mb-[110px]' />
				<div className='fixed flex bottom-0 left-0 w-screen bg-background border-t border-t-[#85858540] h-[100px] text-[#858585] px-5 items-center justify-between'>
					<div className=''>
						<p className='text-sm text-foreground/50'>Total</p>
						<p className='text-xl font-semibold'>
							{formatCurency(1500)}
						</p>
					</div>
					<Button size={"lg"}>Add to tray</Button>
				</div>
			</>
		</>
	);
}
