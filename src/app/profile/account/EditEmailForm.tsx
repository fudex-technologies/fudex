'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const EditEmailForm = () => {
	return (
		<form className='w-full flex flex-col gap-5 max-w-lg'>
			<Label
				htmlFor='email'
				className='w-full flex flex-col items-start gap-2'>
				Email Address
				<Input
					type='email'
					className='w-full py-7 text-lg'
					placeholder='Enter your email address'
					name='email'
					id='email'
				/>
			</Label>
			<Button
				type='submit'
				variant={'game'}
				className='w-full py-7 mt-10'>
				Update Email Address
			</Button>
		</form>
	);
};

export default EditEmailForm;
