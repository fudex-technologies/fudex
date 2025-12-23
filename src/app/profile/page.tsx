import ProfileTopSection from '@/component-sections/ProfileTopSection';
import PageWrapper from '@/components/wrapers/PageWrapper';

export default function ProfilePage() {
	return (
		<PageWrapper className={'pt-0 relative'}>
			<ProfileTopSection />
			<div className=''></div>
		</PageWrapper>
	);
}
