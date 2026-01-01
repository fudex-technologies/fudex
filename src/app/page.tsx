import CategorySelectionSection from '@/component-sections/CategorySelectionSection';
import PopularRestaurantsSection from '@/component-sections/PopularRestaurantsSection.tsx';
import PromoSection from '@/component-sections/PromoSection';
import VendorListSection from '@/component-sections/VendorListSection';
import LocationDropdown from '@/components/LocationDropdown';
import MobileBottomNav from '@/components/navigation-components/MobileBottomNav';
import SearchInput from '@/components/SearchInput';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import FilterVendorsDrawer from '../components/FilterVendorsDrawer';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { PiSlidersHorizontalFill } from 'react-icons/pi';

export default function Home() {
	return (
		<PageWrapper>
			<SectionWrapper className='w-full flex items-center gap-5 justify-between'>
				<LocationDropdown />
				<Suspense fallback={
					<Button disabled>
						<PiSlidersHorizontalFill />
						Filter
					</Button>
				}>
					<FilterVendorsDrawer />
				</Suspense>
			</SectionWrapper>
			<SectionWrapper>
				<SearchInput />
			</SectionWrapper>
			<CategorySelectionSection />
			<PromoSection
				textLine1='Make 3 Orders, and get'
				textLine2='1 Free Delivery'
				image='/assets/promo.png'
				buttonLabel='Order Now!'
			/>
			<PopularRestaurantsSection />
			<VendorListSection title='Available Food Spots' />
			<MobileBottomNav />
		</PageWrapper>
	);
}
