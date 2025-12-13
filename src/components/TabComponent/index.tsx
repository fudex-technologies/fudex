'use client';

import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import React, {
	Dispatch,
	SetStateAction,
	useEffect,
	useRef,
	useState,
} from 'react';
import { ClassNameValue } from 'tailwind-merge';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

interface Tab {
	id: string;
	label: string;
	icon?: React.ReactNode;
	disabled?: boolean;
	badge?: string | number;
	content?: React.ReactNode;
}

interface TabComponentProps {
	tabs: Tab[];
	activeTab: string;
	setActiveTab: Dispatch<SetStateAction<string>>;
	onTabChange?: (tabId: string) => void;
	className?: ClassNameValue;
	showContent?: boolean;
	contentClassName?: ClassNameValue;
	innerFullWidth?: boolean;
	activeByPathname?: boolean;
}

const TabComponent: React.FC<TabComponentProps> = ({
	tabs,
	activeTab,
	setActiveTab,
	onTabChange,
	className = '',
	showContent = true,
	contentClassName = '',
	innerFullWidth = false,
	activeByPathname = true,
}) => {
	const pathname = usePathname();
	const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
	tabsRef.current = [];
	const [indicatorStyle, setIndicatorStyle] = useState({
		left: 0,
		width: 0,
	});

	useEffect(() => {
		if (activeByPathname) {
			setActiveTab(pathname.split('/').at(-1) || '');
		}
	}, [pathname, activeByPathname, setActiveTab]);

	useEffect(() => {
		const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab);
		const activeTabElem = tabsRef.current[activeTabIndex];

		if (activeTabElem) {
			setIndicatorStyle({
				left: activeTabElem.offsetLeft,
				width: activeTabElem.offsetWidth,
			});
		} else {
			setIndicatorStyle({
				left: 0,
				width: 0,
			});
		}
	}, [activeTab, tabs]);

	const activeTabData = tabs.find((tab) => tab.id === activeTab);
	const activeContent = activeTabData?.content;

	return (
		<div className={`w-full flex flex-col gap-5 my-3 ${className}`}>
			<div className='w-full border-b border-muted'>
				<ScrollArea className='w-full h-12 whitespace-nowrap '>
					<div className='relative flex w-max space-x-4 mx-5 justify-between '>
						{tabs.map((tab, index) => (
							<button
								key={tab.id}
								ref={(el) => {
									tabsRef.current[index] = el;
								}}
								onClick={() =>
									!tab.disabled && onTabChange
										? onTabChange(tab.id)
										: !tab.disabled && !onTabChange
										? setActiveTab(tab.id)
										: null
								}
								disabled={tab.disabled}
								className={cn(
									`p-2 flex items-center gap-2 font-medium transition-all whitespace-nowrap text-foreground/50 text-nowrap text-center  duration-200 flex-1 justify-center sm:w-fit sm:justify-start`,
									activeTab === tab.id
										? 'text-foreground'
										: tab.disabled
										? 'text-gray-300 cursor-not-allowed'
										: 'text-gray-500 hover:text-gray-700',
									innerFullWidth && 'flex-1! justify-center!'
								)}
								aria-selected={activeTab === tab.id}
								role='tab'>
								{tab.icon && (
									<span
										className={`${
											activeTab === tab.id
												? 'text-primary'
												: tab.disabled
												? 'text-gray-300'
												: 'text-gray-500'
										}`}>
										{tab.icon}
									</span>
								)}
								{tab.label}
								{tab.badge && (
									<span
										className={`
											ml-1 px-2 py-0.5 rounded-full text-xs font-medium
											${
												activeTab === tab.id
													? 'bg-primary text-primary-foreground'
													: 'bg-gray-300 text-gray-600 dark:text-gray-400'
											}
										`}>
										{tab.badge}
									</span>
								)}
							</button>
						))}
						<div
							className='absolute -bottom-1.5 h-1 bg-primary transition-all duration-300 rounded-full'
							style={{
								left: indicatorStyle.left,
								width: indicatorStyle.width,
							}}
						/>
					</div>
					<ScrollBar orientation='horizontal' className='invisible' />
				</ScrollArea>
			</div>

			{showContent && activeContent && (
				<div className={`w-full ${contentClassName}`}>
					{activeContent}
				</div>
			)}
		</div>
	);
};

export default TabComponent;
