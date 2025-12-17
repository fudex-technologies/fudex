import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Separator } from '@/components/ui/separator';
import SectionWrapper from '@/components/wrapers/SectionWrapper';

const TrendingVendorsSection = () => {
	return (
		<SectionWrapper className='my-5'>
			<div className='flex gap-2 items-center'>
				<ImageWithFallback src={'/assets/trendingIcon.svg'} />
				<p className='text-xl font-semibold'>Trending Vendors</p>
			</div>
			<ul className='my-5 text-[14px]]'>
				<li className='flex gap-2 items-center py-3'>
					<span className='w-3 h-3 rounded-full bg-border' />
					<p className=''> Bukolarries</p>
				</li>
				<Separator orientation='horizontal' className='w-full' />
				<li className='flex gap-2 items-center py-3'>
					<span className='w-3 h-3 rounded-full bg-border' />
					<p className=''> Bukolarries</p>
				</li>
				<Separator orientation='horizontal' className='w-full' />
				<li className='flex gap-2 items-center py-3'>
					<span className='w-3 h-3 rounded-full bg-border' />
					<p className=''> Bukolarries</p>
				</li>
				<Separator orientation='horizontal' className='w-full' />
				<li className='flex gap-2 items-center py-3'>
					<span className='w-3 h-3 rounded-full bg-border' />
					<p className=''> Bukolarries</p>
				</li>
			</ul>
		</SectionWrapper>
	);
};

export default TrendingVendorsSection;
