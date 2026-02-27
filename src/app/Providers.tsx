import PWAUpdateToast from '@/components/pwa/PwaUpdateToaster';
import { Toaster } from 'sonner';
import { TRPCReactProvider } from '@/trpc/client';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import RequirePhoneModal from '@/components/RequirePhoneModal/RequirePhoneModal';
import OnboardingRedirect from './OnboardingRedirect';
import PwaInstallPrompt from '@/components/pwa/PwaInstallPrompt';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { Suspense } from 'react';
import PushNotificationPrompt from '@/components/pwa/PushNotificationPrompt';

export default function Providers({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<Suspense>
				<GoogleAnalytics />
			</Suspense>
			<TRPCReactProvider>
				<NuqsAdapter>
					{children}
					<RequirePhoneModal />
					<PwaInstallPrompt />
					<PWAUpdateToast />
					<PushNotificationPrompt />
					<OnboardingRedirect />
					<Toaster position='top-center' />
				</NuqsAdapter>
			</TRPCReactProvider>
			<Analytics />
			<SpeedInsights />
		</>
	);
}
