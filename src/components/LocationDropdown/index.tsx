import Image from 'next/image';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { ImageWithFallback } from '../ui/ImageWithFallback';

const LocationDropdown = () => {
	return (
		<Select>
			<SelectTrigger className='min-w-[180px] max-w-sm w-full border-0 shadow-none p-0'>
				<div className='flex items-center justify-start gap-2'>
					<ImageWithFallback
						src={'/assets/locationIcon.svg'}
						width={20}
						height={20}
						alt='Location'
					/>
					<SelectValue placeholder='Road 5, Iworoko rd, Ekiti' />
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
