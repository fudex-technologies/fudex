import CategorySelectionSection from '@/component-sections/CategorySelectionSection';
import PromoSection from '@/component-sections/PromoSection';
import VendorListSection, {
	VendorListSectionSkeleton,
} from '@/component-sections/VendorListSection';
import LocationDropdown from '@/components/LocationDropdown';
import MobileBottomNav from '@/components/navigation-components/MobileBottomNav';
import SearchInput, { SearchInputSkeleton } from '@/components/SearchInput';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import FilterVendorsDrawer from '../components/FilterVendorsDrawer';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { PiSlidersHorizontalFill } from 'react-icons/pi';
import { PAGES_DATA } from '@/data/pagesData';
import Link from 'next/link';
import ValentineSpecialSection from '@/component-sections/ValentineSpecialSection';

export default function Home() {
	return (
		<PageWrapper>
			<SectionWrapper className='w-full flex items-center gap-5 justify-between'>
				<LocationDropdown />
				<Suspense
					fallback={
						<Button disabled>
							<PiSlidersHorizontalFill />
							Filter
						</Button>
					}>
					<FilterVendorsDrawer />
				</Suspense>
			</SectionWrapper>
			<SectionWrapper>
				<Link href={PAGES_DATA.search_page} className='w-full'>
					<Suspense fallback={<SearchInputSkeleton />}>
						<SearchInput disabled={true} />
					</Suspense>
				</Link>
			</SectionWrapper>
			<CategorySelectionSection />
			<PromoSection />
			{/* <PopularRestaurantsSection /> */}
			<Suspense
				fallback={
					<div className='h-48 w-full animate-pulse bg-muted/20' />
				}>
				<ValentineSpecialSection />
			</Suspense>
			<Suspense
				fallback={
					<VendorListSectionSkeleton title={'Available Food Spots'} />
				}>
				<VendorListSection title='Available Food Spots' />
			</Suspense>
			<MobileBottomNav />
		</PageWrapper>
	);
}
