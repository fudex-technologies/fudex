import { formatCurency } from '@/lib/commonFunctions';
import React from 'react';

// Define types for the props
interface Addon {
	addonProductItemId: string;
	quantity: number;
}

interface MainItem {
	id: string;
	name: string;
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
					<div className='flex gap-1 items-center'>
						<span className='w-2 h-2 rounded-full bg-foreground' />{' '}
						<p className='text-lg'>{mainItem.name}</p>
					</div>
					{pack.addons && pack.addons.length > 0 && (
						<div className='flex flex-col gap-1 pl-3 mt-1'>
							{pack.addons.map((addon, idx) => {
								const addonItem = addonItems.find(
									(item) =>
										item?.id === addon.addonProductItemId
								);
								if (!addonItem) return null;
								return (
									<p className='font-light text-sm' key={idx}>
										{addonItem.name} x{addon.quantity}
									</p>
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
