import { Skeleton } from '@/components/ui/skeleton';

export function WalletBalanceCardSkeleton() {
	return (
		<div className='w-full bg-black/5 p-6 rounded-2xl flex flex-col gap-6 h-[180px]'>
			<div className='space-y-2'>
				<Skeleton className='h-4 w-24 bg-black/10' />
				<Skeleton className='h-10 w-40 bg-black/10' />
			</div>
			<Skeleton className='h-12 w-full bg-black/10 rounded-xl mt-auto' />
		</div>
	);
}
