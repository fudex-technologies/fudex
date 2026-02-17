import { buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ClassNameValue } from 'tailwind-merge';

const PromoTemplate = ({
	textLine1,
	textLine2,
	image,
	buttonLabel,
	link,
	backgroundImagePath,
	buttonClassName,
}: {
	textLine1: string;
	textLine2: string;
	image?: string;
	buttonLabel: string;
	link?: string;
	backgroundImagePath: string;
	buttonClassName?: ClassNameValue;
}) => {
	return (
		<div
			className='blur-effect w-[90vw] sm:w-full min-w-xs max-w-sm rounded-xl h-[150px] overflow-hidden flex items-center p-0 bg-center bg-cover'
			style={{
				backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.312), rgba(0, 0, 0, 0.307)), url(${backgroundImagePath})`,
			}}>
			<div className='w-full p-5 pb-0 flex flex-col'>
				<div className='flex flex-col text-white w-full'>
					<p className=''>{textLine1}</p>
					<p className='text-xl font-semibold'>{textLine2}</p>
				</div>

				<div className='w-full flex items-center justify-end py-5'>
					<Link
						href={link || '#'}
						className={cn(
							buttonVariants({
								size: 'lg',
							}),
							'rounded-full bg-foreground text-background py-6 hover:bg-foreground/50 hover:text-background w-full max-w-[200px]',
							buttonClassName,
						)}>
						{buttonLabel}
					</Link>
					<div className='flex-1 h-full w-full flex items-end'>
						{image ? (
							<div className='relative w-full aspect-square'>
								<ImageWithFallback
									src={image}
									className='w-full h-full object-top '
									alt='promo'
								/>
							</div>
						) : (
							<div className='w-[100px] '></div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default PromoTemplate;
