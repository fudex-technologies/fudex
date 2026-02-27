'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClassNameValue } from 'tailwind-merge';
import { Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';

const GoBackButtonContent = ({
	className,
	link,
}: {
	className?: ClassNameValue;
	link?: string;
}) => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get('redirectTo');

	const handleGoBack = () => {
		if (link) {
			router.replace(link);
		} else if (redirectTo) {
			router.replace(redirectTo);
		} else {
			router.back();
		}
	};

	return (
		<div
			onClick={handleGoBack}
			className={cn(
				'w-10 aspect-square flex justify-center items-center rounded-full bg-foreground/5 cursor-pointer',
				className,
			)}>
			<ChevronLeft className='text-current' width={20} height={20} />
		</div>
	);
};

const GoBackButton = (props: { className?: ClassNameValue; link?: string }) => {
	return (
		<Suspense
			fallback={
				<Skeleton
					className={cn(
						'w-10 aspect-square rounded-full',
						props.className,
					)}
				/>
			}>
			<GoBackButtonContent {...props} />
		</Suspense>
	);
};

export default GoBackButton;
