import SingleVendorReviewsSection from '@/component-sections/SingleVendorReviewsSection';
import GoBackButton from '@/components/GoBackButton';

interface Props {
	params: Promise<{ vendorId: string }>;
}

export default async function SingleVendorReviewsPage({ params }: Props) {
	const { vendorId } = await params;
	return (
		<>
			<div className='flex items-center gap-10 w-full p-5!'>
				<GoBackButton />
				<p className='font-semibold text-xl'>Ratings</p>
			</div>
			<SingleVendorReviewsSection vendorId={vendorId} />
		</>
	);
}
