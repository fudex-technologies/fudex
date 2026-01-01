'useClient';

import { cn } from '@/lib/utils';
import { Dispatch, SetStateAction } from 'react';
import { ClassNameValue } from 'tailwind-merge';

interface Props {
	className?: ClassNameValue;
	count: number;
	setCount?: Dispatch<SetStateAction<number>>;
	countChangeEffect?: (newCount: number) => void;
}

const CounterComponent = ({
	className,
	count,
	setCount,
	countChangeEffect,
}: Props) => {
	const increaseCount = () => {
		if (setCount) {
			const maybePromise = setCount((prev) => prev + 1);
			Promise.resolve(maybePromise)
				.then(() => {
					countChangeEffect && countChangeEffect(count);
				})
				.catch(() => {
					countChangeEffect && countChangeEffect(count);
				});
			return;
		} else {
			countChangeEffect && countChangeEffect(count + 1);
			return;
		}
	};

	const decreaseCount = () => {
		if (setCount) {
			const maybePromise = setCount((prev) => prev - 1);
			Promise.resolve(maybePromise)
				.then(() => {
					countChangeEffect && countChangeEffect(count);
				})
				.catch(() => {
					countChangeEffect && countChangeEffect(count);
				});
			return;
		} else {
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
				className='flex-1 flex items-center justify-center cursor-pointer'>
				-
			</div>
			<div className='flex-1 flex items-center justify-center'>
				{count}
			</div>
			<div
				onClick={increaseCount}
				className='flex-1 flex items-center justify-center cursor-pointer'>
				+
			</div>
		</div>
	);
};

export default CounterComponent;
