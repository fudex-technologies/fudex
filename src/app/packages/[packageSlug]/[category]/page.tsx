import PackageCategorySection from '@/component-sections/PackageCategorySection';
import PackageTopSection from '@/component-sections/PackageTopSection';
import PageWrapper from '@/components/wrapers/PageWrapper';

interface Props {
    params: Promise<{ packageSlug: string; category: string }>;
}

export default async function PackageCategoryPage({ params }: Props) {
    const { packageSlug, category } = await params;

    return (
        <PageWrapper className={'pt-0 relative'}>
            <PackageTopSection packageSlug={packageSlug} />
            <PackageCategorySection
                packageSlug={packageSlug}
                categorySlug={category}
            />
        </PageWrapper>
    );
}
