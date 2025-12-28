import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { ClassNameValue } from 'tailwind-merge';
import { cn } from '@/lib/utils';

const LocationDropdown = ({ className }: { className?: ClassNameValue }) => {
	return (
		<Select>
			<SelectTrigger
				className={cn(
					'min-w-[180px] max-w-sm w-full border-0 shadow-none p-0',
					className
				)}>
				<div className='flex items-center justify-start gap-2'>
					<ImageWithFallback
						src={'/assets/locationIcon.svg'}
						width={20}
						height={20}
						alt='Location'
					/>
					{/* <SelectValue placeholder='Road 5, Iworoko rd, Ekiti' /> */}
					<SelectValue placeholder='Select Address' />
				</div>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value='Road 5, Iworoko rd, Eki...'>
					Road 5, Iworoko rd, Ekiti
				</SelectItem>
				<SelectItem value='Solfem hostel, Lakers Oshekita, Ekiti'>
					Solfem hostel, Lakers Oshekita, Ekiti
				</SelectItem>
				<SelectItem value='Something pr somewhere else'>
					Something pr somewhere else
				</SelectItem>
			</SelectContent>
		</Select>
	);
};

export default LocationDropdown;
