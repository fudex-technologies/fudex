import SectionWrapper from '@/components/wrapers/SectionWrapper';
import Image from 'next/image';
import PayoutListItem from './PayoutListItem';
import { Separator } from '@/components/ui/separator';

const VendorDashboardPayoutsHistorySection = () => {
	const isEmpty = true;
	return (
		<SectionWrapper className='max-w-lg w-full p-5 mx-auto'>
			<div className='w-full '>
				<div className='w-full'>
					{isEmpty && (
						<div className='p-5 w-full flex flex-col items-center justify-center text-center'>
							<Image
								src={'/assets/cash-bag.png'}
								width={250}
								height={250}
								alt='Cash back'
							/>
							<p className='font-bold'>No earnings yet</p>
							<p className=''>
								Your earnings will appear here once orders are
								completed
							</p>
						</div>
					)}
					{!isEmpty && (
						<div className='w-full flex flex-col'>
							<PayoutListItem />
							<Separator />
							<PayoutListItem />
							<Separator />
							<PayoutListItem />
							<Separator />
							<PayoutListItem />
							<Separator />
							<PayoutListItem />
						</div>
					)}
				</div>
			</div>
		</SectionWrapper>
	);
};

export default VendorDashboardPayoutsHistorySection;
