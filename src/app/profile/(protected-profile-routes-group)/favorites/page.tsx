'use client';

import { useProfileActions } from '@/api-hooks/useProfileActions';
import GoBackButton from '@/components/GoBackButton';
import VendorCard from '@/components/VendorCard';
import { Skeleton } from '@/components/ui/skeleton';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
	const { getMyFavoriteVendors } = useProfileActions();
	const { data: favorites, isLoading } = getMyFavoriteVendors();

	if (isLoading) {
		return (
			<div className='w-full max-w-lg mx-auto p-5 space-y-4'>
				<Skeleton className='h-8 w-48' />
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className='h-32 w-full' />
				))}
			</div>
		);
	}

	return (
		<PageWrapper className='flex flex-col items-center'>
			<div className='flex items-center gap-10 w-full px-5'>
				<GoBackButton />
				<h1 className='font-semibold text-xl'>My Favorites</h1>
			</div>

			{!favorites || favorites.length === 0 ? (
				<div className='flex flex-col items-center justify-center py-16 text-center'>
					<Heart className='text-foreground/20' size={64} />
					<p className='text-foreground/70 mt-4 text-lg'>
						No favorite vendors yet
					</p>
					<p className='text-foreground/50 text-sm mt-2'>
						Start adding vendors to your favorites to see them here
					</p>
				</div>
			) : (
				<div className='w-full mx-auto p-5 grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{favorites.map((fav) => (
						<VendorCard key={fav.id} vendor={fav.vendor} />
					))}
				</div>
			)}
		</PageWrapper>
	);
}
