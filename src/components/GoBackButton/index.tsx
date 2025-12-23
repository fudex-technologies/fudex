'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ClassNameValue } from 'tailwind-merge';

const GoBackButton = ({ className }: { className?: ClassNameValue }) => {
	const router = useRouter();
	return (
		<div
			onClick={() => router.back()}
			className={cn(
				'w-10 aspect-square flex justify-center items-center  rounded-full bg-foreground/5',
				className
			)}>
			<ChevronLeft className='text-current' width={20} height={20} />
		</div>
	);
};

export default GoBackButton;
