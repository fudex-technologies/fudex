'use client';

import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { Button } from '@/components/ui/button';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Trash2, Package } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ConfirmationAlertDialogue from '@/components/ConfirmationAlertDialogue';
import VendorDashboardMobileBottomNav from '@/components/navigation-components/VendorDashboardMobileBottomNav';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { Separator } from '@/components/ui/separator';
import CreateProductModal from '@/component-sections/VendorProductsManagementSection/CreateProductModal';
import EditProductModal from '@/component-sections/VendorProductsManagementSection/EditProductModal';
import CreateProductItemModal from '@/component-sections/VendorProductsManagementSection/CreateProductItemModal';
import ProductItemListItem from './ProductItemListItem';
import { MenuInfoTrigger } from '@/components/vendor-dashboard-components/MenuInfoTrigger';

export default function VendorDashboardMenuPage() {
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
			refetchItems();
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

	const allItemsCount = productItems.length;

	const isLoading = productsLoading || itemsLoading;

	return (
		<PageWrapper className='max-w-none w-full bg-secondary p-0 flex justify-center items-center'>
			<div className='w-full max-w-[1400px] flex flex-col'>
				<div className='flex-1 w-full flex md:h-screen items-center justify-center py-10 '>
					<div className='flex items-center gap-10 w-full px-5 text-white'>
						<div className='flex items-center gap-4'>
							<h1 className='font-semibold text-xl'>Menu</h1>
							<MenuInfoTrigger />
						</div>
					</div>
				</div>
				<div className='flex-2 w-full min-h-[90vh] md:min-h-screen flex justify-center bg-background rounded-t-4xl p-5'>
					<div className='w-full max-w-lg space-y-5'>
						<div className='w-full flex items-center justify-between'>
							<p className='text-primary'>
								Total Menu Variations ({allItemsCount})
							</p>
							<CreateProductModal
								onSuccess={() => {
									refetchProducts();
									refetchItems();
								}}
							/>
						</div>

						{isLoading ? (
							<div className='space-y-4'>
								<Skeleton className='h-12 w-full' />
								<Skeleton className='h-12 w-full' />
								<Skeleton className='h-12 w-full' />
							</div>
						) : products.length === 0 ? (
							<div className='col-span-full text-center py-10 text-foreground/50'>
								<Package
									size={48}
									className='mx-auto mb-4 opacity-50'
								/>
								<p>
									No menu items yet. Create your first menu
									item!
								</p>
							</div>
						) : (
							<Accordion
								type='single'
								collapsible
								className='w-full space-y-2'>
								{products.map((product) => (
									<AccordionItem
										key={product.id}
										value={product.id}
										className='border! rounded-lg px-4'>
										<AccordionTrigger>
											<p className='font-semibold'>
												{product.name}
											</p>
										</AccordionTrigger>
										<AccordionContent className='w-full'>
											<div className='w-full flex items-center gap-2 border-b! pb-2 mb-2'>
												<CreateProductItemModal
													products={[product]}
													onSuccess={refetchItems}
												/>
												<EditProductModal
													product={product}
													onSuccess={refetchProducts}
												/>
												<Button
													size={'sm'}
													variant={'ghost'}
													onClick={() => {
														setItemToDelete({
															id: product.id,
															type: 'product',
														});
														setDeleteDialogOpen(
															true
														);
													}}>
													<Trash2
														size={16}
														className='text-destructive'
													/>
												</Button>
											</div>

											<p className='font-bold my-2 text-sm text-foreground/70'>
												Menu Variations (
												{
													productItems.filter(
														(item) =>
															item.productId ===
															product.id
													).length
												}
												)
											</p>

											{productItems
												.filter(
													(item) =>
														item.productId ===
														product.id
												)
												.map((item, index, array) => (
													<div key={item.id}>
														<ProductItemListItem
															item={item}
															onSuccess={
																refetchItems
															}
															onDelete={() => {
																setItemToDelete(
																	{
																		id: item.id,
																		type: 'item',
																	}
																);
																setDeleteDialogOpen(
																	true
																);
															}}
														/>
														{index <
															array.length -
																1 && (
															<Separator />
														)}
													</div>
												))}
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						)}
					</div>
				</div>
			</div>

			{itemToDelete && (
				<ConfirmationAlertDialogue
					open={deleteDialogOpen}
					setOpen={setDeleteDialogOpen}
					action={handleDelete}
					subtitle={`This will deactivate the ${
						itemToDelete.type === 'product'
							? 'menu item and all its variations'
							: 'menu variation'
					}. This action cannot be undone.`}
					buttonActionLabel='Delete'
					buttonVariant='destructive'
				/>
			)}
			<VendorDashboardMobileBottomNav />
		</PageWrapper>
	);
}
