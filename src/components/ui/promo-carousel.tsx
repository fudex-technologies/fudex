'use client';

import { cn } from '@/lib/utils';
import { animate, motion, useMotionValue } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';

interface PromoCarouselProps {
	children: React.ReactNode;
	className?: string;
	interval?: number; // Time in ms between slides
	gap?: number; // Gap between items in px (default 20 to match 'gap-5')
}

export const PromoCarousel = ({
	children,
	className,
	interval = 7000,
	gap = 20,
}: PromoCarouselProps) => {
	const [isOverflowing, setIsOverflowing] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const [itemWidth, setItemWidth] = useState(0);

	const items = React.Children.toArray(children);

	// Measure overflow and item width
	useEffect(() => {
		const checkOverflow = () => {
			if (!containerRef.current || !contentRef.current) return;

			const containerWidth = containerRef.current.clientWidth;
			const contentWidth = contentRef.current.scrollWidth;
			// Check if content is significantly larger (buffer for rounding)
			const hasOverflow = contentWidth > containerWidth + 1;

			setIsOverflowing(hasOverflow);

			// Measure first child width if available
			const firstChild = contentRef.current.children[0] as HTMLElement;
			if (firstChild) {
				setItemWidth(firstChild.offsetWidth);
			}
		};

		checkOverflow();
		window.addEventListener('resize', checkOverflow);
		return () => window.removeEventListener('resize', checkOverflow);
	}, [items]);

	// Prepare data for infinite loop
	// We duplicate children to allow seamless scrolling
	// [A, B, C] -> [A, B, C, A, B, C]
	const extendedItems = React.useMemo(() => {
		if (!isOverflowing) return items;
		return [...items, ...items];
	}, [items, isOverflowing]);

	const x = useMotionValue(0);
	const [idx, setIdx] = useState(0);
	const childrenCount = items.length;

	// Interval to advance the slide
	useEffect(() => {
		if (!isOverflowing || itemWidth === 0) return;

		const timer = setInterval(() => {
			setIdx((prev) => prev + 1);
		}, interval);

		return () => clearInterval(timer);
	}, [isOverflowing, itemWidth, interval]);

	// Handle animation and looping
	useEffect(() => {
		if (!isOverflowing) {
			x.set(0);
			return;
		}

		const slideDistance = itemWidth + gap;
		const targetX = -idx * slideDistance;

		const controls = animate(x, targetX, {
			type: 'tween',
			duration: 0.6,
			ease: 'easeInOut',
			onComplete: () => {
				// When the animation reaches the start of the duplicated items,
				// instantly jump back to the real start.
				if (idx >= childrenCount) {
					x.set(0);
					setIdx(0);
				}
			},
		});

		return () => controls.stop();
		// Correct dependency array, excludes the motion value 'x'
	}, [idx, isOverflowing, itemWidth, gap, childrenCount]);

	return (
		<div
			ref={containerRef}
			className={cn('w-full overflow-x-hidden px-4', className)}>
			{!isOverflowing ? (
				// Centered Static Layout
				<div
					ref={contentRef}
					className='flex justify-center gap-5 w-max min-w-full'>
					{items}
				</div>
			) : (
				// Carousel Layout
				<motion.div
					ref={contentRef}
					style={{ x }}
					className='flex gap-5 w-max'
					drag='x'
					dragConstraints={{
						left: -((itemWidth + gap) * (childrenCount - 1)),
						right: 0,
					}}>
					{extendedItems.map((child, i) => (
						<div key={i} className='shrink-0'>
							{child}
						</div>
					))}
				</motion.div>
			)}
		</div>
	);
};
