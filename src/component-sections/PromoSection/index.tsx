'use client';

import { useOrderingActions } from '@/api-hooks/useOrderingActions';
import { useProfileActions } from '@/api-hooks/useProfileActions';
import { buttonVariants } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { PromoCarousel } from '@/components/ui/promo-carousel';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { PAGES_DATA } from '@/data/pagesData';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import PromoTemplate from './PromoTemplate';
import ValentineTemplate from './ValentineTemplate';

const PromoSection = () => {
	const { data: session } = useSession();
	const { useListMyOrders } = useOrderingActions();
	const { getReferralStats } = useProfileActions();

	const { data: referralData, isLoading: isLoadingReferralData } =
		getReferralStats();
	const confirmedReferred = referralData?.confirmedReferred || 0;
	const { data: successfulOrders, isLoading } = useListMyOrders({
		take: 3,
		status: ['DELIVERED'],
	});

	const referralPromoStillValid =
		!isLoadingReferralData && confirmedReferred <= 5;
	const promoStillValid =
		!isLoading && successfulOrders && successfulOrders?.length <= 3;
	return (
		<SectionWrapper className='w-full p-0! overflow-hidden flex items-center justify-center'>
			<PromoCarousel>
				{!session ? (
					<PromoTemplate
						textLine1='Refer 5 friends and get'
						textLine2='1 Free Delivery'
						buttonLabel='Refer Now!'
						backgroundImagePath='/assets/delivery-promo-image.jpg'
						link={
							session
								? PAGES_DATA.profile_referral_page
								: PAGES_DATA.login_page
						}
					/>
				) : session && referralPromoStillValid ? (
					<PromoTemplate
						textLine1='Refer 5 friends and get'
						textLine2='1 Free Delivery'
						buttonLabel='Refer Now!'
						backgroundImagePath='/assets/delivery-promo-image.jpg'
						link={
							session
								? PAGES_DATA.profile_referral_page
								: PAGES_DATA.login_page
						}
					/>
				) : null}

				{!session ? (
					<ThreeOrdersPromo
						textLine1='Make 3 Orders, and get'
						textLine2='1 Free Delivery'
						image='/assets/promo.png'
						buttonLabel='Order Now!'
					/>
				) : session && promoStillValid ? (
					<ThreeOrdersPromo
						textLine1='Make 3 Orders, and get'
						textLine2='1 Free Delivery'
						image='/assets/promo.png'
						buttonLabel='Order Now!'
					/>
				) : null}
			</PromoCarousel>
		</SectionWrapper>
	);
};

export default PromoSection;

const ThreeOrdersPromo = ({
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
		<div
			className='noise-effect w-[90vw] sm:w-full min-w-xs max-w-sm rounded-xl h-[150px] overflow-hidden flex items-center p-0'
			style={{
				background:
					'linear-gradient(230.521deg, #52AA24 37.752%, #2D5D14  58.068%)',
			}}>
			<div className='flex-[1.2] p-5 flex flex-col gap-5'>
				<div className='flex flex-col text-white'>
					<p className='text-sm sm:text-base'>{textLine1}</p>
					<p className='text-xl font-semibold'>{textLine2}</p>
				</div>

				<Link
					href={`${PAGES_DATA.home_page}#vendors`}
					className={cn(
						buttonVariants({
							size: 'lg',
						}),
						'rounded-full bg-background text-foreground py-6 hover:bg-foreground/50 hover:text-background',
					)}>
					{buttonLabel}
				</Link>
			</div>
			<div className='flex-1 h-full flex items-end'>
				<div className='relative w-full aspect-square'>
					<ImageWithFallback
						src={image}
						className='w-full h-full object-top max-w-[150px] sm:max-w-none'
						alt='promo'
					/>
				</div>
			</div>
		</div>
	);
};
