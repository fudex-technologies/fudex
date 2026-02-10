'use client';

import { useState } from 'react';
import { usePackageAdminActions } from '@/api-hooks/usePackageActions';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Search, CheckWithUnderline } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatCurency } from '@/lib/commonFunctions';
import { useDebounce } from '@/hooks/useDebounce';

interface PackageAddonsManagementProps {
	packageId: string;
	onSuccess: () => void;
}

export default function PackageAddonsManagement({
	packageId,
	onSuccess,
}: PackageAddonsManagementProps) {
	const {
		useGetPackageById,
		useAddPackageAddon,
		useRemovePackageAddon,
		useTogglePackageAddonStatus,
		useSearchProductItemsForAddon,
	} = usePackageAdminActions();

	const { data: packageData, refetch } = useGetPackageById(
		{ id: packageId },
		{ enabled: !!packageId },
	);

	const addons = packageData?.addons || [];

	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [deletingAddonId, setDeletingAddonId] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const debouncedSearch = useDebounce(searchQuery, 300);

	const { data: searchResults, isLoading: isSearching } =
		useSearchProductItemsForAddon(
			{ query: debouncedSearch, limit: 10 },
			{ enabled: isAddDialogOpen && debouncedSearch.length > 0 },
		);

	const addMutation = useAddPackageAddon({
		onSuccess: () => {
			refetch();
			onSuccess();
			setIsAddDialogOpen(false);
			setSearchQuery('');
		},
	});

	const removeMutation = useRemovePackageAddon({
		onSuccess: () => {
			refetch();
			onSuccess();
			setDeletingAddonId(null);
		},
	});

	const toggleStatusMutation = useTogglePackageAddonStatus({
		onSuccess: () => {
			refetch();
			onSuccess();
		},
	});

	const handleAddAddon = (productItemId: string) => {
		addMutation.mutate({
			packageId,
			productItemId,
		});
	};

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h3 className='text-xl font-semibold'>Package Addons</h3>
					<p className='text-sm text-muted-foreground'>
						Curate optional addons for this package from existing
						products.
					</p>
				</div>
				<Dialog
					open={isAddDialogOpen}
					onOpenChange={setIsAddDialogOpen}>
					<DialogTrigger asChild>
						<Button className='flex items-center gap-2'>
							<Plus size={18} />
							Add Addon
						</Button>
					</DialogTrigger>
					<DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>Add Product as Addon</DialogTitle>
						</DialogHeader>
						<div className='space-y-4 py-4'>
							<div className='relative'>
								<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
								<Input
									placeholder='Search products by name or vendor...'
									className='pl-9'
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
								/>
							</div>

							<div className='min-h-[200px] space-y-2'>
								{isSearching ? (
									<div className='py-8 text-center text-muted-foreground'>
										Searching...
									</div>
								) : searchResults?.length === 0 ? (
									<div className='py-8 text-center text-muted-foreground'>
										{searchQuery
											? 'No products found'
											: 'Start typing to search products'}
									</div>
								) : (
									searchResults?.map((productItem) => {
										const isAlreadyAdded = addons.some(
											(a) =>
												a.productItemId ===
												productItem.id,
										);
										return (
											<div
												key={productItem.id}
												className='flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50'>
												<div className='flex items-center gap-3'>
													<div className='h-10 w-10 relative rounded overflow-hidden bg-secondary'>
														{productItem
															.images?.[0] && (
															<ImageWithFallback
																src={
																	productItem
																		.images[0]
																}
																alt={
																	productItem.name
																}
																fill
																className='object-cover'
															/>
														)}
													</div>
													<div>
														<p className='font-medium text-sm'>
															{
																productItem
																	.product
																	.name
															}{' '}
															- {productItem.name}
														</p>
														<p className='text-xs text-muted-foreground'>
															{
																productItem
																	.product
																	.vendor.name
															}
														</p>
													</div>
												</div>
												<div className='flex items-center gap-3'>
													<p className='text-sm font-medium'>
														{formatCurency(
															productItem.price,
														)}
													</p>
													<Button
														size='sm'
														variant={
															isAlreadyAdded
																? 'ghost'
																: 'default'
														}
														disabled={
															isAlreadyAdded ||
															addMutation.isPending
														}
														onClick={() =>
															handleAddAddon(
																productItem.id,
															)
														}>
														{isAlreadyAdded
															? 'Added'
															: 'Add'}
													</Button>
												</div>
											</div>
										);
									})
								)}
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{addons.length === 0 ? (
				<div className='flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl border-border/50'>
					<p className='text-muted-foreground'>
						No addons configured for this package yet.
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{addons.map((addon) => (
						<div
							key={addon.id}
							className='p-4 border rounded-lg hover:border-primary/50 transition-colors flex flex-col gap-3'>
							<div className='flex items-start gap-3'>
								<div className='h-12 w-12 relative rounded-md overflow-hidden bg-secondary flex-shrink-0'>
									{addon.productItem.images?.[0] && (
										<ImageWithFallback
											src={addon.productItem.images[0]}
											alt={addon.productItem.name}
											fill
											className='object-cover'
										/>
									)}
								</div>
								<div className='flex-1 min-w-0'>
									<h4 className='font-semibold text-sm truncate'>
										{addon.productItem.product.name}
									</h4>
									<p className='text-xs text-muted-foreground truncate'>
										{addon.productItem.name}
									</p>
									<p className='text-xs text-muted-foreground truncate font-medium text-primary mt-0.5'>
										{addon.productItem.product.vendor.name}
									</p>
								</div>
							</div>

							<div className='flex items-center justify-between pt-2 border-t mt-auto'>
								<span className='font-semibold text-sm'>
									{formatCurency(addon.productItem.price)}
								</span>
								<div className='flex items-center gap-2'>
									<div className='flex items-center gap-2 mr-2'>
										<label
											htmlFor={`switch-${addon.id}`}
											className='text-xs text-muted-foreground cursor-pointer'>
											{addon.isActive
												? 'Active'
												: 'Inactive'}
										</label>
										<Switch
											id={`switch-${addon.id}`}
											checked={addon.isActive}
											onCheckedChange={(checked) =>
												toggleStatusMutation.mutate({
													id: addon.id,
													isActive: checked,
												})
											}
											disabled={
												toggleStatusMutation.isPending
											}
										/>
									</div>
									<Button
										size='icon'
										variant='ghost'
										className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
										onClick={() =>
											setDeletingAddonId(addon.id)
										}>
										<Trash2 size={16} />
									</Button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			<AlertDialog
				open={!!deletingAddonId}
				onOpenChange={(open) => !open && setDeletingAddonId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Addon</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove this addon from the
							package? This will not delete the product itself.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (deletingAddonId) {
									removeMutation.mutate({
										id: deletingAddonId,
									});
								}
							}}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
