'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

const MenuListComponent = ({
	menuTitle,
	menuItems,
}: {
	menuTitle: string;
	menuItems: Array<{
		link?: string;
		title: string;
		icon: React.ReactNode;
		onClick?: () => void;
	}>;
}) => {
	return (
		<div className='w-full space-y-2'>
			<p className='font-bold'>{menuTitle}</p>
			<div className='w-full bg-background rounded-lg flex flex-col'>
				{menuItems.map((item, index) => {
					if (item.link) {
						return (
							<Link
								key={index}
								href={item.link}
								className='w-full p-5 flex items-center justify-between'>
								<div className='flex gap-2 items-center'>
									{item.icon}
									<p className='text-lg'>{item.title}</p>
								</div>
								<ChevronRight size={16} />
							</Link>
						);
					} else {
						return (
							<div
								key={index}
								className='w-full p-5 flex items-center justify-between cursor-pointer'
								onClick={() => {
									item.onClick && item.onClick();
								}}>
								<div className='flex gap-2 items-center'>
									{item.icon}
									<p className='text-lg'>{item.title}</p>
								</div>
								<ChevronRight size={16} />
							</div>
						);
					}
				})}
			</div>
		</div>
	);
};

export default MenuListComponent;
