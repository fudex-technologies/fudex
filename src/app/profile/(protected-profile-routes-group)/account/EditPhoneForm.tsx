'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const EditPhoneForm = () => {
	return (
		<form className='w-full flex flex-col gap-5 max-w-lg'>
			<Label
				htmlFor='phone'
				className='w-full flex flex-col items-start gap-2'>
				Phone Number
				<Input
					type='tel'
					className='w-full py-7 text-lg'
					placeholder='Enter your phone number'
					name='phone'
					id='phone'
				/>
			</Label>
			<Button
				type='submit'
				variant={'game'}
				className='w-full py-7 mt-10'>
				Update phone number
			</Button>
		</form>
	);
};

export default EditPhoneForm;
