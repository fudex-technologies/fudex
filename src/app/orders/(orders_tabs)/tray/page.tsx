import { Button, buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Separator } from '@/components/ui/separator';
import { PAGES_DATA } from '@/data/pagesData';
import { formatCurency } from '@/lib/commonFunctions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TrayPage() {
	const isEmpty = false;
	return (
		<div className='w-full'>
			{/* Empty state */}
			{isEmpty && (
				<div className='w-full p-5 flex flex-col gap-5 items-center justify-center my-20'>
					<ImageWithFallback
						src={'/assets/empty-tray.png'}
						className='w-full'
					/>
					<div className='text-center'>
						<h1 className='font-bold text-xl'>
							Your tray is empty
						</h1>
						<p className='text-sm font-light'>
							Add some meals to get started.
						</p>
					</div>
					<Button
						variant={'game'}
						size={'lg'}
						className='w-full mt-10 py-5'>
						Order now
					</Button>
				</div>
			)}

			{/* With data state */}
			{!isEmpty && (
				<div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
					<div className='p-5 border-b border-foreground/50 space-y-2'>
						<div className='w-full flex gap-2'>
							<ImageWithFallback
								width={80}
								height={80}
								src={'/assets/products/prod1.png'}
								className='object-cover rounded-md'
							/>
							<div className='flex-1 flex flex-col gap-5'>
								<div className='w-full flex flex-wrap gap-1 justify-between'>
									<h3 className='text-lg font-normal'>
										Bukolary
									</h3>
									<p className='text-lg font-normal'>
										{formatCurency(6000)}
									</p>
								</div>
								<div className='w-full font-light flex flex-row gap-2'>
									<p>1 item</p>
									<Separator orientation='vertical' />
									<p>20 - 25mins</p>
								</div>
							</div>
						</div>
						<Link
							href={PAGES_DATA.order_summary_page('21123')}
							className={cn(
								buttonVariants({
									variant: 'game',
									size: 'lg',
									className: 'w-full py-5',
								})
							)}>
							Checkout
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}
