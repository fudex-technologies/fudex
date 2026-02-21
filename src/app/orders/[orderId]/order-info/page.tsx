import OrderInfoDetailsSection from '@/component-sections/OrderInfoDetailsSection';
import GoBackButton from '@/components/GoBackButton';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';

interface Props {
	params: Promise<{ orderId: string }>;
}

export default async function OrderInfoPage({ params }: Props) {
	const { orderId } = await params;
	return (
		<PageWrapper>
			<div className='flex w-full items-center justify-center gap-10 px-5 relative'>
				<GoBackButton className='absolute left-5' link={PAGES_DATA.ongoing_orders_page} />
				<h1 className='font-semibold text-xl'>Order Info</h1>
			</div>
			<div className='w-full flex flex-col items-center'>
				<OrderInfoDetailsSection orderId={orderId} />
			</div>
		</PageWrapper>
	);
}
