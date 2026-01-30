import type { Metadata, Viewport } from 'next';
import Providers from './Providers';
import { startupImage } from '@/constants/startupImages';
import './globals.css';
import {
	FUDEX_CONTACT_EMAIL,
	FUDEX_PHONE_NUMBER,
} from '@/lib/staticData/contactData';

export const viewport: Viewport = {
	maximumScale: 1,
	userScalable: false,
	width: 'device-width',
	initialScale: 1,
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
		{ media: '(prefers-color-scheme: dark)', color: '#000000' },
	],
};

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: 'http://localhost:3000';

export const metadata: Metadata = {
	title: {
		default: 'FUDEX - Food Delivery in Minutes | Order Food Online',
		template: '%s | FUDEX',
	},
	description:
		'Order fresh food from your favorite local restaurants and get it delivered to your door in minutes. Fast, reliable food delivery service with real-time tracking.',
	metadataBase: new URL(defaultUrl),
	keywords: [
		'food delivery',
		'online food order',
		'restaurant delivery',
		'food delivery app',
		'order food online',
		'fast food delivery',
		'local restaurants',
		'food near me',
	],
	authors: [{ name: 'FUDEX' }],
	creator: 'FUDEX',
	publisher: 'FUDEX',
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},

	// Open Graph
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: defaultUrl,
		title: 'FUDEX - Food Delivery in Minutes',
		description:
			'Order fresh food from your favorite local restaurants and get it delivered to your door in minutes.',
		siteName: 'FUDEX',
		images: [
			{
				url: '/og-image.png',
				width: 1200,
				height: 630,
				alt: 'FUDEX - Food Delivery Service',
			},
		],
	},

	// Twitter
	twitter: {
		card: 'summary_large_image',
		title: 'FUDEX - Food Delivery in Minutes',
		description:
			'Order fresh food from your favorite local restaurants and get it delivered to your door in minutes.',
		images: ['/twitter-image.png'],
		creator: '@fudex',
	},

	// Icons
	icons: {
		icon: [
			{ rel: 'icon', url: '/icons/favicon.ico', sizes: 'any' },
			{ rel: 'icon', url: '/icons/icon.svg', type: 'image/svg+xml' },
			{
				rel: 'icon',
				url: '/icons/android-chrome-192x192.png',
				sizes: '192x192',
				type: 'image/png',
			},
			{
				rel: 'icon',
				url: '/icons/android-chrome-512x512.png',
				sizes: '512x512',
				type: 'image/png',
			},
		],
		apple: [
			{
				url: '/icons/apple-touch-icon.png',
				sizes: '180x180',
				type: 'image/png',
			},
		],
		other: [
			{
				rel: 'mask-icon',
				url: '/icons/safari-pinned-tab.svg',
				color: '#000000',
			},
		],
	},

	// PWA
	manifest: '/manifest.json',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'black-translucent',
		title: 'FUDEX',
		startupImage,
	},

	// Additional meta tags
	alternates: {
		canonical: defaultUrl,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	// verification: {
	// google: 'your-google-site-verification-code',
	// yandex: 'your-yandex-verification-code',
	// bing: 'your-bing-verification-code',
	// },
	category: 'logistics',
};

// Structured Data (JSON-LD)
const structuredData = {
	'@context': 'https://schema.org',
	'@type': 'Organization',
	name: 'FUDEX',
	description:
		'Food Delivery Service - Order food online and get it delivered in minutes',
	url: defaultUrl,
	logo: `${defaultUrl}/icons/android-chrome-512x512.png`,
	contactPoint: {
		'@type': 'ContactPoint',
		contactType: 'Customer Service',
		telephone: FUDEX_PHONE_NUMBER,
		email: FUDEX_CONTACT_EMAIL,
	},
	sameAs: [
		// 'https://www.facebook.com/fudex',
		// 'https://twitter.com/fudex',
		// 'https://www.instagram.com/fudex',
		// 'https://www.linkedin.com/company/fudex',
	],
	address: {
		'@type': 'PostalAddress',
		addressCountry: 'NG',
		// addressLocality: 'Lagos',
		// addressRegion: 'Lagos',
	},
};

const webAppStructuredData = {
	'@context': 'https://schema.org',
	'@type': 'WebApplication',
	name: 'FUDEX',
	description: 'Order food from local restaurants with fast delivery',
	applicationCategory: 'FoodEstablishment',
	operatingSystem: 'All',
	offers: {
		'@type': 'Offer',
		price: '0',
		priceCurrency: 'NGN',
	},
	aggregateRating: {
		'@type': 'AggregateRating',
		ratingValue: '4.5',
		ratingCount: '1000',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<head>
				{/* Preconnect to external domains for performance */}
				<link rel='preconnect' href='https://api.fontshare.com' />
				<link rel='dns-prefetch' href='https://api.fontshare.com' />

				{/* Font loading with display swap for better performance */}
				<link
					href='https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&display=swap'
					rel='stylesheet'
				/>

				{/* Structured Data */}
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(structuredData),
					}}
				/>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(webAppStructuredData),
					}}
				/>
			</head>
			<body className='antialiased'>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
