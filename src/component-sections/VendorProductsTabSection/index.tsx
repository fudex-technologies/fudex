'use client';

import ProductListItem from '@/components/ProductListItem';
import TabComponent from '@/components/TabComponent';
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
			<div className='w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
				{productsDummyData[activeTab].map((product, index) => (
					<div key={index} className='border-b border-muted'>
						<ProductListItem {...product} />
					</div>
				))}
			</div>
		</div>
	);
};

export default VendorProductsTabSection;
