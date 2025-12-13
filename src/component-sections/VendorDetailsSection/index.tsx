import { Separator } from '@/components/ui/separator';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { FaBicycle, FaBoltLightning, FaStar } from 'react-icons/fa6';
import { GrAlarm } from 'react-icons/gr';

const VendorDetailsSection = () => {
	return (
		<SectionWrapper className='space-y-5'>
			<div className=''>
				<h1 className='text-2xl font-bold'>Bukolarry</h1>
				<div className='flex gap-5'>
					<div className='flex items-center gap-1'>
						<FaStar
							width={15}
							height={15}
							className='text-[#F9C300]'
						/>
						<p className='text-foreground/80'>
							4.6
							<span className='text-foreground/60'>(200)</span>
						</p>
					</div>
					<p className='text-foreground/80'>Opens until 09:00pm</p>
				</div>
			</div>

			<div className='py-5 flex justify-between border-t border-b gap-2'>
				<div className='flex-1 flex flex-col items-center justify-center gap-2'>
					<div className='w-10 h-10 rounded-full flex justify-center items-center  bg-secondary/10 text-secondary'>
						<GrAlarm width={15} height={15} />
					</div>
					<p className=''>25 - 30mins</p>
				</div>
				<Separator
					orientation='vertical'
					className='h-[80%] text-muted'
				/>
				<div className='flex-1 flex flex-col items-center justify-center gap-2'>
					<div className='w-10 h-10 rounded-full flex justify-center items-center  bg-secondary/10 text-secondary'>
						<FaBicycle />
					</div>
					<p className=''>#600</p>
				</div>
				<Separator
					orientation='vertical'
					className='h-[80%] text-muted'
				/>
				<div className='flex-1 flex flex-col items-center justify-center gap-2'>
					<div className='w-10 h-10 rounded-full flex justify-center items-center  bg-secondary/10 text-secondary'>
						<FaBoltLightning />
					</div>
					<p className=''>25 - 30mins</p>
				</div>
			</div>
		</SectionWrapper>
	);
};

export default VendorDetailsSection;
