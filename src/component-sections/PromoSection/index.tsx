import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import SectionWrapper from '@/components/wrapers/SectionWrapper';

const PromoSection = ({
	textLine1,
	textLine2,
	image,
	buttonLabel,
}: {
	textLine1: string;
	textLine2: string;
	image?: string;
	buttonLabel: string;
}) => {
	return (
		<SectionWrapper className='w-full'>
			<div
				className='noise-effect w-full rounded-xl h-[165px] overflow-hidden flex items-center p-0'
				style={{
					background:
						'linear-gradient(230.521deg, #52AA24 37.752%, #2D5D14  58.068%)',
				}}>
				<div className='flex-[1.2] p-5 flex flex-col gap-5'>
					<div className='flex flex-col text-white'>
						<p className=''>{textLine1}</p>
						<p className='text-xl font-semibold'>{textLine2}</p>
					</div>

					<Button
						size={'lg'}
						className='rounded-full bg-foreground text-background'>
						{buttonLabel}
					</Button>
				</div>
				<div className='flex-1 h-full flex items-end'>
					<div className='relative w-full aspect-square'>
						<ImageWithFallback
							src={image}
							className='w-full h-full'
							alt='promo'
						/>
					</div>
				</div>
			</div>
		</SectionWrapper>
	);
};

export default PromoSection;
