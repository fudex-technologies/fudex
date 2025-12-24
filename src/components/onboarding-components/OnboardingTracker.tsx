import { cn } from '@/lib/utils';

const OnboardingTracker = ({ indicator }: { indicator: number }) => {
	return (
		<div className='flex gap-3 items-end'>
			<div
				className={cn(
					'w-1  h-[17px] rounded-full bg-foreground/50',
					indicator === 1 && 'h-[30px] bg-primary'
				)}
			/>
			<div
				className={cn(
					'w-1  h-[17px] rounded-full bg-foreground/50',
					indicator === 2 && 'h-[30px] bg-primary'
				)}
			/>
			<div
				className={cn(
					'w-1  h-[17px] rounded-full bg-foreground/50',
					indicator === 3 && 'h-[30px] bg-primary'
				)}
			/>
		</div>
	);
};

export default OnboardingTracker;
