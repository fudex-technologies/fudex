'use client';

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { formatCurency, shortenText } from '@/lib/commonFunctions';
import { ChevronRight } from 'lucide-react';
import { PiMapPinAreaBold } from 'react-icons/pi';
import { PiStorefrontBold } from 'react-icons/pi';
import { FaBicycle } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

const CheckoutDetailsSection = () => {
	return (
		<div className='w-full flex justify-center pb-10'>
			<div className='max-w-lg w-full flex flex-col'>
				<div className='w-full flex flex-col'>
					<div className='px-5 py-2 bg-muted text-muted-foreground'>
						<p className='text-lg font-bold'>Your order</p>
					</div>
					<div className='flex items-center justify-between p-5'>
						<p>
							2 items from{' '}
							<span className='text-primary'>Bukolary</span>
						</p>
						<ChevronRight size={14} />
					</div>
				</div>

				<div className='w-full flex flex-col'>
					<div className='px-5 py-2 bg-muted text-muted-foreground'>
						<p className='text-lg font-bold'>Delivery address</p>
					</div>
					<div className='flex items-center justify-between p-5'>
						<div className='flex gap-2 items-center'>
							<PiMapPinAreaBold size={20} />
							<p>
								{shortenText(
									'Road 5, Iworoko rd, Ekiti Ado-Ekiti',
									25
								)}
							</p>
						</div>
						<ChevronRight size={14} />
					</div>
				</div>

				<div className='w-full flex flex-col'>
					<div className='px-5 py-2 bg-muted text-muted-foreground'>
						<p className='text-lg font-bold'>Instructions</p>
					</div>
					<div className='w-full px-5'>
						<Accordion type='single' collapsible className='w-full'>
							<AccordionItem
								value='note-to-store'
								className='py-2 border-b! border-foreground/50'>
								<AccordionTrigger>
									<div className='flex gap-2 items-center text-base font-normal'>
										<PiStorefrontBold size={20} />
										<p>Note to store</p>
									</div>
								</AccordionTrigger>
								<AccordionContent className='w-full'>
									<Textarea
										placeholder='Add delivery instructions'
										className='w-full resize-none'
										rows={4}
									/>
								</AccordionContent>
							</AccordionItem>

							<AccordionItem
								value='note-to-rider'
								className='py-2'>
								<AccordionTrigger>
									<div className='flex gap-2 items-center text-base font-normal'>
										<FaBicycle size={20} />
										<p>Note to rider</p>
									</div>
								</AccordionTrigger>
								<AccordionContent className='w-full'>
									<Textarea
										placeholder='Add note to rider'
										className='w-full resize-none'
										rows={4}
									/>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</div>

				<div className='w-full flex flex-col'>
					<div className='px-5 py-2 bg-muted text-muted-foreground'>
						<p className='text-lg font-bold'>Payment Summary</p>
					</div>
					<div className='py-5 space-y-2'>
						<div className='flex items-center justify-between px-5'>
							<p>Sub-total (2 items)</p>
							<p className='font-semibold'>
								{formatCurency(14000)}
							</p>
						</div>
						<div className='flex items-center justify-between px-5'>
							<p>Delivery fee</p>
							<p className='font-semibold'>
								{formatCurency(600)}
							</p>
						</div>
						<div className='flex items-center justify-between px-5'>
							<p>Service fee</p>
							<p className='font-semibold'>
								{formatCurency(300)}
							</p>
						</div>
						<div className='flex items-center justify-between px-5'>
							<p className='font-semibold'>Total</p>
							<p className='font-semibold'>
								{formatCurency(14900)}
							</p>
						</div>
					</div>
				</div>

				<div className='px-5 py-2 bg-background sticky bottom-5'>
					<Button
						variant={'game'}
						size={'lg'}
						className='w-full'>
						Make Payment
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CheckoutDetailsSection;
