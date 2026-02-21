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
import { useOrderingActions } from '@/api-hooks/useOrderingActions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import { OrderStatus } from '@prisma/client';

const CancelOrderModal = ({
	orderId,
	status,
}: {
	orderId: string;
	status?: OrderStatus;
}) => {
	const { cancelOrder } = useOrderingActions();
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const cancelMutation = cancelOrder({
		onSuccess: () => {
			setOpen(false);
			router.push(PAGES_DATA.profile_wallet_page);
		},
	});

	const handleCancel = () => {
		cancelMutation.mutate({ orderId });
	};

	const isCancellable = status === OrderStatus.PENDING;

	if (!isCancellable && status) return null;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
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
						Are you sure you want to cancel this order?{' '}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className='flex flex-col gap-2'>
					<Button
						type='button'
						onClick={handleCancel}
						disabled={cancelMutation.isPending}
						className='flex-1 border-destructive text-destructive py-3'
						variant={'outline'}
						size={'lg'}>
						{cancelMutation.isPending
							? 'Cancelling...'
							: 'Yes, Cancel Order'}
					</Button>
					<Button
						type='button'
						onClick={() => setOpen(false)}
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
