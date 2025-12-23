import MobileBottomNav from '@/components/navigation-components/MobileBottomNav';
import PageWrapper from '@/components/wrapers/PageWrapper';

export default function ProfileLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<PageWrapper className={'p-0 max-w-screen relative bg-foreground/5'}>
			{children}
			<MobileBottomNav />
		</PageWrapper>
	);
}
