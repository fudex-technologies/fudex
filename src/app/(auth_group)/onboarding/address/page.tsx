import LocationDropdown from '@/components/LocationDropdown';
import { buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function OnboardingSetAddressPAge() {
	return (
		<div className='w-screen h-screen flex items-center justify-center p-5 sm:p-10 relative'>
            <div className="w-full absolute p-5 top-0 lrft-0">
                <LocationDropdown className="max-w-[200px]" />
            </div>
			<div className='w-full max-w-md rounded-4xl p-5 sm:p-10 bg-background flex flex-col gap-7 items-center'>
				<ImageWithFallback
					className='w-[150px] h-auto object-contain'
					src={'/assets/biglocationicon.png'}
					alt='location_icon'
				/>
				<h1 className='text-2xl font-semibold text-foreground text-center'>
					Add your address to discover what’s available around you
				</h1>

				<div className='w-full flex flex-col gap-2'>
					<Link
						href={PAGES_DATA.profile_addresses_page}
						className={cn(
							buttonVariants({
								className: 'w-full py-6',
								variant: 'game',
							})
						)}>
						Choose delivery address
					</Link>
					<Link
						href={PAGES_DATA.home_page}
						className={cn(
							buttonVariants({
								className:
									'w-full py-6 border-primary text-primary',
								variant: 'outline',
							})
						)}>
						Explore Mode
					</Link>
				</div>
			</div>
		</div>
	);
}
