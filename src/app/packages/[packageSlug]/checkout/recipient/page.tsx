import PackageRecipientDetailsSection from '@/component-sections/PackageRecipientDetailsSection';
import PackageTopSection from '@/component-sections/PackageTopSection';
import PageWrapper from '@/components/wrapers/PageWrapper';

interface Props {
	params: Promise<{ packageSlug: string }>;
}

export default async function PackageRecipientDetailsPage({ params }: Props) {
	const { packageSlug } = await params;

	return (
		<PageWrapper className={'pt-0 relative'}>
			<PackageTopSection packageSlug={packageSlug} />
			<PackageRecipientDetailsSection packageSlug={packageSlug} />
		</PageWrapper>
	);
}

