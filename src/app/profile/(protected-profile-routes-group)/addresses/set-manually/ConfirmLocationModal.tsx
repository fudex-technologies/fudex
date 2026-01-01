'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Dispatch, SetStateAction } from 'react';

interface ILocationData {
	address: string;
	city: string;
	country: string;
}
const ConfirmLocationModal = ({
	open,
	setOpen,
	locationData,
	handleAddAddress,
	pending,
}: {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	locationData: ILocationData;
	handleAddAddress?: () => void;
	pending?: boolean;
}) => {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className='p-5 rounded-xl'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-bold'>
						Confirm Location
					</DialogTitle>
				</DialogHeader>
				<div className='w-full flex flex-col gap-3 my-5'>
					<div className='w-full flex gap-2'>
						<p className='text-foreground/50'>Address:</p>
						<p>{locationData.address}</p>
					</div>
					<div className='w-full flex gap-2'>
						<p className='text-foreground/50'>City:</p>
						<p>{locationData.city}</p>
					</div>
					<div className='w-full flex gap-2'>
						<p className='text-foreground/50'>Country:</p>
						<p>{locationData.country}</p>
					</div>
				</div>
				<DialogFooter className='flex flex-col gap-2'>
					<Button
						disabled={pending}
						type='submit'
						className='flex-1  py-3'
						variant={'game'}
						size={'lg'}
						onClick={() => {
							handleAddAddress && handleAddAddress();
						}}>
						{pending ? 'Saving...' : 'Confirm & Save'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmLocationModal;
