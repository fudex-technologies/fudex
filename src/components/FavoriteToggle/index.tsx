'use client';

import { useProfileActions } from '@/api-hooks/useProfileActions';
import { GoHeart } from 'react-icons/go';
import { FaHeart } from 'react-icons/fa6';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import { useTRPC } from '@/trpc/client';

interface FavoriteToggleProps {
	vendorId: string;
	className?: string;
	iconSize?: number;
}

export const FavoriteToggle = ({
	vendorId,
	className,
	iconSize = 25,
}: FavoriteToggleProps) => {
	const { data: session } = useSession();
	const trpc = useTRPC();
	const { isVendorFavorited, toggleFavoriteVendor } = useProfileActions();
	const { data: isFavorited, refetch } = isVendorFavorited(vendorId);

	const toggleMutation = toggleFavoriteVendor({
		onSuccess: () => {
			refetch();
			// trpc.users.getMyFavoriteVendors.invalidate();
		},
	});

	const handleToggle = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!session) {
			toast.error('Please login to add to favorites');
			return;
		}

		toggleMutation.mutate({ vendorId });
	};

	return (
		<button
			onClick={handleToggle}
			disabled={toggleMutation.isPending}
			className={cn(
				'transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center',
				className
			)}>
			{isFavorited ? (
				<GoHeart
					size={iconSize}
					className='text-red-500 drop-shadow-lg'
				/>
			) : (
				<GoHeart
					size={iconSize}
					className='text-white drop-shadow-lg'
				/>
			)}
		</button>
	);
};
