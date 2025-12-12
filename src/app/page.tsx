import CategorySelectionSection from '@/component-sections/CategorySelectionSection';
import PopularRestaurantsSection from '@/component-sections/PopularRestaurantsSection.tsx';
import PromoSection from '@/component-sections/PromoSection';
import Frame from '@/component-sections/PromoSection/Frame';
import RestaurantsListSection from '@/component-sections/RestaurantsListSection';
import LocationDropdown from '@/components/LocationDropdown';
import MobileBottomNav from '@/components/navigation-components/MobileBottomNav';
import SearchInput from '@/components/SearchInput';
import { Button } from '@/components/ui/button';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { SlidersHorizontal } from 'lucide-react';

export default function Home() {
	return (
		<PageWrapper>
			<SectionWrapper className='w-full flex items-center gap-5'>
				<LocationDropdown />
				<Button>
					<SlidersHorizontal />
					Filter
				</Button>
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

			<RestaurantsListSection title='Available Food Spots' />
			<div className='mb-[110px]' />
			<MobileBottomNav />
		</PageWrapper>
	);
}
