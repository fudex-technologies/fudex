'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';

const CancelOrderModal = () => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant={'ghost'} className='flex-1 max-w-xs py-6'>
					Cancel order
				</Button>
			</DialogTrigger>
			<DialogContent className='p-5 rounded-xl'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-bold'>
						Cancel order?
					</DialogTitle>
					<DialogDescription>
						This order is already being prepared and may not be
						refundable. Do you want to continue?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className='flex flex-col gap-2'>
					<Button
						type='submit'
						className='flex-1 border-destructive text-destructive py-3'
						variant={'outline'}
						size={'lg'}>
						Yes, Cancel Order
					</Button>
					<Button
						type='submit'
						className='flex-1 py-3'
						variant={'ghost'}
						size={'lg'}>
						No, Keep Order
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CancelOrderModal;
