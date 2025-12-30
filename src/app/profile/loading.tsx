import { ProfileMenusSectionSkeleton } from '@/component-sections/ProfileMenusSection';
import { ProfileTopSectionSkeleton } from '@/component-sections/ProfileTopSection';

export default function Loading() {
	return (
		<div className='h-full w-full bg-foreground/5'>
			<ProfileTopSectionSkeleton />
			<ProfileMenusSectionSkeleton />
		</div>
	);
}
