import GoBackButton from '@/components/GoBackButton';
import SearchInput from '@/components/SearchInput';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { cn } from '@/lib/utils';
import { ClassNameValue } from 'tailwind-merge';
import { GiHouse } from 'react-icons/gi';
import { IoSchoolSharp } from 'react-icons/io5';
import { GiSuitcase } from 'react-icons/gi';
import { PiMapPinAreaFill } from 'react-icons/pi';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import UseCurentAddressDrawer from './UseCurentAddressDrawer';
import Link from 'next/link';
import { PAGES_DATA } from '@/data/pagesData';

export const savedAddressIcons = {
	home: {
		name: 'Home',
		icon: <GiHouse />,
	},
	school: {
		name: 'School',
		icon: <IoSchoolSharp />,
	},
	work: {
		name: 'Work',
		icon: <GiSuitcase />,
	},
	other: {
		name: 'Other',
		icon: <PiMapPinAreaFill />,
	},
};

export default function ProfileAddressesPage() {
	const isEmpty = false;

	return (
		<PageWrapper className='flex flex-col items-center'>
			<div className='flex items-center gap-10 w-full px-5'>
				<GoBackButton />
				<h1 className='font-semibold text-xl'>Delivery address</h1>
			</div>
			<SectionWrapper className='flex flex-col items-center max-w-lg px-0!'>
				<div className='w-full space-y-5'>
					<div className='w-full px-5'>
						<Link
							href={PAGES_DATA.profile_set_address_manually}
							className='w-full'>
							<SearchInput
								placeholder='Enter new address'
								disabled={true}
							/>
						</Link>
					</div>

					<UseCurentAddressDrawer />
				</div>
			</SectionWrapper>

			<SectionWrapper className='flex flex-col items-center max-w-lg gap-5 px-0!'>
				<p className='text-foreground/50 text-lg w-full text-start px-5'>
					Saved locations
				</p>

				{/* empty variant */}
				{isEmpty && (
					<div className='w-full p-5 flex flex-col gap-5 items-center justify-center'>
						<ImageWithFallback
							src={'/assets/cityillustration.png'}
							className='max-w-xs'
						/>
						<div className='text-center'>
							<h3 className='font-bold text-xl'>
								No saved addresses
							</h3>
							<p className='text-sm font-light'>
								Your saved address will appear here
							</p>
						</div>
					</div>
				)}

				{/* with data variant */}
				{!isEmpty && (
					<div className='w-full flex flex-col'>
						<AddressListItem
							addressType='home'
							line1='Road 5, Iworoko rd, Ekiti 360101, Ekiti, Nigeria'
						/>
						<AddressListItem
							addressType='school'
							line1='Ekiti State University, Iworoko rd, Ekiti 360101, Ekiti, Nigeria'
							line2='Room 3, Good news hostel'
							className='bg-foreground/5'
						/>
					</div>
				)}
			</SectionWrapper>
		</PageWrapper>
	);
}

const AddressListItem = ({
	className,
	addressType,
	line1,
	line2,
}: {
	className?: ClassNameValue;
	addressType: 'home' | 'school' | 'work' | 'other';
	line1: string;
	line2?: string;
}) => {
	return (
		<div
			className={cn(
				'px-5 py-2 bg-background flex flex-col gap-1 text-start text-foreground overflow-hidden text-nowrap whitespace-nowrap border-b',
				className
			)}>
			<div className='flex gap-2 items-center'>
				{savedAddressIcons[addressType].icon}{' '}
				<p className='font-semibold'>
					{savedAddressIcons[addressType].name}
				</p>
			</div>
			<p>{line1}</p>
			<p className='text-sm text-foreground/50'>{line2 || line1}</p>
		</div>
	);
};
