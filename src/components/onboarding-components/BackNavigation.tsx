'use client';

import { useRouter } from 'next/navigation';
import { useNavDirection } from '@/store/nav-direction-store';

export function BackButton() {
	const router = useRouter();
	const setDirection = useNavDirection((s) => s.setDirection);

	return (
		<button
			onClick={() => {
				setDirection('back');
				router.back();
			}}
			className='p-2'>
			←
		</button>
	);
}
