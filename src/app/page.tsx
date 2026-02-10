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
import ValentineTemplate from '@/component-sections/PromoSection/ValentineTemplate';

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
			{/* <Suspense
				fallback={
					<div className='' />
				}>
				<ValentineSpecialSection />
			</Suspense> */}
			<SectionWrapper className='w-full flex items-center  gap-5 justify-center'>
				<ValentineTemplate
					slides={[
						{
							textLine1: (
								<>
									{' '}
									Let your loved one open the <br /> door to
									a{' '}
								</>
							),
							textLine2: 'beautiful surprise.',
							image: '/assets/valentine1.png',
						},
						{
							textLine1: (
								<>
									Show up for your loved ones, <br /> even
									from afar.
								</>
							),
							textLine2: 'Send them gifts.',
							image: '/assets/valentine2.png',
						},
					]}
					buttonLabel='Pre-order a gift now'
					link={`/packages/valentine-packages`}
					buttonClassName={
						'bg-[#FD98AA] hover:bg-[#FD98AA]/50 text-black'
					}
					className={'bg-[#8D021B] w-full!'}
					firstSectionClassName={'flex-1'}
				/>
			</SectionWrapper>

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
