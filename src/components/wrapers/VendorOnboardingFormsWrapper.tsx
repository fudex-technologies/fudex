import React from 'react';
import PageWrapper from './PageWrapper';
import Image from 'next/image';
import GoBackButton from '../GoBackButton';
import { ImageWithFallback } from '../ui/ImageWithFallback';

const VendorOnboardingFormsWrapper = ({
	children,
	goBack = true,
	showLogo = true,
}: Readonly<{
	children: React.ReactNode;
	goBack?: boolean;
	showLogo?: boolean;
}>) => {
	return (
		<PageWrapper className={'w-full flex justify-center p-0! mb-10'}>
			<div className='w-full flex flex-col items-center max-w-lg'>
				<div className='w-full min-w-lg sm:min-w-0 h-32 relative flex justify-center overflow-visible'>
					<Image
						src={'/assets/store-cover.png'}
						fill
						alt='store top cover'
						className='object-cover'
					/>
				</div>
				<div className='w-full px-5! py-0'>
					{showLogo && (
						<div className='w-full min-h-16 flex items-center justify-between py-3 relative'>
							{goBack && (
								<GoBackButton className='text-foreground!' />
							)}
							<ImageWithFallback
								src={'/icons/FUDEX_2t.png'}
								className='absolute  right-5  w-[50px] h-auto'
							/>
						</div>
					)}

					{children}
				</div>
			</div>
		</PageWrapper>
	);
};

export default VendorOnboardingFormsWrapper;
