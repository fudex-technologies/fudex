'use client';

import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatCurency, shortenText } from '@/lib/commonFunctions';
import { Trash2, Package } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ConfirmationAlertDialogue from '@/components/ConfirmationAlertDialogue';
import CreateProductModal from './CreateProductModal';
import CreateProductItemModal from './CreateProductItemModal';
import EditProductItemModal from './EditPRoductItemModal';

const VendorProductsManagementSection = () => {
	const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<{
		id: string;
		type: 'product' | 'item';
	} | null>(null);

	const {
		useGetMyProducts,
		useGetMyProductItems,
		deleteProduct,
		deleteProductItem,
	} = useVendorDashboardActions();

	const {
		data: products = [],
		isLoading: productsLoading,
		refetch: refetchProducts,
	} = useGetMyProducts();
	const {
		data: productItems = [],
		isLoading: itemsLoading,
		refetch: refetchItems,
	} = useGetMyProductItems();
	const deleteProductMutation = deleteProduct({
		onSuccess: () => {
			refetchProducts();
			setDeleteDialogOpen(false);
		},
	});
	const deleteItemMutation = deleteProductItem({
		onSuccess: () => {
			refetchItems();
			setDeleteDialogOpen(false);
		},
	});

	const handleDelete = () => {
		if (!itemToDelete) return;
		if (itemToDelete.type === 'product') {
			deleteProductMutation.mutate({ id: itemToDelete.id });
		} else {
			deleteItemMutation.mutate({ id: itemToDelete.id });
		}
	};

	const filteredItems = selectedProduct
		? productItems.filter((item) => item.productId === selectedProduct)
		: productItems;

	if (productsLoading || itemsLoading) {
		return (
			<div className='p-5 space-y-4'>
				<Skeleton className='h-10 w-full' />
				<Skeleton className='h-32 w-full' />
				<Skeleton className='h-32 w-full' />
			</div>
		);
	}

	return (
		<div className='p-5 space-y-6'>
			{/* Header */}
			<div className='flex flex-wrap items-center justify-between'>
				<div>
					<h2 className='text-2xl font-semibold'>
						Products Management
					</h2>
					<p className='text-foreground/70 text-sm'>
						Manage your products and product items
					</p>
				</div>
				<CreateProductModal
					onSuccess={() => {
						refetchProducts();
						refetchItems();
					}}
				/>
			</div>

			{/* Products List */}
			<div className='space-y-4'>
				<h3 className='text-lg font-semibold'>
					Products ({products.length})
				</h3>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{products.map((product) => (
						<div
							key={product.id}
							className='p-4 border rounded-lg space-y-2 hover:border-primary transition-colors'>
							<div className='flex items-start justify-between'>
								<div className='flex-1'>
									<h4 className='font-semibold'>
										{product.name}
									</h4>
									{product.description && (
										<p className='text-sm text-foreground/70'>
											{shortenText(
												product.description,
												50
											)}
										</p>
									)}
									<p className='text-xs text-foreground/50 mt-1'>
										{product.items.length} variant
										{product.items.length !== 1 ? 's' : ''}
									</p>
								</div>
								<Badge
									variant={
										product.inStock
											? 'default'
											: 'secondary'
									}>
									{product.inStock
										? 'In Stock'
										: 'Out of Stock'}
								</Badge>
							</div>
							<div className='flex gap-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={() =>
										setSelectedProduct(
											selectedProduct === product.id
												? null
												: product.id
										)
									}>
									View Items
								</Button>
								<Button
									variant='outline'
									size='sm'
									onClick={() => {
										setItemToDelete({
											id: product.id,
											type: 'product',
										});
										setDeleteDialogOpen(true);
									}}>
									<Trash2 size={14} />
								</Button>
							</div>
						</div>
					))}
					{products.length === 0 && (
						<div className='col-span-full text-center py-10 text-foreground/50'>
							<Package
								size={48}
								className='mx-auto mb-4 opacity-50'
							/>
							<p>No products yet. Create your first product!</p>
						</div>
					)}
				</div>
			</div>

			{/* Product Items List */}
			<div className='space-y-4'>
				<div className='flex items-center justify-between'>
					<h3 className='text-lg font-semibold'>
						Product Items ({filteredItems.length})
						{selectedProduct && (
							<Button
								variant='link'
								size='sm'
								onClick={() => setSelectedProduct(null)}>
								Clear filter
							</Button>
						)}
					</h3>
					<CreateProductItemModal
						products={products}
						onSuccess={() => {
							refetchItems();
						}}
					/>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{filteredItems.map((item) => (
						<div
							key={item.id}
							className='p-4 border rounded-lg space-y-2 hover:border-primary transition-colors'>
							{item.images && item.images.length > 0 && (
								<ImageWithFallback
									src={item.images[0]}
									alt={item.name}
									className='w-full h-32 object-cover rounded-md mb-2'
								/>
							)}
							<div className='flex items-start justify-between'>
								<div className='flex-1'>
									<h4 className='font-semibold'>
										{item.name}
									</h4>
									{item.description && (
										<p className='text-sm text-foreground/70'>
											{shortenText(item.description, 50)}
										</p>
									)}
									<p className='text-sm font-semibold mt-1'>
										{formatCurency(item.price)}
									</p>
								</div>
							</div>
							<div className='flex gap-2 flex-wrap'>
								<Badge
									variant={
										item.isActive ? 'default' : 'secondary'
									}>
									{item.isActive ? 'Active' : 'Inactive'}
								</Badge>
								<Badge
									variant={
										item.inStock ? 'default' : 'destructive'
									}>
									{item.inStock ? 'In Stock' : 'Out of Stock'}
								</Badge>
							</div>
							<div className='flex gap-2'>
								<EditProductItemModal
									item={item}
									onSuccess={() => {
										refetchItems();
									}}
								/>
								<Button
									variant='outline'
									size='sm'
									onClick={() => {
										setItemToDelete({
											id: item.id,
											type: 'item',
										});
										setDeleteDialogOpen(true);
									}}>
									<Trash2 size={14} />
								</Button>
							</div>
						</div>
					))}
					{filteredItems.length === 0 && (
						<div className='col-span-full text-center py-10 text-foreground/50'>
							<Package
								size={48}
								className='mx-auto mb-4 opacity-50'
							/>
							<p>No product items yet. Create your first item!</p>
						</div>
					)}
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			{itemToDelete && (
				<ConfirmationAlertDialogue
					open={deleteDialogOpen}
					setOpen={setDeleteDialogOpen}
					action={handleDelete}
					subtitle={`	This will ${
						itemToDelete?.type === 'product'
							? 'deactivate the product and all its items'
							: 'deactivate this product item'
					}. This action cannot be undone.`}
					buttonActionLabel='Delete'
					buttonVariant='destructive'
				/>
			)}
		</div>
	);
};

export default VendorProductsManagementSection;
