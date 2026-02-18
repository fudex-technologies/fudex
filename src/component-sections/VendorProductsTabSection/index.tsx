'use client';

import ProductListItem from '@/components/ProductListItem';
import TabComponent from '@/components/TabComponent';
import { Separator } from '@/components/ui/separator';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'motion/react';

const VendorProductsTabSection = ({ vendorId }: { vendorId: string }) => {
	const { useListProducts } = useVendorProductActions();
	const { data: products = [], isLoading } = useListProducts({
		vendorId,
		take: 100,
	});

	// Organize products by categories
	const { categoriesMap, allCategories } = useMemo(() => {
		const map: Record<string, typeof products> = {};
		const categories: Array<{
			id: string;
			name: string;
			arrangementIndex: number;
		}> = [];

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
								arrangementIndex:
									category.arrangementIndex || 0,
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
						arrangementIndex: 0,
					});
				}
				map['uncategorized'].push(product);
			}
		});

		// Sort categories by arrangementIndex
		categories.sort((a, b) => {
			if (a.id === 'uncategorized') return 1;
			if (b.id === 'uncategorized') return -1;
			return (a as any).arrangementIndex - (b as any).arrangementIndex;
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
			const sortedProducts: typeof products = [];
			const seenProductIds = new Set<string>();

			allCategories.forEach((cat) => {
				const catProducts = categoriesMap[cat.id];
				if (catProducts) {
					catProducts.forEach((p) => {
						if (!seenProductIds.has(p.id)) {
							sortedProducts.push(p);
							seenProductIds.add(p.id);
						}
					});
				}
			});

			return sortedProducts;
		}
		return categoriesMap[activeTab] || [];
	}, [activeTab, products, categoriesMap, allCategories]);

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

	const containerVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.05,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 10 },
		show: { opacity: 1, y: 0 },
	};

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
			<AnimatePresence mode='wait'>
				{displayItems.length > 0 ? (
					<motion.div
						key={activeTab}
						initial='hidden'
						animate='show'
						exit='hidden'
						variants={containerVariants}
						className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
						{displayItems.map((item, index) => (
							<motion.div
								key={`${item.id}-${index}`}
								variants={itemVariants}
								className='w-full'>
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
							</motion.div>
						))}
					</motion.div>
				) : (
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className='text-foreground/50 text-center py-8 mt-4'>
						No products in this category
					</motion.p>
				)}
			</AnimatePresence>
		</div>
	);
};

export default VendorProductsTabSection;
