import 'dotenv/config';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';


async function main() {
	console.log('🌱 Starting seed...');
	console.log("DB URL:", process.env.DATABASE_URL);
	// Create vendor user
	const vendorEmail = 'adeyemiglr@gmail.com';
	// const vendorPassword = 'vendor@123';
	console.log(vendorEmail);
	// Check if vendor user already exists
	let vendorUser = await prisma.user.findUnique({
		where: { email: vendorEmail },
	});



	if (!vendorUser) {
		// Hash password
		// const hashedPassword = await hash(vendorPassword, 10);

		// Create vendor user
		vendorUser = await prisma.user.create({
			data: {
				name: 'Vendor Test User',
				email: vendorEmail,
				phone: '+2348012345678',
				emailVerified: true,
				phoneVerified: true,
			},
		});

		console.log('✅ Created vendor user:', vendorUser.email);
	} else {
		console.log('ℹ️  Vendor user already exists:', vendorUser.email);
	}

	// Assign VENDOR role
	const existingVendorRole = await prisma.userRole.findFirst({
		where: {
			userId: vendorUser.id,
			role: 'VENDOR',
		},
	});

	if (!existingVendorRole) {
		await prisma.userRole.create({
			data: {
				userId: vendorUser.id,
				role: 'VENDOR',
			},
		});
		console.log('✅ Assigned VENDOR role to user');
	} else {
		console.log('ℹ️  VENDOR role already assigned');
	}

	// Create vendor profile
	let vendor = await prisma.vendor.findFirst({
		where: { ownerId: vendorUser.id },
	});

	if (!vendor) {
		vendor = await prisma.vendor.create({
			data: {
				ownerId: vendorUser.id,
				name: 'Test Restaurant',
				slug: 'test-restaurant',
				description: 'A test restaurant for vendor dashboard testing',
				phone: '+2348012345678',
				email: vendorEmail,
				address: '123 Test Street',
				city: 'Lagos',
				country: 'NG',
			},
		});
		console.log('✅ Created vendor profile:', vendor.name);
	} else {
		console.log('ℹ️  Vendor profile already exists:', vendor.name);
	}

	// Create sample product
	let product = await prisma.product.findFirst({
		where: {
			vendorId: vendor.id,
			name: 'Special Fried Rice',
		},
	});

	if (!product) {
		product = await prisma.product.create({
			data: {
				vendorId: vendor.id,
				name: 'Special Fried Rice',
				description: 'Flavorful basmati fried rice with veggies',
				inStock: true,
			},
		});
		console.log('✅ Created sample product:', product.name);
	} else {
		console.log('ℹ️  Sample product already exists:', product.name);
	}

	// Create sample product item
	const existingItem = await prisma.productItem.findFirst({
		where: {
			vendorId: vendor.id,
			name: 'Big Pack',
		},
	});

	if (!existingItem) {
		await prisma.productItem.create({
			data: {
				vendorId: vendor.id,
				productId: product.id,
				name: 'Big Pack',
				slug: 'big-pack',
				description: 'Large portion of special fried rice',
				price: 2500,
				currency: 'NGN',
				images: [],
				isActive: true,
				inStock: true,
			},
		});
		console.log('✅ Created sample product item');
	} else {
		console.log('ℹ️  Sample product item already exists');
	}

	console.log('\n📋 Seed Summary:');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('Email:', vendorEmail);
	// console.log('Password:', vendorPassword);
	console.log('Vendor Name:', vendor.name);
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
	console.log('✅ Seed completed successfully!');
}

main()
	.catch((e) => {
		console.error('❌ Seed failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

