'use client';

import CategorySelectionSection from '@/component-sections/CategorySelectionSection';
import TrendingVendorsSection from '@/component-sections/TrendingVendorsSection';
import SearchInput, { SearchInputSkeleton } from '@/components/SearchInput';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { useSearchQueries } from '@/nuqs-hooks/useSearchQueries';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import VendorCard from '@/components/VendorCard';
import ProductListItem from '@/components/ProductListItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Suspense, useEffect, useRef } from 'react';


const SearchPageView = () => {
	const [search] = useSearchQueries();
	const { useVendorsSearch } = useVendorProductActions();
	const searchInputRef = useRef<HTMLInputElement>(null);
	// Use all selected category IDs for filtering
	const categoryIds =
		search.cat && search.cat.length > 0 ? search.cat : undefined;
	const { data, isLoading } = useVendorsSearch({
		q: search.q || undefined,
		categoryIds: categoryIds,
		take: 50,
	});

	useEffect(() => {
		if (!categoryIds) {
			searchInputRef.current?.focus();
		}
	}, [categoryIds]);

	const vendors = data?.vendors || [];
	const products = data?.products || [];
	const hasSearchQuery =
		!!search.q || (categoryIds && categoryIds.length > 0);

	return (
		<>
			<SectionWrapper>
				<Suspense fallback={<SearchInputSkeleton />}>
					<SearchInput ref={searchInputRef} />
				</Suspense>
			</SectionWrapper>
			<CategorySelectionSection />

			{hasSearchQuery ? (
				<>
					{isLoading ? (
						<SectionWrapper className='w-full flex flex-col gap-5'>
							<div className='w-full flex flex-col gap-3'>
								<Skeleton className='h-6 w-32' />
								<div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
									{Array.from({ length: 4 }).map(
										(_, index) => (
											<div
												key={index}
												className='flex flex-col gap-2'>
												<Skeleton className='h-[150px] w-full rounded-lg' />
												<Skeleton className='h-4 w-3/4' />
												<Skeleton className='h-4 w-1/2' />
											</div>
										)
									)}
								</div>
							</div>
							<div className='w-full flex flex-col gap-3'>
								<Skeleton className='h-6 w-32' />
								{Array.from({ length: 3 }).map((_, index) => (
									<Skeleton
										key={index}
										className='h-[100px] w-full rounded-md'
									/>
								))}
							</div>
						</SectionWrapper>
					) : (
						<SectionWrapper className='w-full flex flex-col gap-5'>
							{vendors.length > 0 && (
								<div className='w-full flex flex-col gap-3'>
									<h2 className='text-lg font-semibold'>
										Vendors
									</h2>
									<div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
										{vendors.map((vendor) => (
											<VendorCard
												vendor={vendor}
												key={vendor.id}
											/>
										))}
									</div>
								</div>
							)}

							{products.length > 0 && (
								<>
									{vendors.length > 0 && <Separator />}
									<div className='w-full flex flex-col gap-3'>
										<h2 className='text-lg font-semibold'>
											Products
										</h2>
										<div className='w-full flex flex-col'>
											{products.map((product) => (
												<ProductListItem
													productItem={{
														id: product.id,
														name: product.name,
														description:
															product.description,
														price: product.price,
														images: product.images,
														vendorId:
															product.vendorId,
														productId:
															product.productId,
														slug: product.slug,
														product: product.product
															? {
																	id: product
																		.product
																		.id,
																	name: product
																		.product
																		.name,
																	description:
																		product
																			.product
																			.description,
															  }
															: null,
													}}
													key={product.id}
												/>
											))}
										</div>
									</div>
								</>
							)}

							{vendors.length === 0 && products.length === 0 && (
								<p className='text-foreground/50 text-center py-8'>
									{search.q
										? `No results found for "${search.q}"${
												categoryIds &&
												categoryIds.length > 0
													? ' in selected categories'
													: ''
										  }`
										: categoryIds && categoryIds.length > 0
										? 'No results found for selected categories'
										: 'No results found'}
								</p>
							)}
						</SectionWrapper>
					)}
				</>
			) : (
				<TrendingVendorsSection />
			)}
		</>
	);
};

export default SearchPageView;
