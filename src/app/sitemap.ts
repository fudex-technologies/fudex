import { MetadataRoute } from 'next';
// import { prisma } from '@/lib/prisma'; // Adjust import path

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = process.env.VERCEL_URL
		? `https://${process.env.VERCEL_URL}`
		: 'http://localhost:3000';

	// Static routes
	const routes = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'daily' as const,
			priority: 1,
		},
		{
			url: `${baseUrl}/profile/faqs`,
			lastModified: new Date(),
			changeFrequency: 'daily' as const,
			priority: 0.9,
		},
		// {
		// 	url: `${baseUrl}/about`,
		// 	lastModified: new Date(),
		// 	changeFrequency: 'monthly' as const,
		// 	priority: 0.5,
		// },
		// {
		// 	url: `${baseUrl}/contact`,
		// 	lastModified: new Date(),
		// 	changeFrequency: 'monthly' as const,
		// 	priority: 0.5,
		// },
	];

	// Fetch dynamic vendor/restaurant pages
	// Uncomment when ready to use
	/*
	const vendors = await prisma.vendor.findMany({
		where: {
			approvalStatus: 'APPROVED',
		},
		select: {
			slug: true,
			updatedAt: true,
		},
		orderBy: {
			updatedAt: 'desc',
		},
	});

	const vendorRoutes = vendors.map((vendor) => ({
		url: `${baseUrl}/restaurants/${vendor.slug}`,
		lastModified: vendor.updatedAt,
		changeFrequency: 'weekly' as const,
		priority: 0.8,
	}));
	*/

	// Fetch dynamic category pages
	/*
	const categories = await prisma.category.findMany({
		select: {
			slug: true,
		},
	});

	const categoryRoutes = categories.map((category) => ({
		url: `${baseUrl}/categories/${category.slug}`,
		lastModified: new Date(),
		changeFrequency: 'weekly' as const,
		priority: 0.7,
	}));
	*/

	return [
		...routes,
		// ...vendorRoutes,
		// ...categoryRoutes,
	];
}
