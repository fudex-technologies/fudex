import ProfileMenusSection from '@/component-sections/ProfileMenusSection';
import ProfileTopSection from '@/component-sections/ProfileTopSection';

export default function ProfilePage() {
	return (
		<div className='h-full w-full bg-foreground/5'>
			<ProfileTopSection />
			<ProfileMenusSection />
		</div>
	);
}
