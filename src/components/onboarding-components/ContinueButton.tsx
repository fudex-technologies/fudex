'use client';

import { useRouter } from 'next/navigation';
import { useNavDirection } from '@/store/nav-direction-store';
import { Button } from '../ui/button';

export function ContinueButton({ href }: { href: string }) {
	const router = useRouter();
	const setDirection = useNavDirection((s) => s.setDirection);

	const handleClick = () => {
		setDirection('forward');
		router.push(href);
	};

	return (
		<Button
        variant={"game"}
			onClick={handleClick}
			className='w-full py-5'>
			Continue
		</Button>
	);
}
