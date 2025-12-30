import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { ClassNameValue } from 'tailwind-merge';
import { cn } from '@/lib/utils';

interface Props {
	className?: ClassNameValue;
	placeholder?: string;
	disabled?: boolean;
}
const SearchInput = ({ className, placeholder, disabled = false }: Props) => {
	return (
		<label
			className={cn(
				'min-w-[180px] w-full rounded-md flex items-center gap-3  p-2 border border-[#DADADA] bg-[#F8F8F8]',
				className
			)}>
			<Search width={20} height={20} color='#858585' />
			<Input
				type='search'
				className='flex-1 border-0! ring-0 focus-visible:ring-0 outline-0! bg-transparent shadow-none! focus:outline-0! focus:border-0! p-0'
				placeholder={
					placeholder || 'Search for restaurants or dishes...'
				}
				disabled={disabled}
			/>
		</label>
	);
};

export default SearchInput;
