import CategorySelectionSection from '@/component-sections/CategorySelectionSection';
import TrendingVendorsSection from '@/component-sections/TrendingVendorsSection';
import MobileBottomNav from '@/components/navigation-components/MobileBottomNav';
import SearchInput from '@/components/SearchInput';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';

export default function SearchPage() {
	return (
		<PageWrapper className=''>
			<SectionWrapper>
				<SearchInput />
			</SectionWrapper>
			<CategorySelectionSection />
			<TrendingVendorsSection />
			<MobileBottomNav />
		</PageWrapper>
	);
}
