import PWAUpdateToast from '@/components/pwa/PwaUpdateToaster';
import { Toaster } from 'sonner';
import { TRPCReactProvider } from '@/trpc/client';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export default function Providers({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<TRPCReactProvider>
			<NuqsAdapter>
				{' '}
				{children}
				<PWAUpdateToast />
				<Toaster />
			</NuqsAdapter>
		</TRPCReactProvider>
	);
}
