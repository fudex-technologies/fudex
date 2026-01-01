import { Dispatch, SetStateAction } from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '../ui/alert-dialog';
import { ClassNameValue } from 'tailwind-merge';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const ConfirmationAlertDialogue = ({
	open,
	setOpen,
	action,
	title,
	subtitle,
	buttonClassName,
	buttonVariant,
	buttonActionLabel,
}: {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	action: () => void;
	title?: string;
	subtitle?: string;
	buttonClassName?: ClassNameValue;
	buttonVariant?: string;
	buttonActionLabel?: string;
}) => {
	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{title ? title : 'Are you sure?'}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{subtitle
							? subtitle
							: 'Are you sure you want to perform this cation?'}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button
							variant={buttonVariant as any}
							className={cn(buttonClassName)}
							onClick={action}>
							{buttonActionLabel || 'Confirm'}
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default ConfirmationAlertDialogue;
