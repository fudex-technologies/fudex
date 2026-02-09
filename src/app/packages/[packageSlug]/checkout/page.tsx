import PackageCheckoutSection from '@/component-sections/PackageCheckoutSection';
import PackageTopSection from '@/component-sections/PackageTopSection';
import PageWrapper from '@/components/wrapers/PageWrapper';

interface Props {
	params: Promise<{ packageSlug: string }>;
}

export default async function PackageCheckoutPage({ params }: Props) {
	const { packageSlug } = await params;

	return (
		<PageWrapper className={'pt-0 relative'}>
			<PackageTopSection packageSlug={packageSlug} />
			<PackageCheckoutSection packageSlug={packageSlug} />
		</PageWrapper>
	);
}