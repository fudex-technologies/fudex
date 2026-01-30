'useClient';

import { cn } from '@/lib/utils';
import { Dispatch, SetStateAction } from 'react';
import { ClassNameValue } from 'tailwind-merge';

interface Props {
	className?: ClassNameValue;
	count: number;
	setCount?: Dispatch<SetStateAction<number>>;
	countChangeEffect?: (newCount: number) => void;
	max?: number;
	min?: number;
	step?: number; // Increment/decrement by this amount
	disabledAdd?: boolean;
	disabledSubtract?: boolean;
}

const CounterComponent = ({
	className,
	count,
	setCount,
	countChangeEffect,
	disabledAdd,
	disabledSubtract,
	max,
	min,
	step = 1,
}: Props) => {
	const increaseCount = () => {
		const newValue = Math.min(
			max !== undefined ? max : Infinity,
			count + step
		);
		if (newValue === count) return;

		if (setCount) {
			const maybePromise = setCount((prev) =>
				disabledAdd
					? prev
					: max && prev >= max
					? prev
					: min && prev < min
					? Math.max(min, Math.ceil(min / step) * step)
					: newValue
			);
			Promise.resolve(maybePromise)
				.then(() => {
					if (disabledAdd || (max && newValue >= max)) return;
					countChangeEffect && countChangeEffect(newValue);
				})
				.catch(() => {
					if (disabledAdd || (max && newValue >= max)) return;
					countChangeEffect && countChangeEffect(newValue);
				});
			return;
		} else {
			if (disabledAdd || (max && newValue >= max)) return;
			countChangeEffect && countChangeEffect(newValue);
			return;
		}
	};

	const decreaseCount = () => {
		const newValue = Math.max(
			min !== undefined ? min : 0,
			count - step
		);
		if (newValue === count) return;

		if (setCount) {
			const maybePromise = setCount((prev) =>
				min && prev <= min
					? prev
					: max && prev >= max
					? prev
					: newValue
			);
			Promise.resolve(maybePromise)
				.then(() => {
					if (disabledSubtract || (min && newValue <= min)) return;
					countChangeEffect && countChangeEffect(newValue);
				})
				.catch(() => {
					if (disabledSubtract || (min && newValue <= min)) return;
					countChangeEffect && countChangeEffect(newValue);
				});
			return;
		} else {
			if (disabledSubtract || (min && newValue <= min)) return;
			countChangeEffect && countChangeEffect(newValue);
			return;
		}
	};

	return (
		<div
			className={cn(
				'p-5 w-full max-w-xs bg-muted text-foreground rounded-full flex text-lg font-semibold',
				className
			)}>
			<div
				onClick={decreaseCount}
				className={cn(
					'flex-1 flex items-center justify-center cursor-pointer',
					((min && count === min) || disabledSubtract) &&
						'cursor-not-allowed opacity-30'
				)}>
				-
			</div>
			<div className='flex-1 flex items-center justify-center'>
				{count}
			</div>
			<div
				onClick={increaseCount}
				className={cn(
					'flex-1 flex items-center justify-center cursor-pointer',
					((max && count === max) || disabledAdd) &&
						'opacity-30 cursor-not-allowed'
				)}>
				+
			</div>
		</div>
	);
};

export default CounterComponent;
