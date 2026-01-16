import OrderSummaryDetailsSection from '@/component-sections/OrderSummaryDetailsSection';
import GoBackButton from '@/components/GoBackButton';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import Link from 'next/link';

interface Props {
	params: Promise<{ vendorId: string }>;
}

export default async function OrderSummaryPage({ params }: Props) {
	const { vendorId } = await params;
	return (
		<PageWrapper>
			<div className='flex items-center gap-10 px-5'>
				<GoBackButton link={PAGES_DATA.tray_page} />
				<Link href={PAGES_DATA.tray_page}>
					<p className='font-semibold text-xl'>Tray</p>
				</Link>
			</div>
			<OrderSummaryDetailsSection vendorId={vendorId} />
		</PageWrapper>
	);
}
