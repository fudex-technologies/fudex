'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { ClassNameValue } from 'tailwind-merge';
import { motion } from 'motion/react';

const PageWrapper = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: ClassNameValue;
}) => {
	return (
		<div className='w-full flex justify-center'>
			<motion.main
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: 'easeOut' }}
				className={cn(
					'w-full max-w-[1400px] min-h-screen h-auto bg-background space-y-5 py-5  overflow-visible',
					className,
				)}>
				{children}
			</motion.main>
		</div>
	);
};

export default PageWrapper;
