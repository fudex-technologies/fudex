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
			className='blur-effect w-full max-w-md min-w-xs rounded-xl h-[170px] overflow-hidden flex items-center p-0 bg-center bg-cover'
			style={{
				backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.312), rgba(0, 0, 0, 0.307)), url(${backgroundImagePath})`,
			}}>
			<div className='flex-[1.7] p-5 flex flex-col gap-5'>
				<div className='flex flex-col text-white w-full'>
					<p className='text-sm sm:text-base'>{textLine1}</p>
					<p className='text-xl font-semibold'>{textLine2}</p>
				</div>

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
			</div>

			<div className='flex-1 h-full flex items-end'>
				{image && (
					<div className='relative w-full aspect-square'>
						<ImageWithFallback
							src={image}
							className='w-full h-full object-top '
							alt='promo'
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default PromoTemplate;
