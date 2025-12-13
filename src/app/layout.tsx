import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Providers from './Providers';
import { startupImage } from '@/constants/startupImages';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const viewport: Viewport = {
	maximumScale: 1,
	userScalable: false,
};

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: 'http://localhost:3000';

export const metadata: Metadata = {
	title: 'FUDEX',
	description: 'Food at Your Door in Minutes',
	metadataBase: new URL(defaultUrl),
	icons: {
		icon: [
			{ rel: 'icon', url: '/icons/android-chrome-192x192.png' },
			{ rel: 'apple-touch-icon', url: '/icons/apple-touch-icon.png' },
		],
		apple: [
			{
				url: '/icons/apple-touch-icon.png',
			},
		],
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: 'black-translucent',
		title: 'FUDEX',
		startupImage,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
