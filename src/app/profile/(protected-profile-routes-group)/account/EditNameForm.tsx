'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const EditNameForm = () => {
	return (
		<form className='w-full flex flex-col gap-5 max-w-lg'>
			<Label
				htmlFor='firstname'
				className='w-full flex flex-col items-start gap-2'>
				First Name
				<Input
					className='w-full py-7 text-lg'
					placeholder='Enter your first name'
					name='firstname'
					id='firstname'
				/>
			</Label>
			<Label
				htmlFor='lastname'
				className='w-full flex flex-col items-start gap-2'>
				Last Name
				<Input
					className='w-full py-7 text-lg'
					placeholder='Enter your last name'
					name='lastname'
					id='lastname'
				/>
			</Label>
			<Button
				type='submit'
				variant={'game'}
				className='w-full py-7 mt-10'>
				Update account name
			</Button>
		</form>
	);
};

export default EditNameForm;
