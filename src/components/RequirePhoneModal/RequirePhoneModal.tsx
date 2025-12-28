'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import InputField from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import { useAuthActions } from '@/api-hooks/useAuthActions';
import { localStorageStrings } from '@/constants/localStorageStrings';
import { PAGES_DATA } from '@/data/pagesData';
import { useRouter } from 'next/navigation';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from '@/components/ui/dialog';
import { ExtendedUser } from '@/lib/auth';

export default function RequirePhoneModal() {
	const { data: session } = useSession();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [phone, setPhone] = useState('');

	const { requestPhoneOtp } = useAuthActions();
	const { mutate: requestOtpMutate, isPending } = requestPhoneOtp({
		onSuccess: () => {
			localStorage.setItem(
				localStorageStrings.onboardingSignupString,
				JSON.stringify({ phone })
			);
			router.push(PAGES_DATA.onboarding_verify_number_page);
		},
	});

	useEffect(() => {
		if (session && session.user && !(session.user as ExtendedUser)?.phone) {
			setOpen(true);
		} else {
			setOpen(false);
		}
	}, [session]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add your phone number</DialogTitle>
					<DialogDescription>
						We need your phone number to verify your account.
					</DialogDescription>
				</DialogHeader>
				<div className='mt-2'>
					<InputField
						type='tel'
						label='Phone number'
						value={phone}
						onChange={(e) => setPhone((e as any).target.value)}
						placeholder='7012345678'
						required
					/>
				</div>
				<DialogFooter>
					<DialogClose>
						<Button variant='ghost' onClick={() => setOpen(false)}>
							Cancel
						</Button>
					</DialogClose>
					<Button
						variant='game'
						onClick={() => requestOtpMutate({ phone })}
						disabled={isPending}>
						{isPending ? 'Sending...' : 'Send code'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
