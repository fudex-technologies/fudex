import ProfileMenusSection from '@/component-sections/ProfileMenusSection';
import ProfileTopSection from '@/component-sections/ProfileTopSection';
import MobileBottomNav from '@/components/navigation-components/MobileBottomNav';
import PageWrapper from '@/components/wrapers/PageWrapper';

export default function ProfilePage() {
	return (
		<PageWrapper className={'p-0 max-w-screen relative bg-foreground/5'}>
			<ProfileTopSection />
			<ProfileMenusSection />
			<MobileBottomNav />
		</PageWrapper>
	);
}
