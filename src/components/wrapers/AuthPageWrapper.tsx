import Link from 'next/link';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import PageWrapper from './PageWrapper';
import { PAGES_DATA } from '@/data/pagesData';

const AuthPageWrapper = ({
	children,
	skip,
	canSkip = true,
}: Readonly<{
	children: React.ReactNode;
	skip?: string;
	canSkip?: boolean;
}>) => {
	return (
		<PageWrapper
			className={
				'max-w-none w-full bg-secondary p-0 flex justify-center items-center'
			}>
			<div className='w-full max-w-[1400px] flex flex-col md:flex-row'>
				<div className='flex-1 w-full flex md:h-screen items-center justify-center p-10 md:sticky top-0 '>
					<div className='w-full flex justify-between items-center flex-row md:flex-col gap-5'>
						<Link href={PAGES_DATA.home_page}>
							<ImageWithFallback
								src={'/icons/FUDEX_7t.png'}
								className='w-[100px] md:w-[200px]'
							/>
						</Link>
						{canSkip && (
							<Link
								href={skip || PAGES_DATA.home_page}
								className='text-white text-xl md:hidden'>
								Skip
							</Link>
						)}
					</div>
				</div>
				<div className='flex-2 w-full min-h-[90vh] md:min-h-screen flex justify-center md:items-center bg-background rounded-t-4xl md:rounded-4xl px-5 py-10'>
					{children}
				</div>
			</div>
		</PageWrapper>
	);
};

export default AuthPageWrapper;
