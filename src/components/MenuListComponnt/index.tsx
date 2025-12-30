'use client';

import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
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
		protected?: boolean;
		show?: boolean;
	}>;
}) => {
	const { data: session } = useSession();

	return (
		<div className='w-full space-y-2'>
			<p className='font-bold'>{menuTitle}</p>
			<div className='w-full bg-background rounded-lg flex flex-col'>
				{menuItems.map((item, index) => {
					const disabled = item.protected && !session;
					const isProtectedAndDontShoow =
						item.protected && !item.show && !session;

					if (isProtectedAndDontShoow) return null;
					if (item.link) {
						return (
							<Link
								key={index}
								href={disabled ? '#' : item.link}
								className={cn(
									'w-full p-5 flex items-center justify-between',
									disabled && 'opacity-50'
								)}>
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
								className={cn(
									'w-full p-5 flex items-center justify-between',
									disabled && 'opacity-50'
								)}
								onClick={() => {
									if (disabled) return;
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
