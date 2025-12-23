import CheckoutDetailsSection from '@/component-sections/CheckoutDetailsSection';
import GoBackButton from '@/components/GoBackButton';
import PageWrapper from '@/components/wrapers/PageWrapper';

interface Props {
	params: Promise<{ orderId: string }>;
}

export default async function CheckoutPage({ params }: Props) {
	const { orderId } = await params;
	return (
		<PageWrapper>
			<div className='flex w-full items-center justify-center gap-10 px-5 relative'>
				<GoBackButton className='absolute left-5' />
				<h1 className='font-semibold text-xl'>Checkout</h1>
			</div>
			<CheckoutDetailsSection />
		</PageWrapper>
	);
}
