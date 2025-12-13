'useClient';

import { cn } from '@/lib/utils';
import { Dispatch, SetStateAction } from 'react';
import { ClassNameValue } from 'tailwind-merge';

interface Props {
	className?: ClassNameValue;
	count: number;
	setCount: Dispatch<SetStateAction<number>>;
}

const CounterComponent = ({ className, count, setCount }: Props) => {
	const increaseCount = () => {
		setCount((prev) => prev + 1);
	};
	const decreaseCount = () => {
		setCount((prev) => prev - 1);
	};

	return (
		<div
			className={cn(
				className,
				'p-5 w-full max-w-xs bg-muted text-foreground rounded-full flex text-lg font-semibold'
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
