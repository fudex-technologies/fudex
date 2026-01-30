'use client';

import ProductListItem from '@/components/ProductListItem';
import TabComponent from '@/components/TabComponent';
import { Separator } from '@/components/ui/separator';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const VendorProductsTabSection = ({ vendorId }: { vendorId: string }) => {
	const { useListProducts } = useVendorProductActions();
	const { data: products = [], isLoading } = useListProducts({
		vendorId,
		take: 100,
	});

	// Organize products by categories
	const { categoriesMap, allCategories } = useMemo(() => {
		const map: Record<string, typeof products> = {};
		const categories: Array<{ id: string; name: string }> = [];

		products.forEach((product) => {
			// Check if any of the product items have categories
			const productCategories = new Set<string>();

			product.items?.forEach((item) => {
				if (item.categories && item.categories.length > 0) {
					item.categories.forEach(({ category }) => {
						productCategories.add(category.id);
						if (!map[category.id]) {
							map[category.id] = [];
							categories.push({
								id: category.id,
								name: category.name,
							});
						}
					});
				}
			});

			// Add product to all its categories
			if (productCategories.size > 0) {
				productCategories.forEach((categoryId) => {
					map[categoryId].push(product);
				});
			} else {
				// Products without categories go to "Uncategorized"
				if (!map['uncategorized']) {
					map['uncategorized'] = [];
					categories.push({
						id: 'uncategorized',
						name: 'Uncategorized',
					});
				}
				map['uncategorized'].push(product);
			}
		});

		return { categoriesMap: map, allCategories: categories };
	}, [products]);

	// Create tabs: "All" first, then categories
	const tabs = useMemo(() => {
		const categoryTabs = allCategories.map((cat) => ({
			id: cat.id,
			label: cat.name,
		}));
		return [{ id: 'all', label: 'All' }, ...categoryTabs];
	}, [allCategories]);

	const [activeTab, setActiveTab] = useState('all');

	// Get products for the active tab
	const activeProducts = useMemo(() => {
		if (activeTab === 'all') {
			return products;
		}
		return categoriesMap[activeTab] || [];
	}, [activeTab, products, categoriesMap]);

	// Transform products into ProductListItem format
	const displayItems = useMemo(() => {
		return activeProducts.flatMap((product) => {
			if (!product.items || product.items.length === 0) {
				return [];
			}

			// Get the first product item to use for display
			const firstItem = product.items[0];

			return {
				id: firstItem.id,
				name: product.name, // Use product name
				description: product.description, // Use product description
				price: firstItem.price, // Use first item's price
				images: firstItem.images, // Use first item's images
				vendorId: firstItem.vendorId,
				productId: product.id,
				slug: firstItem.slug,
				isActive: firstItem.isActive,
				inStock: firstItem.inStock && product.inStock, // Both must be in stock
				product: {
					id: product.id,
					name: product.name,
					description: product.description,
				},
				// Store all items for potential expansion/variants
				allItems: product.items,
			};
		});
	}, [activeProducts]);

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

	if (products.length === 0) {
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
			{displayItems.length > 0 ? (
				<div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
					{displayItems.map((item, index) => (
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
									product: item.product,
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
