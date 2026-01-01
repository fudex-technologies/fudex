'use client';

import InputField from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface IFormTouchedData {
	firstName?: true;
	lastName?: true;
	nickname?: true;
}

const EditNameForm = ({
	firstName,
	lastName,
	nickname,
	updateProfile,
}: {
	firstName?: string | null;
	lastName?: string | null;
	nickname?: string | null;
	updateProfile: any;
}) => {
	const [form, setForm] = useState({
		firstName: firstName || '',
		lastName: lastName || '',
		nickname: nickname || '',
	});
	const [touched, setTouched] = useState<IFormTouchedData>({});

	const validate = () => {
		const newErrors: any = {};
		if (!form.firstName) newErrors.firstName = 'First name is required';
		if (!form.lastName) newErrors.lastName = 'Last name is required';
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
			firstName: true,
			lastName: true,
			nickname: true,
		});
		if (!isFormValid) return;
		updateProfile.mutate({
			firstName: form.firstName,
			lastName: form.lastName,
			name: form?.nickname,
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='w-full flex flex-col  max-w-lg'>
			<InputField
				label='First Name'
				className=''
				placeholder='Enter your first name'
				id='firstname'
				value={form.firstName}
				onChange={handleChange('firstName')}
				error={touched.firstName && errorsNow.firstName}
				required
			/>
			<InputField
				label='Last Name'
				className=''
				placeholder='Enter your last name'
				id='lastname'
				value={form.lastName}
				onChange={handleChange('lastName')}
				error={touched.lastName && errorsNow.lastName}
				required
			/>
			<InputField
				label='Nick Name'
				className=''
				placeholder='Enter the name people call you'
				id='nickname'
				value={form.nickname}
				onChange={handleChange('nickname')}
				error={touched.nickname && errorsNow.nickname}
			/>
			<Button
				type='submit'
				variant={'game'}
				className='w-full py-7 mt-10'
				disabled={!isFormValid || updateProfile.isPending}>
				{updateProfile.isPending
					? 'Updating...'
					: 'Update account name'}
			</Button>
		</form>
	);
};

export default EditNameForm;
