import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import PackageCard from './PackageCard';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

const SinglePackageCategorySction = ({
	sectionTitle,
	packages,
	link,
}: {
	sectionTitle: string;
	packages: any[];
	link: string;
}) => {
	return (
		<div className='w-full flex flex-col gap-3 pb-5'>
			<Link
				href={link}
				className='w-full flex items-center gap-5 justify-between px-5'>
				<h2 className='text-lg font-semibold'>{sectionTitle}</h2>
				<ChevronRight />
			</Link>

			{packages.length > 0 ? (
				<ScrollArea className='w-screen max-w-[1400px] whitespace-nowrap'>
					<div className='flex w-max space-x-4 mx-5'>
						{packages.map((singlepackage) => (
							<div className='w-[200px]' key={singlepackage.id}>
								<PackageCard singlePackage={singlepackage} />
							</div>
						))}
					</div>
					<ScrollBar orientation='horizontal' hidden />
				</ScrollArea>
			) : (
				<p className='text-foreground/50 text-center py-4 px-5'>
					No packages available
				</p>
			)}
		</div>
	);
};

export default SinglePackageCategorySction;
