import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

const ProfileTopSection = () => {
	return (
		<div className='flex flex-col items-center'>
			<div
				style={{
					backgroundImage: `url("/assets/profile-background.png")`,
				}}
				className='h-[150px] w-full bg-center bg-cover flex justify-center relative '>
				<div className='w-[100px] h-[100px] p-1 bg-background rounded-full absolute -bottom-[50px] flex justify-center items-center'>
					<ImageWithFallback
						src={'/assets/profile-image.png'}
						className='rounded-full w-full] h-full'
					/>
				</div>
			</div>

			<div className='mt-12 space-y-3 text-center'>
				<h1 className='font-bold text-lg'>Olaide Igotun</h1>
				<div className='px-5 py-3 flex items-center justify-center gap-1 border rounded-full'>
					<ImageWithFallback
						src={'/icons/FUDEX_2t.png'}
						className='w-7 h-auto object-contain'
					/>
					<p className='text-lg'>2</p>
				</div>
			</div>
		</div>
	);
};

export default ProfileTopSection;
