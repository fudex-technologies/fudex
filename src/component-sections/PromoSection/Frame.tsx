import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import imgImage4 from 'figma:asset/97b7e123e6d5ca5a9508d0bbb69a8f543216dc5c.png';

function Component() {
	return (
		<div
			className='bg-[#1a1a1a] content-stretch flex h-[48px] items-center justify-center p-[10px] relative rounded-[100px] shrink-0 w-[120px]'
			data-name='Component 50'>
			<p className="font-['Satoshi:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-nowrap text-white whitespace-pre">
				Order now
			</p>
			<div className='absolute inset-0 pointer-events-none shadow-[0px_-2px_3px_0px_inset_rgba(0,0,0,0.25)]' />
		</div>
	);
}

function Frame1() {
	return (
		<div className='absolute content-stretch flex flex-col gap-[24px] items-start left-[20px] top-1/2 translate-y-[-50%] w-[145px]'>
			<p className="font-['Satoshi:Bold',sans-serif] leading-[0] min-w-full not-italic relative shrink-0 text-[0px] text-white w-[min-content]">
				<span className="font-['Satoshi:Regular',sans-serif] leading-[20px] text-[14px]">
					Make 3 Orders, and get
				</span>
				<span className='leading-[24px] text-[16px]'> </span>
				<span className="font-['Satoshi:Black',sans-serif] leading-[28px] text-[18px]">
					1 Free Delivery
				</span>
			</p>
			<Component />
		</div>
	);
}

export default function Frame() {
	// SVG noise pattern for grain texture effect
	const noiseFilter = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="0.4"/>
    </svg>
  `;

	const noiseBackground = `data:image/svg+xml;base64,${btoa(noiseFilter)}`;

	return (
		<div
			className='overflow-clip relative rounded-[16px] size-full'
			style={{
				backgroundImage:
					'linear-gradient(230.521deg, rgb(82, 170, 36) 37.752%, rgb(45, 93, 20) 58.068%)',
			}}>
			{/* Noise texture overlay */}
			<div
				className='absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay'
				style={{
					backgroundImage: `url("${noiseBackground}")`,
					backgroundRepeat: 'repeat',
				}}
			/>
			<Frame1 />
			<div
				className='absolute h-[142px] left-[172px] top-[22px] w-[135px]'
				data-name='image 4'>
				<div className='absolute inset-0 overflow-hidden pointer-events-none'>
					<ImageWithFallback
						alt=''
						className='absolute h-[107.87%] left-[-22.36%] max-w-none top-[-7.87%] w-[201.23%]'
						src={'/assets/promo.png'}
					/>
				</div>
			</div>
		</div>
	);
}
