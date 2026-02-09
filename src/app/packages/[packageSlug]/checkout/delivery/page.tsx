import PackageDeliveryDetailsSection from '@/component-sections/PackageDeliveryDetailsSection';
import PackageTopSection from '@/component-sections/PackageTopSection';
import PageWrapper from '@/components/wrapers/PageWrapper';

interface Props {
	params: Promise<{ packageSlug: string }>;
}

export default async function PackageDeliveryDetailsPage({ params }: Props) {
	const { packageSlug } = await params;

	return (
		<PageWrapper className={'pt-0 relative'}>
			<PackageTopSection packageSlug={packageSlug} />
			<PackageDeliveryDetailsSection packageSlug={packageSlug} />
		</PageWrapper>
	);
}

