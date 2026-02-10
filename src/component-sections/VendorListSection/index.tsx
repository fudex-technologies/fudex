'use client';

import VendorCard from '@/components/VendorCard';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import {
	useMemo,
	useRef,
	useEffect,
	useState,
	type Dispatch,
	type SetStateAction,
} from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useFilterVendorsQueries } from '@/nuqs-hooks/useFilterVendorsQueries';

const VendorListSection = ({ title }: { title?: string }) => {
	const { useInfiniteListVendors } = useVendorProductActions();
	const [filterQueries] = useFilterVendorsQueries();
	const selectedRating = filterQueries.rating;

	// Use a ref to store the random seed so it persists across re-renders
	// but is generated once per component mount (session) to keep pagination consistent
	const randomSeedRef = useRef(Math.floor(Math.random() * 1000000));

	const [activeTab, setActiveTab] = useState<'all' | 'cakes'>('all');

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useInfiniteListVendors({
			limit: 12,
			ratingFilter: selectedRating as any,
			openedSort: true, // Prioritize open vendors
			randomSeed: randomSeedRef.current, // Pass the stable random seed
			categorySlug: activeTab === 'cakes' ? 'cakes' : undefined,
			staleTime: 1000 * 60 * 5, // 5 minutes cache to prevent reloading on tab switch
		});

	const vendors = useMemo(() => {
		return data?.pages.flatMap((page) => page.items) ?? [];
	}, [data]);

	// Simple intersection observer to trigger fetchNextPage
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
			{ threshold: 0.5 },
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => observer.disconnect();
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	if (isLoading) {
		return (
			<VendorListSectionSkeleton
				title={title}
				activeTab={activeTab}
				setActiveTab={setActiveTab}
			/>
		);
	}

	return (
		<SectionWrapper className='w-full flex flex-col gap-3'>
			<div className='flex items-center justify-between'>
				{/* {title && <h2 className='text-lg font-semibold '>{title}</h2>} */}
				<div className='flex w-full max-w-sm items-center gap-1 bg-primary/10 p-2 rounded-full'>
					<button
						onClick={() => setActiveTab('all')}
						className={`flex-1 px-5 py-3 text-sm font-medium rounded-full transition-all ${
							activeTab === 'all'
								? 'bg-primary text-primary-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}>
						Available Food Spots
					</button>
					<button
						onClick={() => setActiveTab('cakes')}
						className={`flex-1 px-5 py-3 text-sm font-medium rounded-full transition-all ${
							activeTab === 'cakes'
								? 'bg-primary text-primary-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}>
						Cakes & Surprises
					</button>
				</div>
			</div>
			{vendors.length > 0 ? (
				<>
					<div
						id={'vendors'}
						className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
						{vendors.map((vendor) => (
							<VendorCard vendor={vendor} key={vendor.id} />
						))}
					</div>
					{/* Loading indicator / sentinel */}
					<div
						ref={observerTarget}
						className='w-full py-4 flex justify-center'>
						{isFetchingNextPage && (
							<Skeleton className='h-8 w-32' />
						)}
					</div>
				</>
			) : (
				<p className='text-foreground/50 text-center py-8'>
					No vendors available
				</p>
			)}
		</SectionWrapper>
	);
};

export default VendorListSection;

export const VendorListSectionSkeleton = ({
	title,
	activeTab,
	setActiveTab,
}: {
	title?: string;
	activeTab?: 'all' | 'cakes';
	setActiveTab?: Dispatch<SetStateAction<'all' | 'cakes'>>;
}) => {
	return (
		<SectionWrapper className='w-full flex flex-col gap-3'>
			<div className='flex items-center justify-between'>
				{/* {title && <h2 className='text-lg font-semibold '>{title}</h2>} */}
				<div className='flex w-full max-w-sm items-center gap-1 bg-primary/10 p-2 rounded-full'>
					<button
						onClick={() => setActiveTab && setActiveTab('all')}
						className={`flex-1 px-5 py-3 text-sm font-medium rounded-full transition-all ${
							activeTab === 'all'
								? 'bg-primary text-primary-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}>
						Available Food Spots
					</button>
					<button
						onClick={() => setActiveTab && setActiveTab('cakes')}
						className={`flex-1 px-5 py-3 text-sm font-medium rounded-full transition-all ${
							activeTab === 'cakes'
								? 'bg-primary text-primary-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}>
						Cakes & Surprises
					</button>
				</div>
			</div>
			{/* {title && <h2 className='text-lg font-semibold '>{title}</h2>} */}
			<div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
				{Array.from({ length: 8 }).map((_, index) => (
					<div key={index} className='flex flex-col gap-2'>
						<Skeleton className='h-[150px] w-full rounded-lg' />
						<Skeleton className='h-4 w-3/4' />
						<Skeleton className='h-4 w-1/2' />
					</div>
				))}
			</div>
		</SectionWrapper>
	);
};
