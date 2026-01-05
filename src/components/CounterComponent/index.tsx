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
}: Props) => {
	const increaseCount = () => {
		if (setCount) {
			const maybePromise = setCount((prev) =>
				disabledAdd
					? prev
					: max && prev >= max
					? prev
					: min && prev <= min
					? prev
					: prev + 1
			);
			Promise.resolve(maybePromise)
				.then(() => {
					if (disabledAdd || (max && count >= max)) return;
					countChangeEffect && countChangeEffect(count);
				})
				.catch(() => {
					if (disabledAdd || (max && count >= max)) return;
					countChangeEffect && countChangeEffect(count);
				});
			return;
		} else {
			if (disabledAdd || (max && count >= max)) return;
			countChangeEffect && countChangeEffect(count + 1);
			return;
		}
	};

	const decreaseCount = () => {
		if (setCount) {
			const maybePromise = setCount((prev) =>
				min && prev <= min ? prev : max && prev >= max ? prev : prev - 1
			);
			Promise.resolve(maybePromise)
				.then(() => {
					if (disabledSubtract || (min && count <= min)) return;
					countChangeEffect && countChangeEffect(count);
				})
				.catch(() => {
					if (disabledSubtract || (min && count <= min)) return;
					countChangeEffect && countChangeEffect(count);
				});
			return;
		} else {
			if (disabledSubtract || (min && count <= min)) return;
			countChangeEffect && countChangeEffect(count - 1);
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
