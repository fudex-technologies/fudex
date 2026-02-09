import PackageCardCustomizationSection from '@/component-sections/PackageCardCustomizationSection';
import PackageTopSection from '@/component-sections/PackageTopSection';
import PageWrapper from '@/components/wrapers/PageWrapper';

interface Props {
	params: Promise<{ packageSlug: string }>;
}

export default async function PackageCardCustomizationPage({ params }: Props) {
	const { packageSlug } = await params;

	return (
		<PageWrapper className={'pt-0 relative'}>
			<PackageTopSection packageSlug={packageSlug} />
			<PackageCardCustomizationSection packageSlug={packageSlug} />
		</PageWrapper>
	);
}

