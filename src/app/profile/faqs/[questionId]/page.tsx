import GoBackButton from '@/components/GoBackButton';
import MobileBottomNav from '@/components/navigation-components/MobileBottomNav';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { FAQ_QUESTIONS_AND_ANSWERS } from '@/data/FAQData';

interface Props {
	params: Promise<{ questionId: string }>;
}

export default async function FAQAnswer({ params }: Props) {
	const { questionId } = await params;

	const question = FAQ_QUESTIONS_AND_ANSWERS.find(
		(question) => String(question.id) === questionId
	);
	return (
		<PageWrapper className='flex flex-col items-center'>
			<div className='flex items-center gap-10 w-full px-5'>
				<GoBackButton />
				<h1 className='font-semibold text-xl'>Answer</h1>
			</div>
			<SectionWrapper className='flex flex-col items-center'>
				<div className='w-full space-y-5'>
					<h1 className='font-semibold text-lg mb-10'>
						{question?.question}
					</h1>
					<p>{question?.answer}</p>
				</div>
			</SectionWrapper>
			<MobileBottomNav />
		</PageWrapper>
	);
}
