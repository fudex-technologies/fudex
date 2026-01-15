'use client';

import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { OrderStatus } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useRef, useEffect } from 'react';
import VendorDashboardOrderCardItem from './VendorDashboardOrderCardItem';
import SectionWrapper from '@/components/wrapers/SectionWrapper';

interface VendorDashboardOrderListInfiniteProps {
	status: OrderStatus[];
	emptyMessage: string;
	emptySubMessage: string;
}

const VendorDashboardOrderListInfinite = ({
	status,
	emptyMessage,
	emptySubMessage,
}: VendorDashboardOrderListInfiniteProps) => {
	const { useGetMyOrdersInfinite } = useVendorDashboardActions();
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		refetch,
	} = useGetMyOrdersInfinite({
		status,
		limit: 12,
	});

	const orders = useMemo(() => {
		return data?.pages.flatMap((page) => page.items) ?? [];
	}, [data]);

	const observerTarget = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries[0].isIntersecting &&
					hasNextPage &&
					!isFetchingNextPage
				) {
					fetchNextPage();
				}
			},
			{ threshold: 0.5 }
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => observer.disconnect();
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	if (isLoading) {
		return (
			<div className='w-full h-64 flex items-center justify-center'>
				<Loader2 className='animate-spin text-primary' size={32} />
			</div>
		);
	}

	const isEmpty = orders.length === 0;

	return (
		<div className='w-full p-5'>
			{isEmpty ? (
				<div className='w-full flex flex-col items-center justify-center py-10 text-center'>
					<Image
						src={'/assets/fudex-tackout-pack.png'}
						width={250}
						height={250}
						alt='fudex takeout package'
						className='object-contain'
					/>
					<p className='font-semibold'>{emptyMessage}</p>
					<p className=''>{emptySubMessage}</p>
				</div>
			) : (
				<SectionWrapper className='py-5 px-0! w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
					{orders.map((order) => (
						<VendorDashboardOrderCardItem
							key={order.id}
							order={order as any}
							refetch={refetch}
						/>
					))}
				</SectionWrapper>
			)}

			{hasNextPage && (
				<div
					ref={observerTarget}
					className='w-full flex justify-center p-10'>
					<Loader2 className='animate-spin text-primary' size={24} />
				</div>
			)}
		</div>
	);
};

export default VendorDashboardOrderListInfinite;
