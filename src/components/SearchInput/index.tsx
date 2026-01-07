'use client';

import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { ClassNameValue } from 'tailwind-merge';
import { cn } from '@/lib/utils';
import { useSearchQueries } from '@/nuqs-hooks/useSearchQueries';
import { useRouter, usePathname } from 'next/navigation';
import { forwardRef, useEffect, useState } from 'react';

interface Props {
	className?: ClassNameValue;
	placeholder?: string;
	disabled?: boolean;
}
const SearchInput = forwardRef<HTMLInputElement, Props>(
	({ className, placeholder, disabled = false }, ref) => {
		const [search, setSearch] = useSearchQueries();
		const router = useRouter();
		const pathname = usePathname();
		const [localQuery, setLocalQuery] = useState(search.q || '');

		// Update local state when URL query changes
		useEffect(() => {
			setLocalQuery(search.q || '');
		}, [search.q]);

		// Debounced search effect
		useEffect(() => {
			// Only auto-search on the search page
			if (pathname === '/search') {
				const timer = setTimeout(() => {
					setSearch({ q: localQuery || null });
				}, 500); // 500ms debounce

				return () => clearTimeout(timer);
			}
		}, [localQuery, pathname, setSearch]);

		const handleSearch = (value: string) => {
			setLocalQuery(value);
			if (pathname !== '/search') {
				router.push(`/search?q=${encodeURIComponent(value)}`);
			} else {
				setSearch({ q: value });
			}
		};

		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter') {
				handleSearch(localQuery);
			}
		};

		return (
			<label
				className={cn(
					'min-w-[180px] w-full rounded-md flex items-center gap-3  p-2 border border-[#DADADA] bg-[#F8F8F8]',
					className
				)}>
				<Search width={20} height={20} color='#858585' />
				<Input
					ref={ref}
					type='search'
					value={localQuery}
					onChange={(e) => setLocalQuery(e.target.value)}
					onKeyDown={handleKeyDown}
					className='flex-1 border-0! ring-0 focus-visible:ring-0 outline-0! bg-transparent shadow-none! focus:outline-0! focus:border-0! p-0'
					placeholder={
						placeholder || 'Search for restaurants or dishes...'
					}
					disabled={disabled}
				/>
			</label>
		);
	}
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;

export const SearchInputSkeleton = ({
	placeholder,
}: {
	placeholder?: string;
}) => {
	return (
		<label
			className={cn(
				'min-w-[180px] w-full rounded-md flex items-center gap-3  p-2 border border-[#DADADA] bg-[#F8F8F8]'
			)}>
			<Search width={20} height={20} color='#858585' />
			<Input
				type='search'
				value={''}
				className='flex-1 border-0! ring-0 focus-visible:ring-0 outline-0! bg-transparent shadow-none! focus:outline-0! focus:border-0! p-0'
				placeholder={
					placeholder || 'Search for restaurants or dishes...'
				}
				disabled={true}
			/>
		</label>
	);
};
