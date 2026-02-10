import PackagesCategoriesSection from '@/component-sections/PackagesCategoriesSection';
import PackageTopSection from '@/component-sections/PackageTopSection';
import PageWrapper from '@/components/wrapers/PageWrapper';

interface Props {
	params: Promise<{ packageSlug: string }>;
}

export default async function PackageLandingPage({ params }: Props) {
	const { packageSlug } = await params;

	return (
		<PageWrapper className={'pt-0 relative pb-20'}>
			<PackageTopSection packageSlug={packageSlug} />
			<PackagesCategoriesSection packageSlug={packageSlug} />
		</PageWrapper>
	);
}
