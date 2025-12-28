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
import { validatePhoneNumberRegex } from '@/lib/commonFunctions';
import { ImageWithFallback } from '../ui/ImageWithFallback';

interface IFormData {
	phone: string;
}
interface IFormTouchedData {
	phone?: boolean;
}
const initialFormData = {
	phone: '',
};

export default function RequirePhoneModal() {
	const { data: session } = useSession();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState<IFormData>(initialFormData);
	const [touched, setTouched] = useState<IFormTouchedData>({});

	useEffect(() => {
		if (session && session.user && !(session.user as ExtendedUser)?.phone) {
			setOpen(true);
		} else {
			setOpen(false);
		}
	}, [session]);

	const { requestPhoneOtp } = useAuthActions();
	const { mutate: requestOtpMutate, isPending } = requestPhoneOtp({
		onSuccess: () => {
			localStorage.setItem(
				localStorageStrings.onboardingSignupString,
				JSON.stringify({ phone: form.phone })
			);
			router.push(PAGES_DATA.onboarding_verify_number_page);
		},
	});

	const validate = () => {
		const newErrors: any = {};
		if (!form.phone) newErrors.phone = 'Phone number is required';
		else if (!validatePhoneNumberRegex(form.phone))
			newErrors.phone = 'Invalid phone number format';

		return newErrors;
	};
	const errorsNow = validate();
	const isFormValid = Object.keys(errorsNow).length === 0;

	const handleSubmit = () => {
		setTouched({
			phone: true,
		});
		if (!isFormValid) return;

		requestOtpMutate({ phone: form.phone });
	};

	const handleChange =
		(field: string) =>
		(e: React.ChangeEvent<HTMLInputElement> | string) => {
			setForm({
				...form,
				[field]: typeof e === 'string' ? e : e.target.value,
			});
			setTouched({ ...touched, [field]: true });
		};
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
						value={form.phone}
						onChange={handleChange('phone')}
						placeholder='7012345678'
						icon={
							<ImageWithFallback
								src={'/assets/nigeriaflagicon.svg'}
								className='w-5 h-5'
							/>
						}
						error={touched.phone && errorsNow.phone}
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
						onClick={handleSubmit}
						disabled={isPending || !isFormValid}>
						{isPending ? 'Sending...' : 'Send code'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
