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
import { signOut } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Dispatch, SetStateAction } from 'react';
import { Separator } from '../ui/separator';

const ConfirmLogoutModal = ({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
	const logoutHandler = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					toast.success('Logged out');
				},
			},
		});
	};
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className='p-5 rounded-xl'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-bold'>
						Log out
					</DialogTitle>
					<DialogDescription>
						Are you sure you want to log out?
					</DialogDescription>
				</DialogHeader>
				<Separator orientation='horizontal' className='mt-5' />
				<DialogFooter className='flex flex-row gap-2 '>
					<Button
						type='submit'
						className='flex-1 py-3'
						variant={'ghost'}
						size={'lg'}
						onClick={() => setOpen(false)}>
						No
					</Button>
					<Separator orientation='vertical' />
					<Button
						type='submit'
						className='flex-1 text-destructive py-3'
						variant={'ghost'}
						size={'lg'}
						onClick={() => {
							logoutHandler()
								.then(() => {
									setOpen(false);
								})
								.catch(() => {
									toast.error(
										'Error logging out please try again'
									);
								});
						}}>
						Yes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmLogoutModal;
