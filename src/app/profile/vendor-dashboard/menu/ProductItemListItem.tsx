'use client';

import EditProductItemModal from '@/component-sections/VendorProductsManagementSection/EditPRoductItemModal';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { formatCurency } from '@/lib/commonFunctions';
import { useVendorDashboardActions } from '@/api-hooks/useVendorDashboardActions';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

export default function ProductItemListItem({
	item,
	onSuccess,
	onDelete,
}: {
	item: any;
	onSuccess: () => void;
	onDelete: () => void;
}) {
	const { updateProductItem } = useVendorDashboardActions();

	const updateMutation = updateProductItem({
		onSuccess: () => {
			toast.success('Item updated');
			onSuccess();
		},
	});

	const handleStockToggle = (inStock: boolean) => {
		updateMutation.mutate({
			id: item.id,
			data: { inStock },
		});
	};

	return (
		<div className='w-full py-3 flex gap-2 flex-wrap justify-between items-center'>
			<div className='flex items-center gap-2'>
				<p className='font-semibold'>{item.name}</p>
				<p>{formatCurency(item.price)}</p>
			</div>

			<div className='flex items-center gap-2'>
				<Switch
					checked={item.inStock}
					onCheckedChange={handleStockToggle}
					disabled={updateMutation.isPending}
				/>
				<p
					className={`text-sm ${
						item.inStock ? 'text-primary' : 'text-foreground/60'
					}`}>
					{item.inStock ? 'In Stock' : 'Out of Stock'}
				</p>
				<EditProductItemModal item={item} onSuccess={onSuccess} />
				<Button size={'sm'} variant={'ghost'} onClick={onDelete}>
					<Trash2 size={16} className='text-destructive' />
				</Button>
			</div>
		</div>
	);
}