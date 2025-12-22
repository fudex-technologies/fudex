import CheckoutDetailsSection from '@/component-sections/CheckoutDetailsSection';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
	params: Promise<{ orderId: string }>;
}

export default async function CheckoutPage({ params }: Props) {
	const { orderId } = await params;
	return (
		<PageWrapper>
			<div className='flex w-full items-center justify-center gap-10 p-5 relative'>
				<Link
					href={PAGES_DATA.order_summary_page(orderId)}
					className='absolute left-5'>
					<ChevronLeft />
				</Link>
				<p className='font-semibold text-xl'>Checkout</p>
			</div>
			<CheckoutDetailsSection />
		</PageWrapper>
	);
}
