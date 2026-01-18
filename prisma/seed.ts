// import 'dotenv/config';
// import prisma from '@/lib/prisma';
// import { hash } from 'bcryptjs';


// async function main() {
// 	console.log('🌱 Starting seed...');
// 	console.log("DB URL:", process.env.DATABASE_URL);
// 	// Create vendor user
// 	const vendorEmail = 'adeyemiglr@gmail.com';
// 	// const vendorPassword = 'vendor@123';
// 	console.log(vendorEmail);
// 	// Check if vendor user already exists
// 	let vendorUser = await prisma.user.findUnique({
// 		where: { email: vendorEmail },
// 	});



// 	if (!vendorUser) {
// 		// Hash password
// 		// const hashedPassword = await hash(vendorPassword, 10);

// 		// Create vendor user
// 		vendorUser = await prisma.user.create({
// 			data: {
// 				name: 'Vendor Test User',
// 				email: vendorEmail,
// 				phone: '+2348012345678',
// 				emailVerified: true,
// 				phoneVerified: true,
// 			},
// 		});

// 		console.log('✅ Created vendor user:', vendorUser.email);
// 	} else {
// 		console.log('ℹ️  Vendor user already exists:', vendorUser.email);
// 	}

// 	// Assign VENDOR role
// 	const existingVendorRole = await prisma.userRole.findFirst({
// 		where: {
// 			userId: vendorUser.id,
// 			role: 'VENDOR',
// 		},
// 	});

// 	if (!existingVendorRole) {
// 		await prisma.userRole.create({
// 			data: {
// 				userId: vendorUser.id,
// 				role: 'VENDOR',
// 			},
// 		});
// 		console.log('✅ Assigned VENDOR role to user');
// 	} else {
// 		console.log('ℹ️  VENDOR role already assigned');
// 	}

// 	// Create vendor profile
// 	let vendor = await prisma.vendor.findFirst({
// 		where: { ownerId: vendorUser.id },
// 	});

// 	if (!vendor) {
// 		vendor = await prisma.vendor.create({
// 			data: {
// 				ownerId: vendorUser.id,
// 				name: 'Test Restaurant',
// 				slug: 'test-restaurant',
// 				description: 'A test restaurant for vendor dashboard testing',
// 				phone: '+2348012345678',
// 				email: vendorEmail,
// 				address: '123 Test Street',
// 				city: 'Lagos',
// 				country: 'NG',
// 			},
// 		});
// 		console.log('✅ Created vendor profile:', vendor.name);
// 	} else {
// 		console.log('ℹ️  Vendor profile already exists:', vendor.name);
// 	}

// 	// Create sample product
// 	let product = await prisma.product.findFirst({
// 		where: {
// 			vendorId: vendor.id,
// 			name: 'Special Fried Rice',
// 		},
// 	});

// 	if (!product) {
// 		product = await prisma.product.create({
// 			data: {
// 				vendorId: vendor.id,
// 				name: 'Special Fried Rice',
// 				description: 'Flavorful basmati fried rice with veggies',
// 				inStock: true,
// 			},
// 		});
// 		console.log('✅ Created sample product:', product.name);
// 	} else {
// 		console.log('ℹ️  Sample product already exists:', product.name);
// 	}

// 	// Create sample product item
// 	const existingItem = await prisma.productItem.findFirst({
// 		where: {
// 			vendorId: vendor.id,
// 			name: 'Big Pack',
// 		},
// 	});

// 	if (!existingItem) {
// 		await prisma.productItem.create({
// 			data: {
// 				vendorId: vendor.id,
// 				productId: product.id,
// 				name: 'Big Pack',
// 				slug: 'big-pack',
// 				description: 'Large portion of special fried rice',
// 				price: 2500,
// 				currency: 'NGN',
// 				images: [],
// 				isActive: true,
// 				inStock: true,
// 			},
// 		});
// 		console.log('✅ Created sample product item');
// 	} else {
// 		console.log('ℹ️  Sample product item already exists');
// 	}

// 	// --- Bulk Seeding (Infinite Scroll Testing) ---
// 	console.log('\n🌱 Starting Bulk Seeding for Infinite Scroll...');

// 	const adjectives = ['Tasty', 'Spicy', 'Delicious', 'Savory', 'Golden', 'Fresh', 'Hot', 'Sweet', 'Urban', 'Local', 'Royal'];
// 	const nouns = ['Kitchen', 'Bistro', 'Diner', 'Eatery', 'Grill', 'Place', 'Spot', 'Corner', 'Haven', 'Palace'];
// 	const cuisines = ['Pizza', 'Burger', 'Sushi', 'Tacos', 'Pasta', 'Curry', 'Noodles', 'Rice', 'BBQ', 'Salad'];

// 	const foodAdjectives = ['Crispy', 'Tender', 'Juicy', 'Cheesy', 'Fluffy', 'Crunchy', 'Smoky'];
// 	const foodItems = ['Chicken', 'Beef', 'Pork', 'Fish', 'Shrimp', 'Tofu', 'Vegetables', 'Combo', 'Platter'];

// 	for (let i = 0; i < 50; i++) {
// 		const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
// 		const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
// 		const randomCuisine = cuisines[Math.floor(Math.random() * cuisines.length)];

// 		const vendorName = `${randomAdjective} ${randomCuisine} ${randomNoun} ${i + 1}`;
// 		const vendorSlug = `${vendorName.toLowerCase().replace(/ /g, '-')}-${Date.now()}`;

// 		// Check if exists (unlikely due to timestamp, but good practice)
// 		const existing = await prisma.vendor.findFirst({ where: { slug: vendorSlug } });
// 		if (existing) continue;

// 		const vendor = await prisma.vendor.create({
// 			data: {
// 				name: vendorName,
// 				slug: vendorSlug,
// 				description: `Authentic ${randomCuisine} experience. Best in town!`,
// 				phone: `+234${Math.floor(Math.random() * 10000000000)}`,
// 				email: `vendor${i}@example.com`,
// 				address: `${Math.floor(Math.random() * 100)} Random St, Lagos`,
// 				city: 'Lagos',
// 				country: 'NG',
// 				reviewsAverage: Number((Math.random() * 2 + 3).toFixed(1)), // 3.0 to 5.0
// 				reviewsCount: Math.floor(Math.random() * 100),
// 				createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)), // Random past date
// 			}
// 		});

// 		// Create 5-10 products per vendor
// 		const numProducts = Math.floor(Math.random() * 6) + 5;
// 		for (let j = 0; j < numProducts; j++) {
// 			const prodAdj = foodAdjectives[Math.floor(Math.random() * foodAdjectives.length)];
// 			const prodItem = foodItems[Math.floor(Math.random() * foodItems.length)];
// 			const productName = `${prodAdj} ${prodItem} Special`;

// 			const product = await prisma.product.create({
// 				data: {
// 					vendorId: vendor.id,
// 					name: productName,
// 					description: `Delicious ${productName} made with fresh ingredients.`,
// 					inStock: true,
// 				}
// 			});

// 			// Create 1-2 items
// 			const numItems = Math.floor(Math.random() * 2) + 1;
// 			for (let k = 0; k < numItems; k++) {
// 				await prisma.productItem.create({
// 					data: {
// 						vendorId: vendor.id,
// 						productId: product.id,
// 						name: `${productName} ${k === 0 ? 'Regular' : 'Large'}`,
// 						slug: `${productName.toLowerCase().replace(/ /g, '-')}-${vendor.id.substring(0, 4)}-${j}-${k}`,
// 						description: 'Great portion size.',
// 						price: Math.floor(Math.random() * 5000) + 1000,
// 						currency: 'NGN',
// 						isActive: true,
// 						inStock: true,
// 					}
// 				});
// 			}
// 		}
// 		if (i % 10 === 0) console.log(`   Processed ${i} vendors...`);
// 	}
// 	console.log('✅ Bulk seeding completed!');

// 	console.log('\n📋 Seed Summary:');
// 	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
// 	console.log('Email:', vendorEmail);
// 	// console.log('Password:', vendorPassword);
// 	console.log('Vendor Name:', vendor.name);
// 	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
// 	console.log('✅ Seed completed successfully!');
// }

// main()
// 	.catch((e) => {
// 		console.error('❌ Seed failed:', e);
// 		process.exit(1);
// 	})
// 	.finally(async () => {
// 		await prisma.$disconnect();
// 	});

