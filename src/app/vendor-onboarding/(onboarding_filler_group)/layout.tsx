'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useNavDirection } from '@/store/nav-direction-store';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

export default function OnboardingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const direction = useNavDirection((s) => s.direction);

	const variants = {
		initial: (dir: string) => ({
			x: dir === 'forward' ? 40 : -40,
			opacity: 0,
		}),
		animate: {
			x: 0,
			opacity: 1,
		},
		exit: (dir: string) => ({
			x: dir === 'forward' ? -40 : 40,
			opacity: 0,
		}),
	};

	return (
		<div className='min-h-screen bg-[#FFF7ED] overflow-hidden relative'>
			<ImageWithFallback
				src={'/icons/FUDEX_2t.png'}
				className='absolute top-10 right-5 sm:right-10 lg:right-20 w-[50px] h-auto'
			/>
			<AnimatePresence mode='wait' custom={direction}>
				<motion.div
					key={pathname}
					custom={direction}
					variants={variants}
					initial='initial'
					animate='animate'
					exit='exit'
					transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
					className='h-full'>
					{children}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
