'use client';

import ProductListItem from '@/components/ProductListItem';
import TabComponent from '@/components/TabComponent';
import { Separator } from '@/components/ui/separator';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const VendorProductsTabSection = ({ vendorId }: { vendorId: string }) => {
	const { useListProductItems } = useVendorProductActions();
	const { data: productItems = [], isLoading } = useListProductItems({
		vendorId,
		take: 100,
	});

	// Organize product items by categories
	const { categoriesMap, allCategories } = useMemo(() => {
		const map: Record<string, typeof productItems> = {};
		const categories: Array<{ id: string; name: string }> = [];

		productItems.forEach((item) => {
			if (item.categories && item.categories.length > 0) {
				item.categories.forEach(({ category }) => {
					if (!map[category.id]) {
						map[category.id] = [];
						categories.push({
							id: category.id,
							name: category.name,
						});
					}
					map[category.id].push(item);
				});
			} else {
				// Items without categories go to "Uncategorized"
				if (!map['uncategorized']) {
					map['uncategorized'] = [];
					categories.push({
						id: 'uncategorized',
						name: 'Uncategorized',
					});
				}
				map['uncategorized'].push(item);
			}
		});

		return { categoriesMap: map, allCategories: categories };
	}, [productItems]);

	// Create tabs: "All" first, then categories
	const tabs = useMemo(() => {
		const categoryTabs = allCategories.map((cat) => ({
			id: cat.id,
			label: cat.name,
		}));
		return [{ id: 'all', label: 'All' }, ...categoryTabs];
	}, [allCategories]);

	const [activeTab, setActiveTab] = useState('all');

	// Get items for the active tab
	const activeItems = useMemo(() => {
		if (activeTab === 'all') {
			return productItems;
		}
		return categoriesMap[activeTab] || [];
	}, [activeTab, productItems, categoriesMap]);

	if (isLoading) {
		return (
			<div className='w-full mt-5'>
				<div className='flex gap-2 overflow-x-auto pb-2'>
					{Array.from({ length: 5 }).map((_, index) => (
						<Skeleton key={index} className='h-10 w-24 shrink-0' />
					))}
				</div>
				<div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4'>
					{Array.from({ length: 6 }).map((_, index) => (
						<div key={index} className='w-full'>
							<Separator
								orientation={'horizontal'}
								className='w-full'
							/>
							<Skeleton className='h-[100px] w-full' />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (productItems.length === 0) {
		return (
			<div className='w-full mt-5'>
				<p className='text-foreground/50 text-center py-8'>
					No products available
				</p>
			</div>
		);
	}

	return (
		<div className='w-full mt-5'>
			{tabs.length > 1 && (
				<TabComponent
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					activeByPathname={false}
					tabs={tabs}
				/>
			)}
			{activeItems.length > 0 ? (
				<div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
					{activeItems.map((item, index) => (
						<div key={`${item.id}-${index}`} className='w-full'>
							<Separator
								orientation={'horizontal'}
								className='w-full'
							/>
							<ProductListItem
								productItem={{
									id: item.id,
									name: item.name,
									description: item.description,
									price: item.price,
									images: item.images,
									vendorId: item.vendorId,
									productId: item.productId,
									slug: item.slug,
									isActive: item.isActive,
									inStock: item.inStock,
									product: item.product
										? {
												id: item.product.id,
												name: item.product.name,
												description:
													item.product.description,
										  }
										: null,
								}}
							/>
						</div>
					))}
				</div>
			) : (
				<p className='text-foreground/50 text-center py-8 mt-4'>
					No products in this category
				</p>
			)}
		</div>
	);
};

export default VendorProductsTabSection;
