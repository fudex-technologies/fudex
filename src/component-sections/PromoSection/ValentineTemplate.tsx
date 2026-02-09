import { buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { JSX, useEffect, useState } from 'react';
import { ClassNameValue } from 'tailwind-merge';

interface PromoSlide {
	textLine1: JSX.Element | string;
	textLine2: string;
	image: string;
}

const ValentineTemplate = ({
	slides,
	buttonLabel,
	link,
	backgroundImagePath,
	buttonClassName,
	className,
	firstSectionClassName,
}: {
	slides: PromoSlide[];
	buttonLabel: string;
	link?: string;
	backgroundImagePath?: string;
	className?: ClassNameValue;
	firstSectionClassName?: ClassNameValue;
	buttonClassName?: ClassNameValue;
}) => {
	const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

	useEffect(() => {
		if (slides.length <= 1) return;

		const interval = setInterval(() => {
			setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
		}, 5000); // Switch every 5 seconds

		return () => clearInterval(interval);
	}, [slides.length]);

	const currentSlide = slides[currentSlideIndex];

	return (
		<div
			className={cn(
				'noise-effect w-[95vw] sm:w-full min-w-xs max-w-sm rounded-xl h-[170px] overflow-hidden flex items-center p-0 relative',
				className,
			)}
			style={{
				backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.312), rgba(0, 0, 0, 0.307)), url(${backgroundImagePath})`,
			}}>
			<Image
				width={50}
				height={50}
				alt='heart'
				src={'/assets/valentine-heart.svg'}
				className='absolute top-2 right-2 opacity-50'
			/>
			<Image
				width={50}
				height={50}
				alt='heart'
				src={'/assets/valentine-heart2.svg'}
				className='absolute bottom-2 left-2 opacity-50'
			/>
			<div
				className={cn(
					'w-full p-5 pb-0 flex flex-col relative z-10 justify-end',
					firstSectionClassName,
				)}>
				<div className='flex flex-col text-white w-full overflow-hidden h-10 '>
					<AnimatePresence mode='wait'>
						<motion.div
							key={currentSlideIndex}
							initial={{ y: -50, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: 50, opacity: 0 }}
							transition={{ duration: 0.6, ease: 'easeOut' }}
							className='w-full'>
							<p className='leading-tight w-full'>
								{currentSlide.textLine1}{' '}
								<span className='text-white/50'>
									{currentSlide.textLine2}
								</span>
							</p>
						</motion.div>
					</AnimatePresence>
				</div>

				<div className='w-full flex items-center'>
					<Link
						href={link || '#'}
						className={cn(
							buttonVariants({
								size: 'lg',
							}),
							'rounded-full bg-foreground text-background py-6 hover:bg-foreground/50 hover:text-background w-fit ',
							buttonClassName,
						)}>
						{buttonLabel}
					</Link>
					<div className='h-full flex items-end justify-start relative overflow-hidden'>
						<AnimatePresence mode='wait'>
							<motion.div
								key={currentSlideIndex}
								initial={{ y: 100, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: -100, opacity: 0 }}
								transition={{ duration: 0.6, ease: 'easeOut' }}
								className='w-full'>
								<Image
									width={200}
									height={100}
									src={currentSlide.image}
									className='w-full h-auto object-top max-w-[200px] sm:max-w-none'
									alt='promo'
								/>
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ValentineTemplate;
