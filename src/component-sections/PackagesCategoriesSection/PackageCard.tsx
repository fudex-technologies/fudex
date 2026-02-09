'use client';

import React, { useEffect, useState } from 'react';
import PlusIcon from '../../../public/assets/plus-icon.svg';
import CounterComponent from '@/components/CounterComponent';
import { formatCurency } from '@/lib/commonFunctions';
import { usePackageCartStore } from '@/store/package-cart-store';

interface PackageCardProps {
	singlePackage: {
		id: string;
		name: string;
		description: string;
		price: string | number;
		imageUrl: string;
	};
	packageId?: string;
	initialQuantity?: number;
	onQuantityChange?: (id: string, quantity: number) => void;
}

const PackageCard = ({
	singlePackage,
	packageId,
	initialQuantity = 0,
	onQuantityChange,
}: PackageCardProps) => {
	const { addItem, updateItem, getItem, items } = usePackageCartStore();

	// Get the cart item for this package item
	const cartItem = getItem(singlePackage.id);
	const [quantity, setQuantity] = useState(
		cartItem?.quantity || initialQuantity || 0,
	);

	// Sync local state with cart store
	useEffect(() => {
		const currentCartItem = getItem(singlePackage.id);
		setQuantity(currentCartItem?.quantity || 0);
	}, [items, singlePackage.id, getItem]);

	const handleAddClick = () => {
		if (onQuantityChange) {
			onQuantityChange(singlePackage.id, 1);
		} else {
			addItem(singlePackage.id, 1);
		}
	};

	const handleQuantityChange = (newQuantity: number) => {
		if (onQuantityChange) {
			onQuantityChange(singlePackage.id, newQuantity);
		} else if (newQuantity === 0 && cartItem) {
			// Remove item if quantity is 0
			updateItem(cartItem.id, 0);
		} else if (cartItem) {
			// Update existing item
			updateItem(cartItem.id, newQuantity);
		} else if (newQuantity > 0) {
			// Add new item
			addItem(singlePackage.id, newQuantity);
		}
	};

	return (
		<div className='flex flex-col gap-2'>
			{/* Image container with plus button */}
			<div className='relative w-full aspect-square rounded-lg overflow-hidden bg-muted'>
				<img
					src={singlePackage.imageUrl}
					alt={singlePackage.name}
					className='w-full h-full object-cover'
				/>

				{/* Plus button or Counter */}
				<div className='absolute bottom-2 right-2'>
					{quantity === 0 ? (
						<button
							onClick={handleAddClick}
							className='w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow'
							aria-label='Add to cart'>
							<PlusIcon
								className='w-[15px] h-[15px]'
								style={{ color: '#1a1a1a' }}
							/>
						</button>
					) : (
						<CounterComponent
							count={quantity}
							setCount={setQuantity}
							countChangeEffect={handleQuantityChange}
							min={0}
							className='max-w-[200px] py-2 gap-3'
						/>
					)}
				</div>
			</div>

			{/* Product details */}
			<div className='flex flex-col gap-1'>
				<h3 className=' font-medium' style={{ color: '#1a1a1a' }}>
					{singlePackage.name}
				</h3>
				<p
					className='text-sm font-normal leading-[18px] text-wrap'
					style={{ color: '#858585' }}>
					{singlePackage.description}
				</p>
				<p className=' font-medium' style={{ color: '#1a1a1a' }}>
					{formatCurency(singlePackage.price as number)}
				</p>
			</div>
		</div>
	);
};

export default PackageCard;
