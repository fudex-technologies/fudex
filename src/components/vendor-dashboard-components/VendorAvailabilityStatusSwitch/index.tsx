'use client';

import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { cn } from '@/lib/utils';
import { Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { isVendorOpen } from '@/lib/vendorUtils';
import { Skeleton } from '@/components/ui/skeleton';

const VendorAvailabilityStatusSwitch = () => {
	const { useGetMyVendor, updateMyVendor } = useVendorDashboardActions();
	const { data: vendor, isLoading, refetch } = useGetMyVendor();

	const updateMutation = updateMyVendor({
		onSuccess: (data: any) => {
			refetch();
			if (data.availabilityStatus === 'CLOSED') {
				toast.info(
					'Store is now CLOSED manually. Remember to switch it back to AUTO or OPEN when you are ready!',
					{
						duration: 6000,
					}
				);
			}
		},
	});

	// Reconciled status for display
	const isOpen = isVendorOpen(
		vendor?.openingHours,
		vendor?.availabilityStatus
	);
	const isAuto =
		vendor?.availabilityStatus === 'AUTO' || !vendor?.availabilityStatus;

	const handleToggle = () => {
		// If in AUTO: Force to the opposite of current reconciled status
		// If in FORCED: Return to AUTO
		if (isAuto) {
			updateMutation.mutate({
				availabilityStatus: isOpen ? 'CLOSED' : 'OPEN',
			});
		} else {
			updateMutation.mutate({
				availabilityStatus: 'AUTO',
			});
		}
	};

	if (isLoading) {
		return (
			<div className='flex items-center gap-2'>
				<Skeleton className='h-4 w-12' />
				<Skeleton className='h-9 w-24 rounded-full' />
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-1 text-center'>
			<div className='flex items-center gap-1 ml-1'>
				{isAuto ? (
					<div className='flex items-center gap-1 text-[10px] text-muted-foreground'>
						<Calendar size={10} />
						<span>Following Schedule</span>
					</div>
				) : (
					<button
						onClick={() =>
							updateMutation.mutate({
								availabilityStatus: 'AUTO',
							})
						}
						className='text-[10px] text-primary hover:underline font-medium'>
						Manual Override
					</button>
				)}
			</div>
			<div className='flex items-center gap-2'>
				{/* <p className='text-xs font-semibold uppercase text-foreground/50 shrink-0'>
					Store Status:
				</p> */}

				<div
					onClick={handleToggle}
					className={cn(
						'relative flex items-center w-28 h-9 rounded-full cursor-pointer overflow-hidden transition-all duration-300 ease-in-out border',
						isOpen
							? 'bg-primary/10 border-primary/20'
							: 'bg-foreground/10 border-foreground/20'
					)}>
					<div
						className={cn(
							'absolute top-1 bottom-1 aspect-square rounded-full transition-all duration-300 ease-in-out',
							'flex items-center justify-center shadow-sm',
							isOpen
								? 'left-[calc(100%-32px)] bg-primary'
								: 'left-1 bg-foreground'
						)}>
						{updateMutation.isPending ? (
							<Loader2 className='animate-spin size-3 text-white' />
						) : (
							<div className='size-1.5 rounded-full bg-white' />
						)}
					</div>
					<p
						className={cn(
							'text-[10px] font-bold transition-all duration-300 absolute w-full text-center pointer-events-none',
							isOpen ? 'text-primary pr-7' : 'text-foregroud pl-7'
						)}>
						{isOpen ? 'OPEN' : 'CLOSED'}
					</p>
				</div>
			</div>
		</div>
	);
};

export default VendorAvailabilityStatusSwitch;
