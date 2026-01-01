'use client';

import InputField from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface IFormTouchedData {
	phone?: true;
}

const EditPhoneForm = ({
	phone,
	updateProfile,
}: {
	phone?: string | null;
	updateProfile: any;
}) => {
	const [form, setForm] = useState({ phone: phone || '' });
	const [touched, setTouched] = useState<IFormTouchedData>({});

	const validate = () => {
		const newErrors: any = {};
		if (!form.phone) newErrors.phone = 'Phone number is required';
		else if (!/^\+?[0-9]{10,14}$/.test(form.phone))
			newErrors.phone = 'Invalid phone number';

		return newErrors;
	};

	const errorsNow = validate();
	const isFormValid = Object.keys(errorsNow).length === 0;

	const handleChange =
		(field: string) =>
		(e: React.ChangeEvent<HTMLInputElement> | string) => {
			setForm({
				...form,
				[field]: typeof e === 'string' ? e : e.target.value,
			});
			setTouched({ ...touched, [field]: true });
		};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setTouched({
			phone: true,
		});
		if (!isFormValid) return;
		updateProfile.mutate({ phone: form.phone });
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='w-full flex flex-col gap-5 max-w-lg'>
			<InputField
				label='Phone Number'
				type='tel'
				className='w-full py-7 text-lg'
				placeholder='Enter your phone number'
				id='phone'
				value={form.phone}
				onChange={handleChange('phone')}
				error={touched.phone && errorsNow.phone}
				required
			/>
			<Button
				type='submit'
				variant={'game'}
				className='w-full py-7 mt-10'
				disabled={!isFormValid || updateProfile.isPending}>
				{updateProfile.isPending
					? 'Updating...'
					: 'Update phone number'}
			</Button>
		</form>
	);
};

export default EditPhoneForm;
