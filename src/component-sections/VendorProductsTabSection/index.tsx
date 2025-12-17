'use client';

import ProductListItem from '@/components/ProductListItem';
import TabComponent from '@/components/TabComponent';
import { Separator } from '@/components/ui/separator';
import { productsDummyData } from '@/lib/dummyData';
import { useState } from 'react';

const VendorProductsTabSection = () => {
	const [activeTab, setActiveTab] = useState('main');
	return (
		<div className='w-full mt-5'>
			<TabComponent
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				activeByPathname={false}
				tabs={[
					{
						id: 'main',
						label: 'Main Meal',
					},
					{
						id: 'swallow',
						label: 'Swallow',
					},
					{
						id: 'protein',
						label: 'Protein',
					},
					{
						id: 'sides',
						label: 'Sides',
					},
					{
						id: 'drinks',
						label: 'Drinks',
					},
				]}
			/>
			<div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
				{productsDummyData[activeTab].map((product, index) => (
					<div key={`${index}-${product.name}`} className='w-full'>
						<Separator
							orientation={'horizontal'}
							className='w-full'
						/>
						<ProductListItem {...product} />
					</div>
				))}
			</div>
		</div>
	);
};

export default VendorProductsTabSection;
