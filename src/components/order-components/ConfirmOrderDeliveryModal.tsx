'use client';

import React, { Dispatch, SetStateAction } from 'react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useOrderingActions } from '@/api-hooks/useOrderingActions';

const ConfirmOrderDeliveryModal = ({
	open,
	setOpen,
	onConfirm,

	orderId,
}: {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	onConfirm?: () => void;
	orderId?: string;
}) => {
	const { useListOngoingOrders, confirmOrderDelivery } = useOrderingActions();
	const { refetch } = useListOngoingOrders({
		take: 50,
	});
	const { mutate: confirmDeliveryMutation, isPending: isConfirmingDelivery } =
		confirmOrderDelivery({
			onSuccess: () => {
				setOpen(false);
				refetch();
				onConfirm && onConfirm();
			},
		});

	const handleConfirmOrderDelivery = (
		e: React.MouseEvent<HTMLButtonElement>,
	) => {
		e.preventDefault();
		e.stopPropagation();
		if (orderId) {
			confirmDeliveryMutation({ orderId });
		}
	};
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						setOpen(true);
					}}
					variant={'game'}
					className='w-full'>
					Confirm Delivery
				</Button>
			</DialogTrigger>
			<DialogContent className='p-5 rounded-xl'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-bold'>
						Confirm Delivery
					</DialogTitle>
				</DialogHeader>

				<p className='my-3 w-full text-center'>
					Please take a moment to confirm that you have received your
					order from the rider. This helps us make sure your delivery
					was completed successfully and keeps our records accurate.
				</p>

				<DialogFooter className='w-full flex flex-col gap-2'>
					<div className='flex flex-col w-full gap-3'>
						<Button
							disabled={isConfirmingDelivery}
							onClick={handleConfirmOrderDelivery}
							variant={'game'}
							className='w-full'>
							Order Recieved
						</Button>
						<Button
							disabled={isConfirmingDelivery}
							onClick={() => setOpen(false)}
							variant={'ghost'}
							className='w-full'>
							Go Back To Order
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmOrderDeliveryModal;
