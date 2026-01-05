import SingleVendorTopSection from '@/component-sections/SingleVendorTopSection';
import VendorDetailsSection from '@/component-sections/VendorDetailsSection';
import VendorProductsTabSection from '@/component-sections/VendorProductsTabSection';

interface Props {
	params: Promise<{ vendorId: string }>;
}

export default async function SingleVendorPage({ params }: Props) {
	const { vendorId } = await params;

	return (
		<>
			<SingleVendorTopSection vendorId={vendorId} />
			<VendorDetailsSection vendorId={vendorId} />
			<VendorProductsTabSection vendorId={vendorId} />
		</>
	);
}
