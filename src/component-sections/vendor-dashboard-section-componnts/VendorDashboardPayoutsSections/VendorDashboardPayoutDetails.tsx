import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { formatCurency } from '@/lib/commonFunctions';

const VendorDashboardPayoutDetails = () => {
	return (
		<SectionWrapper className='w-full flex justify-center'>
			<div className='w-full max-w-lg flex flex-col items-center gap-3'>
				<div className='w-full p-5 rounded-lg bg-[#90DF67] text-black'>
					<p className='text-lg'>Today's Earnings</p>
					<p className='text-2xl font-bold'>{formatCurency(1000)}</p>
					<p className=''>From two completed orders today</p>
				</div>
				<div className='w-full max-w-sm rounded-lg shadow-sm flex flex-col items-center'>
					<div className='p-2 rounded-b-xl bg-[#52AA241F] text-xs'>
						Payout Bank Account
					</div>
					<div className='p-5 text-center space-y-2'>
						<p className='font-semibold text-xl leading-[100%]'>
							9023124124
						</p>
						<p className='leading-[100%]'>OPAY</p>
						<p className='leading-[100%]'>IGOTUN MARY OLAIDE</p>
					</div>
					<div className='w-full border-t border-dashed p-3 text-sm text-foreground/50 text-center'>
						Earnings will be paid directly to this account
					</div>
				</div>
			</div>
		</SectionWrapper>
	);
};

export default VendorDashboardPayoutDetails;
