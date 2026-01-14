import SectionWrapper from '@/components/wrapers/SectionWrapper';
import VendorDashboardOrderItem from './VendorDashboardOrderCardItem';

const VendorDashboardRecentOrderCardsSection = () => {
	return (
		<SectionWrapper className='w-full space-y-2'>
			<div className='w-full'>
				<div className='relative w-full'>
					<div className='absolute w-full max-w-md h-full top bg-muted text-muted-foreground -top-2 -left-2 overflow-hidden rounded-lg shadow-sm'>
						<div className='w-full px-5 py-2 bg-[#24AA9A] text-white'>
							<p>New Order</p>
						</div>
					</div>
					<VendorDashboardOrderItem isNew={true} status='PAID' />
				</div>
			</div>
		</SectionWrapper>
	);
};

export default VendorDashboardRecentOrderCardsSection;
