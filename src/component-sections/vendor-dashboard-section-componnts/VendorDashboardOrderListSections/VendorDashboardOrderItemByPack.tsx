import { formatCurency } from '@/lib/commonFunctions';
import { Product } from '@prisma/client';
import React from 'react';

// Define types for the props
interface Addon {
	addonProductItemId: string;
	quantity: number;
	name?: string;
	price?: number;
	parentProduct: Product;
}

interface MainItem {
	id: string;
	name: string;
	quantity?: number;
	price?: number;
	pricingType?: 'FIXED' | 'PER_UNIT';
	unitName?: string | null;
	parentProduct: Product
}

interface Pack {
	mainItem: MainItem;
	addons: Addon[];
}

interface AddonItem {
	id: string;
	name: string;
}

interface VendorDashboardOrderItemByPackProps {
	pack: Pack;
	index: number;
	addonItems: AddonItem[];
	packTotal: number;
}

const VendorDashboardOrderItemByPack: React.FC<
	VendorDashboardOrderItemByPackProps
> = ({ pack, index, addonItems, packTotal }) => {
	const mainItem = pack.mainItem;

	return (
		<div className='p-5 border-b border-foreground/50'>
			<div className='flex justify-between mb-3'>
				<p className='font-semibold'>Pack #{index + 1}</p>
				<p className='font-semibold text-lg'>
					{formatCurency(packTotal)}
				</p>
			</div>
			<div className='flex justify-between items-start'>
				<div className='flex-1'>
					<div className='flex items-center justify-between'>
						<div className='flex gap-2 items-center flex-1'>
							<span className='w-2 h-2 rounded-full bg-foreground' />{' '}
							<div className='flex-1'>
								<p>Main product: {pack.mainItem.parentProduct.name}</p>
								<p className='text-lg font-medium'>
									Variant: {mainItem.name}
									{mainItem.pricingType === 'PER_UNIT' &&
										mainItem.unitName && (
											<span className='text-sm text-foreground/50 ml-1 font-normal'>
												({mainItem.quantity || 1} {mainItem.unitName}
												{(mainItem.quantity || 1) !== 1 ? 's' : ''})
											</span>
										)}
									{mainItem.pricingType !== 'PER_UNIT' && (
										<span className='text-sm text-foreground/50 ml-1 font-normal'>
											x{mainItem.quantity || 1}
										</span>
									)}
								</p>
								{mainItem.pricingType === 'PER_UNIT' &&
									mainItem.unitName &&
									mainItem.price !== undefined && (
										<p className='text-xs text-foreground/50 mt-0.5'>
											{formatCurency(mainItem.price)} per{' '}
											{mainItem.unitName}
										</p>
									)}
								{mainItem.pricingType !== 'PER_UNIT' &&
									mainItem.price !== undefined && (
										<p className='text-sm text-foreground/70 mt-0.5'>
											{formatCurency(mainItem.price)} / unit
										</p>
									)}
							</div>
						</div>
					</div>
					{pack.addons && pack.addons.length > 0 && (
						<div className='flex flex-col gap-1 pl-4 mt-2'>
							<p className='text-[10px] font-bold uppercase text-foreground/40 mb-1'>
								Addons
							</p>
							{pack.addons.map((addon, idx) => {
								const addonItem = addonItems.find(
									(item) =>
										item?.id === addon.addonProductItemId
								);
								const name = addon.name || addonItem?.name;
								if (!name) return null;

								return (
									<div
										key={idx}
										className='flex items-center justify-between text-sm'>
										<p className='font-light'>
											({addon.parentProduct.name})	{name} x{addon.quantity}
										</p>
										{addon.price !== undefined && (
											<p className='text-[10px] text-foreground/50'>
												+{formatCurency(addon.price)} ea
											</p>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default VendorDashboardOrderItemByPack;
