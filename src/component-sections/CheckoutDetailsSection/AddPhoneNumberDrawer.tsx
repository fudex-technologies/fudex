'use client';

import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import InputField from '@/components/InputComponent';
import { useState, useEffect } from 'react';
import { useProfileActions } from '@/api-hooks/useProfileActions';
import { validatePhoneNumberRegex } from '@/lib/commonFunctions';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';

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
	const trpc = useTRPC();
	const [phone, setPhone] = useState('');
	const [touched, setTouched] = useState(false);
	const [debouncedPhone, setDebouncedPhone] = useState('');
	const [availabilityError, setAvailabilityError] = useState<string | null>(
		null,
	);
	const { updateProfile } = useProfileActions();
	const router = useRouter();

	// Debounce phone input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedPhone(phone);
		}, 800);

		return () => clearTimeout(timer);
	}, [phone]);

	// Check phone availability
	const { data: phoneCheckData, isLoading: isCheckingPhone } = useQuery(
		trpc.phoneAuth.checkPhoneInUse.queryOptions(
			{ phone: debouncedPhone },
			{
				enabled:
					!!debouncedPhone &&
					validatePhoneNumberRegex(debouncedPhone) &&
					isOpen,
				retry: false,
			},
		),
	);

	useEffect(() => {
		if (phoneCheckData?.inUse) {
			setAvailabilityError(
				'This phone number is already linked to another account.',
			);
		} else {
			setAvailabilityError(null);
		}
	}, [phoneCheckData]);

	const { mutate, isPending } = updateProfile({
		onSuccess: () => {
			onClose();
			router.push(
				`${
					PAGES_DATA.profile_verify_phone_page
				}?redirect=${encodeURIComponent(redirectUrl)}`,
			);
		},
	});

	const validate = () => {
		if (!phone) return 'Phone number is required';
		if (!validatePhoneNumberRegex(phone))
			return 'Invalid phone number format';
		return availabilityError;
	};

	const error = validate();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setTouched(true);
		if (error || isCheckingPhone) return;
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
						error={touched && ((error || availabilityError) as any)}
						hint={
							isCheckingPhone
								? 'Checking availability...'
								: availabilityError ||
									'Make sure your phone number is correct and accessible by you'
						}
						required
					/>
					<Button
						type='submit'
						className='w-full'
						disabled={isPending || !!error || isCheckingPhone}>
						{isPending ? 'Saving...' : 'Save and Verify'}
					</Button>
				</form>
			</DrawerContent>
		</Drawer>
	);
}
