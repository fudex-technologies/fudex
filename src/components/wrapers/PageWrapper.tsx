import { cn } from '@/lib/utils';
import React from 'react';
import { ClassNameValue } from 'tailwind-merge';

const PageWrapper = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: ClassNameValue;
}) => {
	return (
		<div className='w-full flex justify-center'>
			<main
				className={cn(
					'w-full max-w-[1400px] min-h-screen h-auto bg-background space-y-5 py-5  overflow-visible',
					className
				)}>
				{children}
			</main>
		</div>
	);
};

export default PageWrapper;
