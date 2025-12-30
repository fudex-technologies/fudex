import PWAUpdateToast from '@/components/pwa/PwaUpdateToaster';
import { Toaster } from 'sonner';
import { TRPCReactProvider } from '@/trpc/client';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import RequirePhoneModal from '@/components/RequirePhoneModal/RequirePhoneModal';
import OnboardingRedirect from './OnboardingRedirect';

export default function Providers({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<TRPCReactProvider>
			<NuqsAdapter>
				{children}
				<RequirePhoneModal />
				<PWAUpdateToast />
				<OnboardingRedirect />
				<Toaster position="top-center" />
			</NuqsAdapter>
		</TRPCReactProvider>
	);
}
