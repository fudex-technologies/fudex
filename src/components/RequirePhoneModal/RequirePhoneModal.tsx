'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import InputField from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import { useProfileActions } from '@/api-hooks/useProfileActions';
import { localStorageStrings } from '@/constants/localStorageStrings';
import { PAGES_DATA } from '@/data/pagesData';
import { usePathname, useRouter } from 'next/navigation';
import { usePopupStore } from '@/store/popup-store';
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
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';

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
	const trpc = useTRPC();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState<IFormData>(initialFormData);
	const [touched, setTouched] = useState<IFormTouchedData>({});
	const [debouncedPhone, setDebouncedPhone] = useState('');
	const [availabilityError, setAvailabilityError] = useState<string | null>(
		null,
	);
	const pathname = usePathname();

	// Debounce phone input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedPhone(form.phone);
		}, 800);

		return () => clearTimeout(timer);
	}, [form.phone]);

	// Check phone availability
	const { data: phoneCheckData, isLoading: isCheckingPhone } = useQuery(
		trpc.phoneAuth.checkPhoneInUse.queryOptions(
			{ phone: debouncedPhone },
			{
				enabled:
					!!debouncedPhone &&
					validatePhoneNumberRegex(debouncedPhone) &&
					open,
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

	const { enqueuePopup, dequeuePopup, activePopup } = usePopupStore();

	useEffect(() => {
		if (
			pathname === '/' &&
			session &&
			session.user &&
			!(session.user as ExtendedUser)?.phone
		) {
			const lastShownString = localStorage.getItem(
				localStorageStrings.requirePhoneModalLastShown,
			);
			if (lastShownString) {
				const lastShown = new Date(lastShownString).getTime();
				const now = new Date().getTime();
				const oneHour = 60 * 60 * 1000;
				if (now - lastShown > oneHour) {
					enqueuePopup('require_phone');
				}
			} else {
				enqueuePopup('require_phone');
			}
		} else {
			dequeuePopup('require_phone');
		}
	}, [session, pathname, enqueuePopup, dequeuePopup]);

	useEffect(() => {
		if (activePopup === 'require_phone') {
			setOpen(true);
			localStorage.setItem(
				localStorageStrings.requirePhoneModalLastShown,
				new Date().toISOString(),
			);
		} else {
			setOpen(false);
		}
	}, [activePopup]);

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
	const isFormValid =
		Object.keys(errorsNow).length === 0 && !availabilityError;

	const handleSubmit = () => {
		setTouched({
			phone: true,
		});
		if (!isFormValid || isCheckingPhone) return;

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
						error={
							touched.phone &&
							(errorsNow.phone || availabilityError)
						}
						hint={
							isCheckingPhone
								? 'Checking availability...'
								: availabilityError || undefined
						}
						required
					/>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button
							variant='ghost'
							onClick={() => {
								setOpen(false);
								dequeuePopup('require_phone');
							}}>
							Cancel
						</Button>
					</DialogClose>
					<Button
						variant='game'
						onClick={handleSubmit}
						disabled={isPending || !isFormValid || isCheckingPhone}>
						{isPending ? 'Sending...' : 'Send code'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
