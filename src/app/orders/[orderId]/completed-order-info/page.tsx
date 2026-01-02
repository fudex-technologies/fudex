import CompletedOrderDetailsSection from '@/component-sections/completedOrderDetailsSection';
import GoBackButton from '@/components/GoBackButton';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import PageWrapper from '@/components/wrapers/PageWrapper';

interface Props {
	params: Promise<{ orderId: string }>;
}

export default async function CompletedOrderSummaryPage({ params }: Props) {
	const { orderId } = await params;
	return (
		<PageWrapper className='bg-success max-w-none h-auto p-0 pt-5 m-0'>
			<div className='w-full space-y-5 px-5'>
				<GoBackButton className={'bg-white/30 text-white'} />
				<div className='w-full mx-auto max-w-lg flex items-center gap-2'>
					<div className='p-1 rounded-lg flex justify-center items-center bg-background'>
						<ImageWithFallback
							src={'/assets/fudex-tackout-pack.png'}
							className='w-[50px] aspect-square object-cover'
						/>
					</div>
					<div className='flex-1 text-white'>
						<p className='text-lg font-light'>#FDX-238491</p>
						<h3 className='text-lg font-bold'>Package Delivered</h3>
					</div>
				</div>
			</div>
			<div className='w-full h-full bg-background rounded-4xl m-0'>
				<div className='w-full mx-auto max-w-lg flex items-center gap-2'>
                    <CompletedOrderDetailsSection orderId={orderId}/>
                </div>
			</div>
		</PageWrapper>
	);
}
