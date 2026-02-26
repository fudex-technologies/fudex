'use client';

import { PAGES_DATA } from '@/data/pagesData';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const SkipAuthPageComponent = ({ skip }: { skip?: string }) => {
	const searchParams = useSearchParams();
	const redirectUrl = searchParams.get('redirect');
	return (
		<>
			<Link
				href={
					skip
						? skip
						: redirectUrl
							? redirectUrl
							: PAGES_DATA.home_page
				}
				className='text-white text-xl md:hidden'>
				Skip
			</Link>
		</>
	);
};

export default SkipAuthPageComponent;
