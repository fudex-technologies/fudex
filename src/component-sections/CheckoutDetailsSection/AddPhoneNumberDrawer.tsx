'use client';

import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import InputField from '@/components/InputComponent';
import { useState } from 'react';
import { useProfileActions } from '@/api-hooks/useProfileActions';
import { validatePhoneNumberRegex } from '@/lib/commonFunctions';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface AddPhoneNumberDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	redirectUrl: string;
}

export default function AddPhoneNumberDrawer({
	isOpen,
	onClose,
	redirectUrl,
}: AddPhoneNumberDrawerProps) {
	const [phone, setPhone] = useState('');
	const [touched, setTouched] = useState(false);
	const { updateProfile } = useProfileActions();
	const router = useRouter();

	const { mutate, isPending } = updateProfile({
		onSuccess: () => {
			onClose();
			router.push(
				`${
					PAGES_DATA.profile_verify_phone_page
				}?redirect=${encodeURIComponent(redirectUrl)}`
			);
		},
	});

	const validate = () => {
		if (!phone) return 'Phone number is required';
		if (!validatePhoneNumberRegex(phone))
			return 'Invalid phone number format';
		return null;
	};

	const error = validate();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setTouched(true);
		if (error) return;
		mutate({ phone });
	};

	return (
		<Drawer open={isOpen} onOpenChange={onClose}>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Add Phone Number</DrawerTitle>
				</DrawerHeader>
				<form onSubmit={handleSubmit} className='p-4 space-y-4 mb-10'>
					<InputField
						type='tel'
						label='Phone number'
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						placeholder='7012345678'
						icon={
							<ImageWithFallback
								src={'/assets/nigeriaflagicon.svg'}
								className='w-5 h-5'
							/>
						}
						error={(touched as any) && (error as any)}
						hint='Make sure your phone number is correct and accessible by you'
						required
					/>
					<Button
						type='submit'
						className='w-full'
						disabled={isPending || !!error}>
						{isPending ? 'Saving...' : 'Save and Verify'}
					</Button>
				</form>
			</DrawerContent>
		</Drawer>
	);
}
