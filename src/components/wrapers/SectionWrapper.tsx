import { cn } from '@/lib/utils';
import React from 'react';
import { ClassNameValue } from 'tailwind-merge';

const SectionWrapper = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: ClassNameValue;
}) => {
	return (
		<section className={cn('w-full px-5', className)}>{children}</section>
	);
};

export default SectionWrapper;
