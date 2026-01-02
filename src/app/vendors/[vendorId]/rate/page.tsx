import RateVendorSection from '@/component-sections/RateVendorSection';
import SingleVendorTopSection from '@/component-sections/SingleVendorTopSection';
import VendorDetailsSection from '@/component-sections/VendorDetailsSection';

interface Props {
	params: Promise<{ vendorId: string }>;
}

export default async function RateVendorPage({ params }: Props) {
	const { vendorId } = await params;

	return (
		<>
			<SingleVendorTopSection vendorId={vendorId} />
			<VendorDetailsSection showDetails={false} />
			<RateVendorSection vendorId={vendorId} />
		</>
	);
}
