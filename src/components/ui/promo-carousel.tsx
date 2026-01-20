'use client';

import { cn } from '@/lib/utils';
import {
	animate,
	motion,
	useMotionValue,
} from 'motion/react';
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
	interval = 5000,
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

	useEffect(() => {
		if (!isOverflowing || itemWidth === 0) return;

		const timer = setInterval(() => {
			setIdx((prev) => {
				const next = prev + 1;
				// If we reach the end of the first set, we need to handle reset
				// But for seamless animation, we let it animate to 'childrenCount'
				// and then reset silently.
				return next;
			});
		}, interval);

		return () => clearInterval(timer);
	}, [isOverflowing, itemWidth, interval]);

	// Handle Animation
	useEffect(() => {
		if (!isOverflowing) {
			x.set(0);
			return;
		}

		const slideDistance = itemWidth + gap;
		const targetX = -idx * slideDistance;

		// If we wrap around (idx == childrenCount), we are technically showing the start of the second set
		// which looks exactly like the start of the first set (idx 0).
		// We can animate to it, and then instantly reset to 0.
		const controls = animate(x, targetX, {
			type: 'spring',
			stiffness: 100,
			damping: 20,
			onComplete: () => {
				if (idx >= childrenCount) {
					// Reset safely
					setIdx(0);
					x.set(0);
				}
			},
		});

		return () => controls.stop();
	}, [idx, isOverflowing, itemWidth, gap, childrenCount, x]);

	return (
		<div ref={containerRef} className={cn('w-full overflow-x-hidden px-4', className)}>
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
					// Drag support can be added easily with motion
					drag='x'
					dragConstraints={{
						left: -((itemWidth + gap) * (2 * childrenCount - 1)),
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
