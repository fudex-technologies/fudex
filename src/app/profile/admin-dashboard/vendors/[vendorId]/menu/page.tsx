'use client';

import { useAdminActions } from '@/api-hooks/useAdminActions';
import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { Button } from '@/components/ui/button';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Trash2, Package, ArrowLeft, Plus } from 'lucide-react';
import { use, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ConfirmationAlertDialogue from '@/components/ConfirmationAlertDialogue';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { Separator } from '@/components/ui/separator';
import CreateProductModal from '@/component-sections/VendorProductsManagementSection/CreateProductModal';
import EditProductModal from '@/component-sections/VendorProductsManagementSection/EditProductModal';
import CreateProductItemModal from '@/component-sections/VendorProductsManagementSection/CreateProductItemModal';
// import ProductItemListItem from '../../vendor-dashboard/menu/ProductItemListItem';
import GoBackButton from '@/components/GoBackButton';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import Link from 'next/link';
import ProductItemListItem from '@/app/profile/vendor-dashboard/menu/ProductItemListItem';

export default function AdminVendorMenuPage({
	params,
}: {
	params: Promise<{ vendorId: string }>;
}) {
	const { vendorId } = use(params);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<{
		id: string;
		type: 'product' | 'item';
	} | null>(null);

	const { useInfiniteListVendorProducts } = useAdminActions();

	const { deleteProduct, deleteProductItem } = useVendorDashboardActions();

	const {
		data,
		isLoading: productsLoading,
		refetch: refetchProducts,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteListVendorProducts({ vendorId, limit: 50 });

	const products = data?.pages.flatMap((page) => page.items) || [];
	// Flatten all items from all products for count
	const allItemsCount = products.reduce(
		(acc, p) => acc + (p.items?.length || 0),
		0,
	);

	const deleteProductMutation = deleteProduct({
		onSuccess: () => {
			refetchProducts();
			setDeleteDialogOpen(false);
		},
	});
	const deleteItemMutation = deleteProductItem({
		onSuccess: () => {
			refetchProducts();
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

	const isLoading = productsLoading;

	return (
		<SectionWrapper className='p-6'>
			<div className='flex flex-col gap-6'>
				<div className='flex items-center gap-4'>
					<Link href='/profile/admin-dashboard/vendors'>
						<Button
							variant='ghost'
							size='icon'
							className='rounded-full'>
							<ArrowLeft size={20} />
						</Button>
					</Link>
					<div>
						<h2 className='text-3xl font-bold tracking-tight'>
							Vendor Menu
						</h2>
						<p className='text-muted-foreground'>
							Manage categories and product variations for this
							vendor.
						</p>
					</div>
				</div>

				<div className='w-full flex items-center justify-between bg-card p-4 rounded-xl border border-border/50'>
					<div className='flex items-center gap-2'>
						<Package className='text-primary' size={20} />
						<p className='font-semibold'>
							Total Variations:{' '}
							<span className='text-primary'>
								{allItemsCount}
							</span>
						</p>
					</div>
					<CreateProductModal
						onSuccess={refetchProducts}
						vendorId={vendorId}
					/>
				</div>

				{isLoading ? (
					<div className='space-y-4'>
						<Skeleton className='h-20 w-full rounded-xl' />
						<Skeleton className='h-20 w-full rounded-xl' />
						<Skeleton className='h-20 w-full rounded-xl' />
					</div>
				) : products.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl border-border/50 bg-card'>
						<Package
							size={48}
							className='mx-auto mb-4 opacity-20'
						/>
						<p className='text-xl text-muted-foreground font-medium'>
							This vendor has no menu items yet.
						</p>
					</div>
				) : (
					<Accordion
						type='single'
						collapsible
						className='w-full space-y-3'>
						{products.map((product) => (
							<AccordionItem
								key={product.id}
								value={product.id}
								className='border border-border/50 rounded-xl px-4 bg-card overflow-hidden transition-all data-[state=open]:border-primary/30 data-[state=open]:shadow-md'>
								<AccordionTrigger className='hover:no-underline py-4'>
									<div className='flex items-center gap-3'>
										<div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold'>
											{product.name.charAt(0)}
										</div>
										<p className='font-bold text-lg'>
											{product.name}
										</p>
									</div>
								</AccordionTrigger>
								<AccordionContent className='pb-4 pt-2 border-t border-border/50'>
									<div className='w-full flex items-center gap-2 mb-4'>
										<CreateProductItemModal
											products={[product]}
											onSuccess={refetchProducts}
											vendorId={vendorId}
										/>
										<div className='h-4 w-px bg-border mx-1' />
										<EditProductModal
											product={product}
											onSuccess={refetchProducts}
										/>
										<Button
											size={'icon'}
											variant={'ghost'}
											className='h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive'
											onClick={() => {
												setItemToDelete({
													id: product.id,
													type: 'product',
												});
												setDeleteDialogOpen(true);
											}}>
											<Trash2 size={16} />
										</Button>
									</div>

									<div className='bg-muted/30 rounded-lg p-4 space-y-1'>
										<p className='font-bold mb-3 text-sm text-foreground/70 flex items-center gap-2'>
											<span className='w-1.5 h-1.5 rounded-full bg-primary' />
											Menu Variations (
											{product.items?.length || 0})
										</p>

										{(product.items || []).map(
											(
												item: any,
												index: number,
												array: any[],
											) => (
												<div key={item.id}>
													<ProductItemListItem
														item={item}
														isAdmin={true}
														onSuccess={
															refetchProducts
														}
														onDelete={() => {
															setItemToDelete({
																id: item.id,
																type: 'item',
															});
															setDeleteDialogOpen(
																true,
															);
														}}
													/>
													{index <
														array.length - 1 && (
														<Separator className='opacity-50' />
													)}
												</div>
											),
										)}
										{(!product.items ||
											product.items.length === 0) && (
											<p className='text-sm text-muted-foreground py-2 italic text-center'>
												No variations added yet.
											</p>
										)}
									</div>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				)}

				{hasNextPage && (
					<div className='flex justify-center py-4'>
						<Button
							variant='outline'
							onClick={() => fetchNextPage()}
							disabled={isFetchingNextPage}>
							{isFetchingNextPage
								? 'Loading more...'
								: 'Load More Products'}
						</Button>
					</div>
				)}
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
		</SectionWrapper>
	);
}
