import OrderSummaryDetailsSection from '@/component-sections/OrderSummaryDetailsSection';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
	params: Promise<{ orderId: string }>;
}

export default async function OrderSummaryPage({ params }: Props) {
	const { orderId } = await params;
	return (
		<PageWrapper>
			<div className='flex items-center gap-10 p-5'>
				<Link href={PAGES_DATA.tray_page}>
					<ChevronLeft />
				</Link>
				<Link href={PAGES_DATA.tray_page}>
					<p className='font-semibold text-xl'>Tray</p>
				</Link>
			</div>
			<OrderSummaryDetailsSection />
		</PageWrapper>
	);
}
