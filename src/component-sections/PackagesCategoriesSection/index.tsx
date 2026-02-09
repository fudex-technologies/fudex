'use client';

import React, { useMemo } from 'react';
import SinglePackageCategorySction from './SinglePackageCategorySction';
import { usePackageActions } from '@/api-hooks/usePackageActions';
import { Skeleton } from '@/components/ui/skeleton';
import PackageCartBottomBar from '@/components/PackageCartBottomBar';
import PackageCartInitializer from './PackageCartInitializer';

const PackagesCategoriesSection = ({
	packageSlug,
}: {
	packageSlug: string;
}) => {
	const { useGetPackageBySlug } = usePackageActions();
	const { data: packageData, isLoading } = useGetPackageBySlug({
		slug: packageSlug,
	});

	if (isLoading) {
		return (
			<div className='w-full space-y-5'>
				{[1, 2, 3].map((i) => (
					<div key={i} className='w-full flex flex-col gap-3 pb-5'>
						<Skeleton className='h-6 w-48 mx-5' />
						<div className='flex space-x-4 mx-5'>
							{[1, 2, 3, 4].map((j) => (
								<Skeleton key={j} className='h-48 w-[200px]' />
							))}
						</div>
					</div>
				))}
			</div>
		);
	}

	if (
		!packageData ||
		!packageData.categories ||
		packageData.categories.length === 0
	) {
		return (
			<div className='w-full p-5 text-center text-foreground/50'>
				No categories available for this package.
			</div>
		);
	}

	// Flatten all package items for the bottom bar
	const allPackageItems = useMemo(() => {
		if (!packageData?.categories) return [];

		return packageData.categories.flatMap((category) =>
			(category.items || []).map((item) => ({
				id: item.id,
				name: item.name,
				price: item.price,
			})),
		);
	}, [packageData]);

	return (
		<>
			{/* Initialize package cart with current package ID */}
			{packageData?.id && (
				<PackageCartInitializer packageId={packageData.id} />
			)}

			<div className='w-full space-y-5 pb-24'>
				{packageData.categories.map((category) => {
					// Transform package items to match the expected format
					const packages = (category.items || []).map((item) => ({
						id: item.id,
						name: item.name,
						description: item.description || '',
						price: item.price.toString(),
						imageUrl:
							item.images && item.images.length > 0
								? item.images[0]
								: '/assets/empty-tray.png',
						packageItem: item, // Include full item for future use
					}));

					return (
						<SinglePackageCategorySction
							key={category.id}
							sectionTitle={category.name}
							packages={packages}
							link={`/packages/${packageSlug}/${category.slug}`}
						/>
					);
				})}
			</div>

			{/* Fixed Bottom Bar */}
			<PackageCartBottomBar
				packageSlug={packageSlug}
				packageItemsData={allPackageItems}
				isPreorder={packageData?.isPreorder}
			/>
		</>
	);
};

export default PackagesCategoriesSection;
