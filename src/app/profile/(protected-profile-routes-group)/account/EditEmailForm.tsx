'use client';

import InputField from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import { validateEmailRegex } from '@/lib/commonFunctions';
import { useState } from 'react';

interface IFormTouchedData {
	email?: true;
}
const EditEmailForm = ({
	email,
	updateProfile,
}: {
	email?: string;
	updateProfile: any;
}) => {
	const [form, setForm] = useState({ email: email || '' });
	const [touched, setTouched] = useState<IFormTouchedData>({});

	const validate = () => {
		const newErrors: any = {};
		if (!form.email) newErrors.email = 'Email is required';
		else if (!validateEmailRegex(form.email))
			newErrors.email = 'Invalid email';

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
			email: true,
		});
		if (!isFormValid) return;
		updateProfile.mutate({ email: form.email });
	};
	return (
		<form
			onSubmit={handleSubmit}
			className='w-full flex flex-col gap-5 max-w-lg'>
			<InputField
				label='Email Address'
				type='email'
				className='w-full py-7 text-lg'
				placeholder='Enter your email address'
				id='email'
				value=''
				onChange={handleChange('email')}
				error={touched.email && errorsNow.email}
				required
			/>
			<Button
				type='submit'
				variant={'game'}
				className='w-full py-7 mt-10'
				disabled={!isFormValid || updateProfile.isPending}>
				{updateProfile.isPending
					? 'Updating...'
					: 'Update Email Address'}
			</Button>
		</form>
	);
};

export default EditEmailForm;
