import GoBackButton from '@/components/GoBackButton';
import MobileBottomNav from '@/components/navigation-components/MobileBottomNav';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { FAQ_QUESTIONS_AND_ANSWERS, groupFAQs } from '@/data/FAQData';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function FaqPage() {
	const groupedFAQs = groupFAQs(FAQ_QUESTIONS_AND_ANSWERS);

	return (
		<PageWrapper className='flex flex-col items-center'>
			<div className='flex items-center gap-10 w-full px-5'>
				<GoBackButton />
				<h1 className='font-semibold text-xl'>FAQs</h1>
			</div>
			<SectionWrapper className='flex flex-col items-center max-w-lg px-5!'>
				<div className='w-full space-y-5 '>
					{Object.entries(groupedFAQs).map(([groupTitle, faqs]) => (
						<div
							key={groupTitle}
							className='w-full space-y-2 pb-5 '>
							<p className='font-light text-gray-500'>
								{groupTitle}
							</p>
							<div className='w-full bg-background rounded-lg flex flex-col'>
								{/* Questions */}
								<div className='space-y-3'>
									{faqs.map((faq) => (
										<Link
											key={faq.id}
											href={`${PAGES_DATA.profile_faqs_page}/${faq.id}`}
											className={cn(
												'w-full py-5 flex items-center justify-between border-b'
											)}>
											<p className='text-lg'>
												{faq.question}
											</p>
											<ChevronRight size={16} />
										</Link>
									))}
								</div>
							</div>
						</div>
					))}
				</div>
			</SectionWrapper>
			<MobileBottomNav />
		</PageWrapper>
	);
}
