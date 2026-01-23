import type { Metadata, Viewport } from 'next';
import Providers from './Providers';
import { startupImage } from '@/constants/startupImages';
import './globals.css';

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
			<head>
				<link
					href='https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&display=swap'
					rel='stylesheet'
				/>
			</head>
			<body className={`antialiased `}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
