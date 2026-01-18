'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import InputField from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import { useProfileActions } from '@/api-hooks/useProfileActions';
import { localStorageStrings } from '@/constants/localStorageStrings';
import { PAGES_DATA } from '@/data/pagesData';
import { usePathname, useRouter } from 'next/navigation';
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
	const pathname = usePathname()

	useEffect(() => {
		if (
			pathname === '/' &&
			session &&
			session.user &&
			!(session.user as ExtendedUser)?.phone
		) {
			const lastShownString = localStorage.getItem(
				localStorageStrings.requirePhoneModalLastShown
			);
			if (lastShownString) {
				const lastShown = new Date(lastShownString).getTime();
				const now = new Date().getTime();
				const oneHour = 60 * 60 * 1000;
				if (now - lastShown > oneHour) {
					setOpen(true);
				}
			} else {
				setOpen(true);
			}
		} else {
			setOpen(false);
		}
	}, [session, pathname]);

	useEffect(() => {
		if (open) {
			localStorage.setItem(
				localStorageStrings.requirePhoneModalLastShown,
				new Date().toISOString()
			);
		}
	}, [open]);

	const { updateProfile } = useProfileActions();
	const { mutate: updateProfileMutate, isPending } = updateProfile({
		onSuccess: () => {
			// Redirect to profile verification page
			router.push(PAGES_DATA.profile_verify_phone_page);
			setOpen(false);
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

		updateProfileMutate({ phone: form.phone });
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
