import { Search } from 'lucide-react';
import { Input } from '../ui/input';

const SearchInput = () => {
	return (
		<label className='min-w-[180px] max-w-sm w-full rounded-md flex items-center gap-3  p-2 border border-[#DADADA] bg-[#F8F8F8]'>
			<Search width={20} height={20} color='#858585' />
			<Input
				className='flex-1 border-0! ring-0 focus-visible:ring-0 outline-0! bg-transparent shadow-none! focus:outline-0! focus:border-0! p-0'
				placeholder='Search for restaurants or dishes...'
			/>
		</label>
	);
};

export default SearchInput;
