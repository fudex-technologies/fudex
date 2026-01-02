import SingleVendorInfoSection from '@/component-sections/SingleVendorInfoSection';
import SingleVendorTopSection from '@/component-sections/SingleVendorTopSection';

interface Props {
	params: Promise<{ vendorId: string }>;
}

export default async function SingleVendorInfoPage({ params }: Props) {
	const { vendorId } = await params;

	return (
		<>
			<SingleVendorTopSection vendorId={vendorId} />
			<SingleVendorInfoSection vendorId={vendorId} />
		</>
	);
}
