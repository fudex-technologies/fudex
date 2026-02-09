'use client';

import React, { useState, useEffect } from 'react';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CardCustomizationDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (message: string) => void;
	initialMessage?: string;
	maxLength?: number;
}

const CardCustomizationDrawer: React.FC<CardCustomizationDrawerProps> = ({
	isOpen,
	onClose,
	onSave,
	initialMessage = '',
	maxLength = 500,
}) => {
	const [message, setMessage] = useState(initialMessage);

	useEffect(() => {
		if (isOpen) {
			setMessage(initialMessage);
		}
	}, [isOpen, initialMessage]);

	const handleSave = () => {
		onSave(message);
		onClose();
	};

	const remainingChars = maxLength - message.length;

	return (
		<Drawer open={isOpen} onOpenChange={onClose}>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Customize Your Card Message</DrawerTitle>
					<DrawerDescription>
						Write a personal message to be included with your gift
					</DrawerDescription>
				</DrawerHeader>
				<div className='p-4 space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='card-message'>Your Message</Label>
						<Textarea
							id='card-message'
							placeholder='Write your heartfelt message here...'
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							maxLength={maxLength}
							className='min-h-[150px] resize-none'
						/>
						<div className='flex justify-between items-center text-sm text-muted-foreground'>
							<span>This message will be printed on the card</span>
							<span
								className={cn(
									remainingChars < 50 && 'text-warning',
									remainingChars === 0 && 'text-destructive'
								)}>
								{remainingChars} characters remaining
							</span>
						</div>
					</div>
				</div>
				<DrawerFooter>
					<Button onClick={handleSave} disabled={!message.trim()}>
						Save Message
					</Button>
					<DrawerClose asChild>
						<Button variant='outline'>Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
};

export default CardCustomizationDrawer;

