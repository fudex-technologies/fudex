import VendorDashboardMobileBottomNav from '@/components/navigation-components/VendorDashboardMobileBottomNav';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { Plus } from 'lucide-react';
import ProductItemListItem from './ProductItemListItem';
import { Separator } from '@/components/ui/separator';

export default function VendorDashboardmenuPage() {
	return (
		<PageWrapper
			className={
				'max-w-none w-full bg-secondary p-0 flex justify-center items-center'
			}>
			<div className='w-full max-w-[1400px] flex flex-col'>
				<div className='flex-1 w-full flex md:h-screen items-center justify-center py-10 '>
					<div className='flex items-center gap-10 w-full px-5 text-white'>
						<h1 className='font-semibold text-xl'>Menu</h1>
					</div>
				</div>
				<div className='flex-2 w-full min-h-[90vh] md:min-h-screen flex justify-center  bg-background rounded-t-4xl p-5'>
					<div className='w-full max-w-lg space-y-5'>
						<div className='w-full flex items-center justify-between'>
							<p className='text-primary'>Total Menu items (6)</p>
							<Button>
								<Plus />
								Add New Menu Item
							</Button>
						</div>

						<div className='w-full'>
							<Accordion
								type='single'
								collapsible
								className='w-full'>
								<AccordionItem
									value='note-to-store'
									className='border-b! border-foreground/50'>
									<AccordionTrigger>
										<p>Jollof Rice</p>
									</AccordionTrigger>
									<AccordionContent className='w-full'>
										<div className='w-full flex items-center gap-2'>
											<Button size={'sm'}>
												+ Add Product Item
											</Button>
											<Button
												size={'sm'}
												variant={'link'}>
												Edit Menu Item
											</Button>
										</div>
										<p className='font-bold my-2'>
											Product Items
										</p>
										<ProductItemListItem />
										<Separator />
										<ProductItemListItem />
										<Separator />
										<ProductItemListItem />
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						</div>
					</div>
				</div>
			</div>
			<VendorDashboardMobileBottomNav />
		</PageWrapper>
	);
}
