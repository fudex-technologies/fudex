import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
    vendorProcedure,
    operatorProcedure,
    adminProcedure,
    vendorAndOperatorProcedure
} from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { DayOfWeek, OrderStatus, VendorAvailabilityStatus } from '@prisma/client';
import {
    sendVendorApprovalEmail,
    sendVendorDeclineEmail,
    sendVendorSubmissionConfirmation,
    sendAdminNewVendorNotification
} from '@/lib/email';
import { createPaystackRecipient, getPaystackBanks } from "@/lib/paystack";
import { verifyVerificationToken } from '@/modules/auth-phone/server/procedures';

const generateUniqueSlug = async (prisma: any, name: string, vendorId: string): Promise<string> => {
    const baseSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let slug = `${baseSlug}-${uuidv4().slice(0, 8)}`;

    while (await prisma.productItem.findFirst({ where: { slug } })) {
        slug = `${baseSlug}-${uuidv4().slice(0, 8)}`;
    }

    return slug;
};

export const vendorRouter = createTRPCRouter({
    // Get non-sensitive platform settings
    getPublicPlatformSettings: publicProcedure
        .query(async ({ ctx }) => {
            const keys = ["BASE_DELIVERY_FEE", "SERVICE_FEE"];
            const settings = await ctx.prisma.platformSetting.findMany({
                where: { key: { in: keys } }
            });

            const resultMap: Record<string, any> = {};
            settings.forEach(s => {
                resultMap[s.key] = s.value;
            });

            return resultMap;
        }),

    // Public listings with optional search / pagination
    list: publicProcedure
        .input(z.object({
            q: z.string().optional(),
            ratingFilter: z.string().optional(),
            take: z.number().optional().default(20),
            skip: z.number().optional().default(0)
        }))
        .query(({ ctx, input }) => {
            const where: any = input.q ? {
                OR: [
                    {
                        name: { contains: input.q, mode: "insensitive" }
                    },
                    { description: { contains: input.q, mode: "insensitive" } }
                ],
                AND: {
                    approvalStatus: 'APPROVED' // Only show approved vendors
                }
            } : {
                approvalStatus: 'APPROVED' // Only show approved vendors
            };

            if (input?.ratingFilter) {
                where.reviewsAverage = {
                    gte: input.ratingFilter === "2.0+" ? 2 : input.ratingFilter === "3.5+" ? 3.5 : input.ratingFilter === "4.0+" ? 4 : input.ratingFilter === "4.5+" ? 4.5 : 0
                }
            }

            return ctx.prisma.vendor.findMany({
                where,
                take: input.take,
                skip: input.skip,
                orderBy: { createdAt: "desc" },
                include: {
                    openingHours: true,
                    productItems: {
                        where: {
                            isActive: true,
                            inStock: true
                        },
                        orderBy: {
                            price: 'asc'
                        },
                        take: 1,
                        select: {
                            price: true
                        }
                    }
                }
            }).then(vendors => vendors.map(v => ({
                ...v,
                minPrice: v.productItems[0]?.price ?? null
            })));
        }),

    listInfinite: publicProcedure
        .input(z.object({
            q: z.string().optional(),
            ratingFilter: z.string().optional(),
            openedSort: z.boolean().optional(),
            randomSeed: z.number().optional().default(0), // Added seed
            limit: z.number().min(1).max(100).default(20),
            cursor: z.number().default(0),
            categorySlug: z.string().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const limit = input.limit;
            const skip = input.cursor;

            if (input.openedSort) {
                // Get current day and time for opening hours check
                const now = new Date();
                const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                const currentDay = dayNames[now.getDay()];
                const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

                // Calculate rating threshold (parameterized for safety)
                const ratingThreshold = input.ratingFilter
                    ? (input.ratingFilter === "2.0+" ? 2 :
                        input.ratingFilter === "3.5+" ? 3.5 :
                            input.ratingFilter === "4.0+" ? 4 :
                                input.ratingFilter === "4.5+" ? 4.5 : 0)
                    : null;

                // Build parameterized query with proper parameter indexing
                // Parameters will be: [searchParam?, currentDay, currentTime, ratingThreshold?, limit+1, skip, randomSeed]
                const params: any[] = [];
                let paramIndex = 1;

                // Build WHERE conditions with proper parameterization
                const conditions: string[] = ['v."approvalStatus" = \'APPROVED\''];

                if (input.q) {
                    const searchParam = `%${input.q}%`;
                    params.push(searchParam);
                    conditions.push(`(v.name ILIKE $${paramIndex} OR v.description ILIKE $${paramIndex})`);
                    paramIndex++;
                }

                // Add current day parameter
                params.push(currentDay);
                const currentDayParam = paramIndex;
                paramIndex++;

                // Add current time parameter
                params.push(currentTime);
                const currentTimeParam = paramIndex;
                paramIndex++;

                // Add rating threshold if provided
                if (ratingThreshold !== null) {
                    params.push(ratingThreshold);
                    conditions.push(`v."reviewsAverage" >= $${paramIndex}`);
                    paramIndex++;
                }

                // Add limit parameter
                params.push(limit + 1);
                const limitParam = paramIndex;
                paramIndex++;

                // Add skip parameter
                params.push(skip);
                const skipParam = paramIndex;
                paramIndex++;

                // Add random seed parameter
                params.push(input.randomSeed.toString());
                const randomSeedParam = paramIndex;
                paramIndex++;

                if (input.categorySlug) {
                    params.push(input.categorySlug);
                    conditions.push(`v.id IN (
                        SELECT vc."vendorId" 
                        FROM "VendorCategory" vc 
                        JOIN "Category" c ON c.id = vc."categoryId" 
                        WHERE c.slug = $${paramIndex}
                    )`);
                    paramIndex++;
                }

                // Raw SQL query with open/closed sorting AND randomized seed
                // Sorting logic:
                // 1. Open vendors first (is_open DESC)
                // 2. Then randomized within each group using MD5 hash (consistent per session)
                // 3. Then by creation date (newest first)
                const query = `
                    SELECT
                        v.*,
                        CASE
                            WHEN v."availabilityStatus" = 'OPEN' THEN 1
                            WHEN v."availabilityStatus" = 'CLOSED' THEN 0
                            WHEN v."availabilityStatus" = 'AUTO' THEN
                                CASE
                                    WHEN EXISTS (
                                        SELECT 1
                                        FROM "VendorOpeningHour" oh
                                        WHERE oh."vendorId" = v.id
                                        AND oh.day = $${currentDayParam}
                                        AND oh."isClosed" = false
                                        AND oh."openTime" IS NOT NULL
                                        AND oh."closeTime" IS NOT NULL
                                        AND oh."openTime" <= $${currentTimeParam}
                                        AND oh."closeTime" >= $${currentTimeParam}
                                    ) THEN 1
                                    ELSE 0
                                END
                            ELSE 0
                        END as is_open,
                        (
                            SELECT MIN(pi.price)
                            FROM "ProductItem" pi
                            WHERE pi."vendorId" = v.id
                            AND pi."isActive" = true
                            AND pi."inStock" = true
                        ) as min_price
                    FROM "Vendor" v
                    WHERE ${conditions.join(' AND ')}
                    ORDER BY
                        is_open DESC,
                        MD5(v.id || $${randomSeedParam}::text) ASC,
                        v."createdAt" DESC
                    LIMIT $${limitParam}
                    OFFSET $${skipParam}
                `;

                const items: any[] = await ctx.prisma.$queryRawUnsafe(query, ...params);

                // Fetch opening hours for all vendors in the result
                if (items.length > 0) {
                    const vendorIds = items.map(v => v.id);
                    const openingHours = await ctx.prisma.vendorOpeningHour.findMany({
                        where: { vendorId: { in: vendorIds } }
                    });

                    // Attach opening hours to each vendor
                    items.forEach(vendor => {
                        vendor.openingHours = openingHours.filter(oh => oh.vendorId === vendor.id);

                        // Convert numeric fields back to proper types (Prisma queryRaw returns Decimal as string)
                        vendor.reviewsAverage = parseFloat(vendor.reviewsAverage) || 0;
                        vendor.reviewsCount = parseInt(vendor.reviewsCount) || 0;
                        vendor.deliveryFee = vendor.deliveryFee ? parseFloat(vendor.deliveryFee) : null;
                        vendor.minPrice = vendor.min_price ? parseFloat(vendor.min_price) : null;

                        // Parse JSON fields if needed
                        // vendor.someJsonField = vendor.someJsonField ? JSON.parse(vendor.someJsonField) : null;
                    });
                }

                let nextCursor: number | undefined = undefined;
                if (items.length > limit) {
                    items.pop();
                    nextCursor = skip + limit;
                }

                return {
                    items,
                    nextCursor,
                };
            }

            const where: any = {
                approvalStatus: 'APPROVED'
            };

            if (input.q) {
                where.OR = [
                    { name: { contains: input.q, mode: "insensitive" } },
                    { description: { contains: input.q, mode: "insensitive" } }
                ];
            }

            if (input?.ratingFilter) {
                where.reviewsAverage = {
                    gte: input.ratingFilter === "2.0+" ? 2 :
                        input.ratingFilter === "3.5+" ? 3.5 :
                            input.ratingFilter === "4.0+" ? 4 :
                                input.ratingFilter === "4.5+" ? 4.5 : 0
                }
            }

            if (input.categorySlug) {
                where.vendorCategories = {
                    some: {
                        category: {
                            slug: input.categorySlug
                        }
                    }
                }
            }

            const items = await ctx.prisma.vendor.findMany({
                where,
                take: limit + 1,
                skip: skip,
                orderBy: { createdAt: "desc" },
                include: {
                    openingHours: true,
                    productItems: {
                        where: {
                            isActive: true,
                            inStock: true
                        },
                        orderBy: {
                            price: 'asc'
                        },
                        take: 1,
                        select: {
                            price: true
                        }
                    }
                }
            });

            const processedItems = items.map(v => ({
                ...v,
                minPrice: v.productItems[0]?.price ?? null
            }));

            let nextCursor: number | undefined = undefined;
            if (processedItems.length > limit) {
                processedItems.pop();
                nextCursor = skip + limit;
            }

            return {
                items: processedItems,
                nextCursor,
            };
        }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.prisma.vendor.findUnique({
                where: { id: input.id },
                include: {
                    openingHours: true,
                    addresses: true,
                    products: {
                        include: {
                            items: {
                                where: { isActive: true },
                                orderBy: { price: "asc" }
                            }
                        }
                    },
                    vendorCategories: {
                        include: {
                            category: true
                        }
                    },
                    _count: {
                        select: {
                            orders: true,
                            reviews: true
                        }
                    }
                }
            });
        }),

    getBySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.prisma.vendor.findUnique({ where: { slug: input.slug }, include: { products: true } });
        }),

    // Get a single product item by ID
    getProductItemById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.prisma.productItem.findUnique({
                where: { id: input.id },
                include: { product: true, vendor: true }
            });
        }),

    // Get multiple product items by IDs (for batch fetching)
    getProductItemsByIds: publicProcedure
        .input(z.object({ ids: z.array(z.string()) }))
        .query(({ ctx, input }) => {
            if (input.ids.length === 0) return [];
            return ctx.prisma.productItem.findMany({
                where: { id: { in: input.ids } },
                include: { product: true, vendor: true }
            });
        }),

    // Get product by ID with all its items (variants)
    getProductWithItems: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.prisma.product.findUnique({
                where: { id: input.id },
                include: {
                    items: {
                        where: { isActive: true },
                        orderBy: { price: "asc" },
                        include: {
                            categories: {
                                include: {
                                    category: true,
                                },
                            }
                        }
                    },
                    vendor: true
                }
            });
        }),

    getProductItemsByCategorySlug: publicProcedure
        .input(
            z.object({
                categorySlug: z.string(),
                vendorId: z.string().optional(),
                includeOutOfStock: z.boolean().optional().default(false),
            })
        )
        .query(async ({ ctx, input }) => {
            const { categorySlug, vendorId, includeOutOfStock } = input;

            return ctx.prisma.productItem.findMany({
                where: {
                    isActive: true,
                    ...(includeOutOfStock ? {} : { inStock: true }),
                    ...(vendorId ? { vendorId } : {}),

                    categories: {
                        some: {
                            category: {
                                slug: categorySlug,
                            },
                        },
                    },
                },

                include: {
                    vendor: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },

                orderBy: {
                    price: "asc",
                },
            });
        }),

    getVendorOpeningHours: publicProcedure
        .input(z.object({ vendorId: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.prisma.vendorOpeningHour.findMany({
                where: { vendorId: input.vendorId },
                orderBy: { day: "asc" },
            });
        }),

    isVendorOpenNow: publicProcedure
        .input(z.object({ vendorId: z.string() }))
        .query(async ({ ctx, input }) => {
            const now = new Date();

            const dayMap: Record<number, DayOfWeek> = {
                0: "SUNDAY",
                1: "MONDAY",
                2: "TUESDAY",
                3: "WEDNESDAY",
                4: "THURSDAY",
                5: "FRIDAY",
                6: "SATURDAY",
            };

            const day = dayMap[now.getDay()];
            const timeNow = now.toTimeString().slice(0, 5); // "HH:mm"

            const hours = await ctx.prisma.vendorOpeningHour.findUnique({
                where: {
                    vendorId_day: {
                        vendorId: input.vendorId,
                        day,
                    },
                },
            });

            if (!hours || hours.isClosed) return false;
            if (!hours.openTime || !hours.closeTime) return false;

            return timeNow >= hours.openTime && timeNow <= hours.closeTime;
        }),


    // Get product items for addons (from same vendor, excluding specific product items)
    getAddonProductItems: publicProcedure
        .input(z.object({
            vendorId: z.string(),
            excludeProductItemIds: z.array(z.string()).optional(),
            take: z.number().optional().default(50)
        }))
        .query(({ ctx, input }) => {
            const where: any = {
                vendorId: input.vendorId,
                isActive: true,
                inStock: true
            };
            if (input.excludeProductItemIds && input.excludeProductItemIds.length > 0) {
                where.id = { notIn: input.excludeProductItemIds };
            }
            return ctx.prisma.productItem.findMany({
                where,
                take: input.take,
                orderBy: { price: "asc" }
            });
        }),

    listProducts: publicProcedure
        .input(
            z.object({
                vendorId: z.string(),
                take: z.number().optional().default(100),
            })
        )
        .query(async ({ ctx, input }) => {
            const products = await ctx.prisma.product.findMany({
                where: {
                    vendorId: input.vendorId,
                },
                take: input.take,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    items: {
                        where: {
                            isActive: true, // Only include active items
                        },
                        include: {
                            categories: {
                                include: {
                                    category: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'asc', // First item will be the oldest/primary one
                        },
                    },
                },
            });

            // Filter out products that have no items
            const filteredProducts = products.filter((product) => product.items.length > 0);

            // Sort products by their cheapest item price
            return filteredProducts.sort((a, b) => {
                const aMinPrice = Math.min(...a.items.map(i => i.price));
                const bMinPrice = Math.min(...b.items.map(i => i.price));
                return aMinPrice - bMinPrice;
            });
        }),

    // Product item listing for a vendor
    listProductItems: publicProcedure
        .input(z.object({
            vendorId: z.string(),
            take: z.number().optional().default(50)
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.productItem.findMany({
                where: { vendorId: input.vendorId, isActive: true },
                take: input.take,
                orderBy: { price: "asc" },
                include: {
                    product: true,
                    categories: {
                        include: {
                            category: true
                        }
                    }
                }
            });
        }),

    // Combined search for vendors and product items
    search: publicProcedure
        .input(z.object({
            q: z.string().optional(),
            categoryId: z.string().optional(),
            categoryIds: z.array(z.string()).optional(),
            take: z.number().optional().default(20),
            skip: z.number().optional().default(0),
        }))
        .query(async ({ ctx, input }) => {
            const vendorWhere: any = {
                approvalStatus: 'APPROVED' // Only show approved vendors
            };
            if (input.q) {
                vendorWhere.OR = [
                    { name: { contains: input.q, mode: "insensitive" } },
                    { description: { contains: input.q, mode: "insensitive" } },
                ];
            }
            // Support both single categoryId (backward compatibility) and multiple categoryIds
            const categoryIds = input.categoryIds || (input.categoryId ? [input.categoryId] : []);
            if (categoryIds.length > 0) {
                vendorWhere.vendorCategories = {
                    some: { categoryId: { in: categoryIds } }
                };
            }

            const productWhere: any = { isActive: true };
            if (input.q) {
                productWhere.OR = [
                    { name: { contains: input.q, mode: "insensitive" } },
                    { description: { contains: input.q, mode: "insensitive" } },
                ];
            }
            if (categoryIds.length > 0) {
                productWhere.categories = {
                    some: { categoryId: { in: categoryIds } }
                };
            }

            const [vendors, products] = await Promise.all([
                ctx.prisma.vendor.findMany({
                    where: vendorWhere,
                    take: input.take,
                    skip: input.skip,
                    orderBy: { createdAt: "desc" },
                    include: { openingHours: true }
                }),
                ctx.prisma.productItem.findMany({
                    where: productWhere,
                    take: input.take,
                    skip: input.skip,
                    orderBy: { createdAt: "desc" },
                    include: {
                        product: true
                    }
                }),
            ]);

            return { vendors, products };
        }),

    searchInfinite: publicProcedure
        .input(z.object({
            q: z.string().optional(),
            categoryId: z.string().optional(),
            categoryIds: z.array(z.string()).optional(),
            limit: z.number().optional().default(20),
            cursor: z.number().default(0), // skip
        }))
        .query(async ({ ctx, input }) => {
            const limit = input.limit;
            const skip = input.cursor;

            const vendorWhere: any = {
                approvalStatus: 'APPROVED' // Only show approved vendors
            };
            if (input.q) {
                vendorWhere.OR = [
                    { name: { contains: input.q, mode: "insensitive" } },
                    { description: { contains: input.q, mode: "insensitive" } },
                ];
            }
            const categoryIds = input.categoryIds || (input.categoryId ? [input.categoryId] : []);
            if (categoryIds.length > 0) {
                vendorWhere.vendorCategories = {
                    some: { categoryId: { in: categoryIds } }
                };
            }

            const productWhere: any = { isActive: true };
            if (input.q) {
                productWhere.OR = [
                    { name: { contains: input.q, mode: "insensitive" } },
                    { description: { contains: input.q, mode: "insensitive" } },
                ];
            }
            if (categoryIds.length > 0) {
                productWhere.categories = {
                    some: { categoryId: { in: categoryIds } }
                };
            }

            const [vendors, products] = await Promise.all([
                ctx.prisma.vendor.findMany({
                    where: vendorWhere,
                    take: limit + 1,
                    skip: skip,
                    orderBy: { createdAt: "desc" },
                    include: { openingHours: true }
                }),
                ctx.prisma.productItem.findMany({
                    where: productWhere,
                    take: limit + 1,
                    skip: skip,
                    orderBy: { createdAt: "desc" },
                    include: {
                        product: true
                    }
                }),
            ]);

            // Determine next cursor (simplified: we move both lists by the same amount)
            // If either list has more items, we have a next page.
            let nextCursor: number | undefined = undefined;
            if (vendors.length > limit || products.length > limit) {
                nextCursor = skip + limit;
            }

            // Pop extra items
            if (vendors.length > limit) vendors.pop();
            if (products.length > limit) products.pop();

            return { vendors, products, nextCursor };
        }),

    // List vendors by approximate area using lat/lng bounding box
    listVendorsByArea: publicProcedure
        .input(z.object({
            lat: z.number(),
            lng: z.number(),
            radiusKm: z.number().optional().default(5),
            take: z.number().optional().default(50),
            skip: z.number().optional().default(0),
        }))
        .query(async ({ ctx, input }) => {
            const delta = input.radiusKm / 111; // ~degrees per km
            const latMin = input.lat - delta;
            const latMax = input.lat + delta;
            const lngMin = input.lng - delta;
            const lngMax = input.lng + delta;

            // Find addresses within the bounding box
            const addressesInArea = await ctx.prisma.address.findMany({
                where: {
                    lat: { gte: latMin, lte: latMax },
                    lng: { gte: lngMin, lte: lngMax },
                    vendorId: { not: null },
                },
                select: { vendorId: true },
                distinct: ['vendorId'],
            });

            const vendorIds = addressesInArea
                .map(addr => addr.vendorId)
                .filter((id): id is string => id !== null);

            if (vendorIds.length === 0) {
                return [];
            }

            return ctx.prisma.vendor.findMany({
                where: {
                    id: { in: vendorIds },
                    approvalStatus: 'APPROVED',
                },
                take: input.take,
                skip: input.skip,
                orderBy: { createdAt: "desc" },
                include: {
                    openingHours: true,
                    addresses: true,
                }
            });
        }),

    // Get popular vendors ordered by orders count and reviewsAverage
    getPopularVendors: publicProcedure
        .input(z.object({
            take: z.number().optional().default(10),
            skip: z.number().optional().default(0),
        }))
        .query(async ({ ctx, input }) => {
            const vendors = await ctx.prisma.vendor.findMany({
                where: { approvalStatus: 'APPROVED' },
                take: input.take,
                skip: input.skip,
                include: {
                    openingHours: true,
                    // _count: {
                    //     select: {
                    //         orders: true,
                    //     }
                    // },
                    _count: {
                        select: {
                            orders: {
                                where: {
                                    status: {
                                        notIn: ['PENDING', 'CANCELLED'],
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: [
                    {
                        orders: {
                            _count: 'desc',
                        },
                    },
                    {
                        favoritedBy: {
                            _count: 'desc',
                        },
                    },
                    {
                        reviewsAverage: 'desc',
                    },
                ],
            });

            return vendors;
        }),

    // List vendor reviews with infinite scroll
    listVendorReviewsInfinite: publicProcedure
        .input(z.object({
            vendorId: z.string(),
            limit: z.number().min(1).max(50).default(10),
            cursor: z.number().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const limit = input.limit;
            const skip = input.cursor || 0;

            const reviews = await ctx.prisma.review.findMany({
                where: { vendorId: input.vendorId },
                take: limit + 1,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        }
                    }
                }
            });

            let nextCursor: number | undefined = undefined;
            if (reviews.length > limit) {
                reviews.pop();
                nextCursor = skip + limit;
            }

            return {
                items: reviews,
                nextCursor,
            };
        }),

    createReview: protectedProcedure
        .input(z.object({
            vendorId: z.string(),
            rating: z.number().min(1).max(5),
            comment: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user.id;

            const vendor = await ctx.prisma.vendor.findUnique({
                where: { id: input.vendorId }
            });

            if (!vendor) {
                throw new Error("Vendor not found");
            }

            const existingReview = await ctx.prisma.review.findFirst({
                where: {
                    userId: userId,
                    vendorId: input.vendorId
                }
            });

            if (existingReview) {
                throw new Error("You have already reviewed this vendor");
            }

            const review = await ctx.prisma.review.create({
                data: {
                    userId: userId,
                    vendorId: input.vendorId,
                    rating: input.rating,
                    comment: input.comment
                }
            });

            const aggregations = await ctx.prisma.review.aggregate({
                where: { vendorId: input.vendorId },
                _avg: { rating: true },
                _count: { _all: true }
            });

            await ctx.prisma.vendor.update({
                where: { id: input.vendorId },
                data: {
                    reviewsAverage: aggregations._avg.rating || 0,
                    reviewsCount: aggregations._count._all || 0
                }
            });

            return review;
        }),



    // ========== VENDOR DASHBOARD PROCEDURES ==========

    // Create vendor - restricted (admin or vendors). Kept simple for now.
    createVendor: operatorProcedure
        .input(z.object({
            name: z.string(),
            slug: z.string(),
            description: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().optional(),
            address: z.string().optional(),
            city: z.string().optional(),
            coverImage: z.string().optional()
        }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.vendor.create({ data: input });
        }),

    // Get vendor owned by current user
    getMyVendor: vendorProcedure.query(async ({ ctx }) => {
        const userId = ctx.user!.id;
        const vendor = await ctx.prisma.vendor.findFirst({
            where: { ownerId: userId },
            include: {
                openingHours: true,
                addresses: true,
                documents: true,
                products: {
                    include: {
                        items: {
                            where: { isActive: true },
                            orderBy: { createdAt: "desc" }
                        }
                    },
                    orderBy: { createdAt: "desc" }
                },
                _count: {
                    select: {
                        orders: true,
                        productItems: true,
                    }
                }
            }
        });
        return vendor;
    }),

    // Update vendor profile (only owner can update)
    updateMyVendor: vendorProcedure
        .input(
            z.object({
                name: z.string().optional(),
                description: z.string().optional(),
                phone: z.string().optional(),
                email: z.string().email().optional(),
                address: z.string().optional(),
                city: z.string().optional(),
                country: z.string().optional(),
                postalCode: z.string().optional(),
                coverImage: z.string().url().or(z.literal('')).optional().nullable(),
                lat: z.number().optional(),
                lng: z.number().optional(),
                bankName: z.string().optional(),
                bankCode: z.string().optional(),
                bankAccountNumber: z.string().optional(),
                bankAccountName: z.string().optional(),
                accountName: z.string().optional(),
                availabilityStatus: z.nativeEnum(VendorAvailabilityStatus).optional(),
                areaId: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: userId }
            });
            if (!vendor) throw new Error("Vendor not found or you don't own a vendor");

            const { bankName, bankCode, bankAccountNumber, bankAccountName, accountName, availabilityStatus, address, city, country, postalCode, lat, lng, areaId, ...rest } = input;

            let paystackRecipient = vendor.paystackRecipient;
            const accountNameToUse = bankAccountName || accountName;

            // If bank details changed, create/update paystack recipient
            if (bankCode && bankAccountNumber && accountNameToUse) {
                try {
                    const recipientRes = await createPaystackRecipient({
                        name: accountNameToUse,
                        account_number: bankAccountNumber,
                        bank_code: bankCode,
                    });

                    if (recipientRes.status) {
                        paystackRecipient = recipientRes.data.recipient_code;
                    }
                } catch (error) {
                    console.error("Failed to create Paystack recipient:", error);
                    // We might not want to block the update if Paystack is down, 
                    // but for bank details it's better to be sure.
                    throw new Error("Failed to verify bank details with Paystack. Please check the account number and bank.");
                }
            }

            // Handle address updates - find or create the default address for the vendor
            if (address || city || country || lat || lng || postalCode) {
                const existingAddress = await ctx.prisma.address.findFirst({
                    where: {
                        vendorId: vendor.id,
                        isDefault: true,
                    }
                });

                if (existingAddress) {
                    // Update existing address
                    await ctx.prisma.address.update({
                        where: { id: existingAddress.id },
                        data: {
                            line1: address || existingAddress.line1,
                            city: city || existingAddress.city,
                            country: country || existingAddress.country,
                            postalCode: postalCode || existingAddress.postalCode,
                            lat: lat ?? existingAddress.lat,
                            lng: lng ?? existingAddress.lng,
                        }
                    });
                } else if (address || city || country) {
                    // Create new address if it doesn't exist and we have enough data
                    await ctx.prisma.address.create({
                        data: {
                            userId: userId,
                            vendorId: vendor.id,
                            line1: address || '',
                            city: city || '',
                            country: country || 'NG',
                            postalCode: postalCode,
                            lat: lat,
                            lng: lng,
                            isDefault: true,
                        }
                    });
                }
            }

            return ctx.prisma.vendor.update({
                where: { id: vendor.id },
                data: {
                    ...rest,
                    bankName: bankName || undefined,
                    bankCode: bankCode || undefined,
                    bankAccountNumber: bankAccountNumber || undefined,
                    bankAccountName: bankAccountName || undefined,
                    paystackRecipient: paystackRecipient || undefined,
                    availabilityStatus: availabilityStatus || undefined,
                    areaId: areaId || undefined,
                }
            });
        }),

    getSupportedBanks: vendorProcedure.query(async () => {
        try {
            const res = await getPaystackBanks();
            return res.data;
        } catch (error) {
            throw new Error("Failed to fetch supported banks");
        }
    }),

    getMyOpeningHours: vendorProcedure.query(async ({ ctx }) => {
        const vendor = await ctx.prisma.vendor.findFirst({
            where: { ownerId: ctx.user!.id },
        });

        if (!vendor) throw new Error("Vendor not found");

        return ctx.prisma.vendorOpeningHour.findMany({
            where: { vendorId: vendor.id },
            orderBy: { day: "asc" },
        });
    }),

    setMyOpeningHours: vendorProcedure
        .input(
            z.array(
                z.object({
                    day: z.enum(Object.values(DayOfWeek)),
                    openTime: z.string().optional(),  // "09:00"
                    closeTime: z.string().optional(), // "22:00"
                    isClosed: z.boolean().optional(),
                })
            )
        )
        .mutation(async ({ ctx, input }) => {
            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: ctx.user!.id },
            });

            if (!vendor) throw new Error("Vendor not found");

            await ctx.prisma.$transaction(
                input.map((d) =>
                    ctx.prisma.vendorOpeningHour.upsert({
                        where: {
                            vendorId_day: {
                                vendorId: vendor.id,
                                day: d.day,
                            },
                        },
                        update: {
                            openTime: d.isClosed ? null : d.openTime,
                            closeTime: d.isClosed ? null : d.closeTime,
                            isClosed: d.isClosed ?? false,
                        },
                        create: {
                            vendorId: vendor.id,
                            day: d.day,
                            openTime: d.isClosed ? null : d.openTime,
                            closeTime: d.isClosed ? null : d.closeTime,
                            isClosed: d.isClosed ?? false,
                        },
                    })
                )
            );

            return { success: true };
        }),


    // Get vendor's products with items
    getMyProducts: vendorProcedure
        .input(
            z.object({
                take: z.number().optional().default(50),
                skip: z.number().optional().default(0)
            })
        )
        .query(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: userId }
            });
            if (!vendor) throw new Error("Vendor not found");

            return ctx.prisma.product.findMany({
                where: { vendorId: vendor.id },
                include: {
                    items: {
                        orderBy: { createdAt: "desc" }
                    }
                },
                take: input.take,
                skip: input.skip,
                orderBy: { createdAt: "desc" }
            });
        }),

    // Get vendor's product items
    getMyProductItems: vendorProcedure
        .input(
            z.object({
                take: z.number().optional().default(50),
                skip: z.number().optional().default(0),
                productId: z.string().optional()
            })
        )
        .query(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: userId }
            });
            if (!vendor) throw new Error("Vendor not found");

            const where: any = { vendorId: vendor.id };
            if (input.productId) {
                where.productId = input.productId;
            }

            return ctx.prisma.productItem.findMany({
                where,
                include: {
                    product: true,
                    categories: {
                        include: { category: true }
                    }
                },
                take: input.take,
                skip: input.skip,
                orderBy: { createdAt: "desc" }
            });
        }),

    getMyOrdersInfinite: vendorProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(20),
            cursor: z.number().default(0), // skip
            status: z.array(z.enum(Object.values(OrderStatus))).optional()
        }))
        .query(async ({ ctx, input }) => {
            const limit = input.limit;
            const skip = input.cursor;

            const userId = ctx.user!.id;
            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: userId }
            });
            if (!vendor) throw new Error("Vendor not found");

            const where: any = { vendorId: vendor.id };
            if (input.status && input.status.length > 0) {
                where.status = { in: input.status };
            }

            const items = await ctx.prisma.order.findMany({
                where,
                take: limit + 1,
                skip: skip,
                orderBy: { createdAt: "desc" },
                include: {
                    // user: {
                    //     select: {
                    //         id: true,
                    //         name: true,
                    //         email: true,
                    //         phone: true
                    //     }
                    // },
                    // address: true,
                    items: {
                        include: {
                            productItem: {
                                include: {
                                    product: true
                                }
                            },
                            addons: {
                                include: {
                                    addonProductItem: {
                                        include: {
                                            product: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    // payment: true
                }
            });

            let nextCursor: typeof skip | undefined = undefined;
            if (items.length > limit) {
                items.pop();
                nextCursor = skip + limit;
            }

            return {
                items,
                nextCursor,
            };
        }),

    // Get vendor's orders
    getMyOrders: vendorProcedure
        .input(
            z.object({
                take: z.number().optional().default(50),
                skip: z.number().optional().default(0),
                status: z.array(z.enum(Object.values(OrderStatus))).optional()
            })
        )
        .query(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: userId }
            });
            if (!vendor) throw new Error("Vendor not found");

            const where: any = { vendorId: vendor.id };
            if (input.status && input.status.length > 0) {
                where.status = { in: input.status };
            }

            return ctx.prisma.order.findMany({
                where,
                include: {
                    // user: {
                    //     select: {
                    //         id: true,
                    //         name: true,
                    //         email: true,
                    //         phone: true
                    //     }
                    // },
                    // address: true,
                    items: {
                        include: {
                            productItem: {
                                include: {
                                    product: true
                                }
                            },
                            addons: {
                                include: {
                                    addonProductItem: {
                                        include: {
                                            product: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    // payment: true
                },
                take: input.take,
                skip: input.skip,
                orderBy: { createdAt: "desc" }
            });
        }),

    getMyOrderCounts: vendorProcedure
        .input(
            z.object({
                status: z.array(z.enum(Object.values(OrderStatus))).optional()
            })
        )
        .query(async ({ ctx }) => {
            const userId = ctx.user!.id;
            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: userId }
            });
            if (!vendor) throw new Error("Vendor not found");

            const counts = await ctx.prisma.order.groupBy({
                by: ['status'],
                where: {
                    vendorId: vendor.id,
                    status: {
                        notIn: ['PENDING'], // Exclude PENDING orders from counts
                    },
                },
                _count: {
                    _all: true,
                },
            });

            return counts.map(c => ({
                status: c.status as OrderStatus,
                count: c._count._all
            }));
        }),

    getMyTopSellingProductItems: vendorProcedure
        .input(z.object({
            take: z.number().optional().default(10)
        }))
        .query(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: userId }
            });
            if (!vendor) throw new Error("Vendor not found");

            // 1. Get total completed orders to check if we should show anything
            const completedOrdersCount = await ctx.prisma.order.count({
                where: {
                    vendorId: vendor.id,
                    status: 'DELIVERED'
                }
            });

            if (completedOrdersCount === 0) {
                return { items: [], hasCompletedOrders: false };
            }

            // 2. Fetch top product items by completed order count
            const topItems = await ctx.prisma.orderItem.groupBy({
                by: ['productItemId'],
                where: {
                    order: {
                        vendorId: vendor.id,
                        status: 'DELIVERED'
                    }
                },
                _count: {
                    productItemId: true
                },
                orderBy: {
                    _count: {
                        productItemId: 'desc'
                    }
                },
                take: input.take
            });

            if (topItems.length === 0) {
                return { items: [], hasCompletedOrders: true };
            }

            // 3. Fetch full details for these items
            const productItems = await ctx.prisma.productItem.findMany({
                where: {
                    id: { in: topItems.map(ti => ti.productItemId) }
                },
                include: {
                    product: true,
                    categories: {
                        include: {
                            category: true
                        }
                    }
                }
            });

            // Re-sort items by the count from topItems because findMany doesn't guarantee order
            const items = topItems.map(ti => {
                const detailedItem = productItems.find(pi => pi.id === ti.productItemId);
                return {
                    ...detailedItem,
                    orderCount: ti._count.productItemId
                };
            }).filter(item => item.id); // Filter out any that might have been deleted but still in OrderItems

            return {
                items,
                hasCompletedOrders: true
            };
        }),

    // Create a standalone product
    createProduct: vendorAndOperatorProcedure
        .input(z.object({
            vendorId: z.string(),
            name: z.string(),
            // slug: z.string(),
            description: z.string().optional(),
            inStock: z.boolean().optional().default(true),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx!.user!.id;

            // fetch vendor to validate ownership
            const vendor = await ctx.prisma.vendor.findUnique({
                where: { id: input.vendorId }
            });
            if (!vendor) throw new Error("Vendor not found");

            const isOperator = await ctx.prisma.userRole.findFirst({ where: { userId, role: "OPERATOR" } });
            const isSuper = await ctx.prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
            const isVendorOwner = vendor.ownerId === userId;

            if (!isOperator && !isSuper && !isVendorOwner) throw new Error("Forbidden: insufficient permissions");

            return ctx.prisma.product.create({
                data: {
                    vendorId: input.vendorId,
                    name: input.name,
                    // slug: input.slug,
                    description: input.description,
                    inStock: input.inStock
                }
            });
        }),

    // Create/Update product items (vendor/operator/admin). Now permission-checked to allow vendor owners as well.
    createProductItem: vendorAndOperatorProcedure
        .input(
            z.object({
                vendorId: z.string(),
                productId: z.string().optional(),
                name: z.string(),
                description: z.string().optional(),
                price: z.number(),
                currency: z.string().optional().default("NGN"),
                images: z.array(z.string()).optional(),
                categories: z.array(z.string()).optional().default([]),
                isActive: z.boolean().optional().default(true),
                inStock: z.boolean().optional().default(true),
                pricingType: z.enum(['FIXED', 'PER_UNIT']).optional().default('FIXED'),
                unitName: z.string().optional().nullable(),
                minQuantity: z.number().optional().default(1),
                maxQuantity: z.number().optional().nullable(),
                quantityStep: z.number().optional().default(1),
                packagingFee: z.number().optional().nullable(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (!ctx.user) throw new Error("Unauthorized");
            const userId = ctx.user.id;

            const vendor = await ctx.prisma.vendor.findUnique({ where: { id: input.vendorId } });
            if (!vendor) throw new Error("Vendor not found");

            const isOperator = await ctx.prisma.userRole.findFirst({ where: { userId, role: "OPERATOR" } });
            const isSuper = await ctx.prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
            const isVendorOwner = vendor.ownerId === userId;

            if (!isOperator && !isSuper && !isVendorOwner) throw new Error("Forbidden: insufficient permissions");

            const existingCategories = await ctx.prisma.category.findMany({
                where: { id: { in: input.categories } },
                select: { id: true },
            });

            const slug = await generateUniqueSlug(ctx.prisma, input.name, input.vendorId);

            const { categories: _, ...restOfInput } = input;

            return ctx.prisma.productItem.create({
                data: {
                    ...restOfInput,
                    slug,
                    categories: {
                        createMany: {
                            data: existingCategories.map((c) => ({
                                categoryId: c.id,
                            })),
                        },
                    },
                },
                include: {
                    categories: {
                        include: { category: true },
                    },
                },
            });
        }),

    // Create a product together with multiple variants (productItems) in a transaction.
    // Input allows providing an array of variants each with its own price.
    createProductWithItems: vendorAndOperatorProcedure
        .input(z.object({
            vendorId: z.string(),
            product: z.object({
                name: z.string(),
                slug: z.string(),
                description: z.string().optional()
            }),
            items: z.array(
                z.object({
                    name: z.string(),
                    description: z.string().optional(),
                    price: z.number(),
                    currency: z.string().optional().default("NGN"),
                    images: z.array(z.string()).optional(),
                    isActive: z.boolean().optional().default(true),
                    inStock: z.boolean().optional().default(true)
                }))
        }))
        .mutation(async ({ ctx, input }) => {
            if (!ctx.user) throw new Error("Unauthorized");
            const userId = ctx.user.id;

            const vendor = await ctx.prisma.vendor.findUnique({ where: { id: input.vendorId } });
            if (!vendor) throw new Error("Vendor not found");

            const isOperator = await ctx.prisma.userRole.findFirst({ where: { userId, role: "OPERATOR" } });
            const isSuper = await ctx.prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
            const isVendorOwner = vendor.ownerId === userId;

            if (!isOperator && !isSuper && !isVendorOwner) throw new Error("Forbidden: insufficient permissions");

            return ctx.prisma.$transaction(async (prisma) => {
                const createdProduct = await prisma.product.create({
                    data: {
                        vendorId: input.vendorId,
                        name: input.product.name,
                        description: input.product.description
                    }
                });
                const slug = await generateUniqueSlug(ctx.prisma, input.product.name, input.vendorId);

                for (const it of input.items) {
                    await prisma.productItem.create({
                        data: {
                            vendorId: input.vendorId,
                            productId: createdProduct.id,
                            name: it.name,
                            slug,
                            description: it.description,
                            price: it.price,
                            currency: it.currency,
                            images: it.images,
                            isActive: it.isActive,
                            inStock: it.inStock
                        }
                    });
                }

                return prisma.product.findUnique({ where: { id: createdProduct.id }, include: { items: true } });
            });
        }),

    updateProductItem: vendorAndOperatorProcedure
        .input(z.object({
            id: z.string(),
            data: z.object({
                name: z.string().optional(),
                price: z.number().optional(),
                currency: z.string().optional(),
                categories: z.array(z.string()).min(1).optional(),
                images: z.array(z.string()).optional(),
                isActive: z.boolean().optional(),
                inStock: z.boolean().optional(),
                pricingType: z.enum(['FIXED', 'PER_UNIT']).optional(),
                unitName: z.string().optional().nullable(),
                minQuantity: z.number().optional(),
                maxQuantity: z.number().optional().nullable(),
                quantityStep: z.number().optional(),
                packagingFee: z.number().optional().nullable(),
            })
        }))
        .mutation(async ({ ctx, input }) => {
            // allow vendor owner, operator, or super admin to update
            if (!ctx.user) throw new Error("Unauthorized");
            const userId = ctx.user.id;

            const item = await ctx.prisma.productItem.findUnique({ where: { id: input.id } });
            if (!item) throw new Error("ProductItem not found");

            const vendor = await ctx.prisma.vendor.findUnique({ where: { id: item.vendorId } });

            const isOperator = await ctx.prisma.userRole.findFirst({ where: { userId, role: "OPERATOR" } });
            const isSuper = await ctx.prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
            const isVendorOwner = vendor && vendor.ownerId === userId;

            if (!isOperator && !isSuper && !isVendorOwner) throw new Error("Forbidden: insufficient permissions");

            let categoryData = {};
            if (input.data.categories) {
                const existingCategories = await ctx.prisma.category.findMany({
                    where: { id: { in: input.data.categories } },
                    select: { id: true },
                });

                if (existingCategories.length !== input.data.categories.length) {
                    throw new Error("One or more categories are invalid");
                }

                // disconnect old categories and connect new ones
                await ctx.prisma.productItemCategory.deleteMany({
                    where: { productItemId: input.id },
                });

                categoryData = {
                    categories: {
                        createMany: {
                            data: existingCategories.map((c) => ({
                                categoryId: c.id,
                            })),
                        },
                    },
                }
            }


            const { categories: _, ...restOfData } = input.data;

            return ctx.prisma.productItem.update({
                where: { id: input.id },
                data: {
                    ...restOfData,
                    ...categoryData,
                }
            });
        }),

    updateProduct: vendorAndOperatorProcedure
        .input(z.object({
            id: z.string(),
            data: z.object({
                name: z.string().optional(),
                description: z.string().optional(),
                inStock: z.boolean().optional(),
            })
        }))
        .mutation(async ({ ctx, input }) => {
            if (!ctx.user) throw new Error("Unauthorized");
            const userId = ctx.user.id;

            const product = await ctx.prisma.product.findUnique({ where: { id: input.id } });
            if (!product) throw new Error("Product not found");

            const vendor = await ctx.prisma.vendor.findUnique({ where: { id: product.vendorId } });

            const isOperator = await ctx.prisma.userRole.findFirst({ where: { userId, role: "OPERATOR" } });
            const isSuper = await ctx.prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
            const isVendorOwner = vendor && vendor.ownerId === userId;

            if (!isOperator && !isSuper && !isVendorOwner) throw new Error("Forbidden: insufficient permissions");

            return ctx.prisma.product.update({ where: { id: input.id }, data: input.data });
        }),

    // Delete product item (vendor only)
    deleteProductItem: vendorProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const item = await ctx.prisma.productItem.findUnique({
                where: { id: input.id },
                include: { vendor: true }
            });
            const isSuper = await ctx.prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
            if (!item) throw new Error("Product item not found");
            if (item.vendor.ownerId !== userId && !isSuper) {
                throw new Error("Unauthorized: You don't own this product item");
            }

            // Hard delete
            return ctx.prisma.productItem.delete({
                where: { id: input.id },
            });
        }),

    // Delete product (vendor only)
    deleteProduct: vendorProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const product = await ctx.prisma.product.findUnique({
                where: { id: input.id },
                include: { vendor: true }
            });
            const isSuper = await ctx.prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
            if (!product) throw new Error("Product not found");
            if (product.vendor.ownerId !== userId && !isSuper) {
                throw new Error("Unauthorized: You don't own this product");
            }

            // Hard delete in a transaction
            return ctx.prisma.$transaction(async (prisma) => {
                // Delete all items associated with the product
                await prisma.productItem.deleteMany({
                    where: { productId: input.id },
                });

                // Delete the product itself
                return prisma.product.delete({
                    where: { id: input.id },
                });
            });
        }),

    // ========================================
    // VENDOR ONBOARDING PROCEDURES
    // ========================================

    // Create vendor account with user linking (atomic transaction)
    createVendorAccount: publicProcedure
        .input(z.object({
            userId: z.string().optional(), // If user already exists
            email: z.string().email(),
            phone: z.string(),
            firstName: z.string(),
            lastName: z.string(),
            businessName: z.string(),
            businessDescription: z.string(),
            verificationToken: z.string(), // Email verification token
            address: z.string().optional(), // Business address
            areaId: z.string().optional(), // Area ID for delivery zone
            categoryIds: z.array(z.string()).optional(), // Optional categories to link
        }))
        .mutation(async ({ ctx, input }) => {
            const { userId, email, phone, firstName, lastName, businessName, businessDescription, address, areaId, verificationToken, categoryIds } = input;

            // Verify email token
            const payload = verifyVerificationToken(verificationToken);
            if (!payload) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "INVALID_VERIFICATION_TOKEN" });
            }

            // In Step 48 of phoneAuth.verifyEmailOtp, payload.phone was set to email
            if (payload.phone !== email.toLowerCase().trim()) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "EMAIL_MISMATCH" });
            }

            // Use transaction to ensure atomicity
            const result = await ctx.prisma.$transaction(async (tx) => {
                let user;

                if (userId) {
                    // User already exists, fetch it
                    user = await tx.user.findUnique({
                        where: { id: userId },
                        include: {
                            vendors: true,
                            roles: true,
                        }
                    });

                    if (!user) {
                        throw new TRPCError({
                            code: 'NOT_FOUND',
                            message: 'USER_NOT_FOUND'
                        });
                    }

                    // Check if user already has a vendor account
                    if (user.vendors && user.vendors.length > 0) {
                        throw new TRPCError({
                            code: 'BAD_REQUEST',
                            message: 'VENDOR_ACCOUNT_ALREADY_EXISTS'
                        });
                    }

                    // Check if user has VENDOR role - if yes, auto-link
                    const hasVendorRole = user.roles.some(role => role.role === 'VENDOR');

                    // Update user details if needed
                    await tx.user.update({
                        where: { id: userId },
                        data: {
                            firstName: firstName || user.firstName,
                            lastName: lastName || user.lastName,
                            emailVerified: true, // Mark as verified
                        }
                    });
                } else {
                    // Create new user (without password - will be set later)
                    // First check if user with this email already exists
                    const existingUser = await tx.user.findUnique({
                        where: { email: email.toLowerCase().trim() }
                    });

                    if (existingUser) {
                        user = existingUser;
                    } else {
                        user = await tx.user.create({
                            data: {
                                email: email.toLowerCase().trim(),
                                phone,
                                firstName,
                                lastName,
                                name: `${firstName} ${lastName}`,
                                emailVerified: true,
                            }
                        });
                    }
                }

                // Check if vendor already exists for this user
                const existingVendor = await tx.vendor.findFirst({
                    where: { ownerId: user.id }
                });

                if (existingVendor) {
                    throw new Error("VENDOR_ALREADY_EXISTS");
                }

                // Generate unique slug for vendor
                const baseSlug = businessName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                let slug = baseSlug;
                let counter = 1;

                // Ensure slug is unique
                while (true) {
                    const existing = await tx.vendor.findUnique({ where: { slug } });
                    if (!existing) break;
                    slug = `${baseSlug}-${counter}`;
                    counter++;
                }

                // Create vendor account
                const vendor = await tx.vendor.create({
                    data: {
                        ownerId: user.id,
                        name: businessName,
                        slug,
                        description: businessDescription,
                        email: email.toLowerCase().trim(),
                        phone,
                        areaId: areaId || undefined,
                    }
                });

                // Create an Address record for the vendor if address is provided
                if (address && areaId) {
                    await tx.address.create({
                        data: {
                            userId: user.id,
                            vendorId: vendor.id,
                            line1: address,
                            city: 'Ado-Ekiti', // Default for now, can be updated later
                            state: 'Ekiti',
                            country: 'NG',
                            areaId: areaId,
                            isDefault: true,
                        }
                    });
                }

                // Assign VENDOR role to user
                await tx.userRole.upsert({
                    where: {
                        userId_role: {
                            userId: user.id,
                            role: "VENDOR"
                        }
                    },
                    create: {
                        userId: user.id,
                        role: "VENDOR"
                    },
                    update: {}
                });

                // Link vendor to categories if provided
                if (categoryIds && categoryIds.length > 0) {
                    await tx.vendorCategory.createMany({
                        data: categoryIds.map((categoryId) => ({
                            vendorId: vendor.id,
                            categoryId,
                        })),
                    });
                }

                return {
                    user,
                    vendor,
                };
            });

            return {
                userId: result.user.id,
                vendorId: result.vendor.id,
                email: result.user.email,
            };
        }),

    // Get vendor onboarding progress
    getVendorOnboardingProgress: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user.id;

        // Check if user has vendor
        const vendor = await ctx.prisma.vendor.findFirst({
            where: { ownerId: userId },
            include: {
                openingHours: true,
                addresses: true,
                documents: true,
                _count: {
                    select: {
                        productItems: true,
                        products: true,
                    }
                }
            }
        });

        if (!vendor) {
            return {
                hasVendor: false,
                steps: {
                    accountCreated: false,
                    profileCompleted: false,
                    paymentInfoAdded: false,
                    operationsSetup: false,
                    menuItemsAdded: false,
                    identityVerified: false,
                },
                percentage: 0,
                isComplete: false,
                completedCount: 0,
                totalSteps: 5,
                vendorId: null,
                slug: null,
                approvalStatus: null,
                declineReason: null,
                submittedForApproval: false,
            };
        }

        // Check if vendor has addresses
        // const hasAddresses = await ctx.prisma.address.findFirst({
        //     where: { vendorId: vendor.id }
        // });

        // Calculate progress
        const steps = {
            accountCreated: true, // Account is created if vendor exists
            profileCompleted: !!(vendor?.phone && vendor?.documents.length > 0 && vendor.coverImage),
            paymentInfoAdded: !!(vendor.bankAccountNumber && vendor?.bankAccountName && vendor?.bankCode),
            operationsSetup: (vendor.openingHours?.length || 0) > 0,
            menuItemsAdded: (vendor._count?.products + vendor._count?.productItems || 0) > 0,
            identityVerified: (vendor.documents?.length || 0) > 0,
        };

        const completedCount = Object.values(steps).filter(Boolean).length;
        const totalSteps = Object.keys(steps).length;
        const percentage = Math.round((completedCount / totalSteps) * 100);

        return {
            hasVendor: true,
            steps,
            percentage,
            isComplete: percentage === 100,
            completedCount,
            totalSteps,
            vendorId: vendor.id,
            slug: vendor.slug,
            approvalStatus: vendor.approvalStatus || 'PENDING',
            declineReason: vendor.declineReason,
            submittedForApproval: vendor.submittedForApproval || false,
        };
    }),

    // ========================================
    // VENDOR APPROVAL PROCEDURES
    // ========================================

    // Submit vendor for approval (vendor completes onboarding)
    submitForApproval: vendorProcedure
        .mutation(async ({ ctx }) => {
            const userId = ctx.user!.id;

            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: userId }
            });

            if (!vendor) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'VENDOR_NOT_FOUND'
                });
            }

            if (vendor.submittedForApproval) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'ALREADY_SUBMITTED'
                });
            }

            // Update vendor as submitted
            const updated = await ctx.prisma.vendor.update({
                where: { id: vendor.id },
                data: {
                    submittedForApproval: true,
                    submittedAt: new Date(),
                }
            });

            // Send confirmation email to vendor
            try {
                await sendVendorSubmissionConfirmation(
                    vendor.email || ctx.user!.email,
                    vendor.name,
                    process.env.FUDEX_ONBOARDING_EMAIL as string
                );
            } catch (e) {
                console.error('Failed to send submission confirmation email:', e);
            }

            // Notify admin
            try {
                const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
                if (adminEmail) {
                    await sendAdminNewVendorNotification(
                        adminEmail,
                        vendor.name,
                        vendor.email || ctx.user!.email,
                        process.env.FUDEX_ONBOARDING_EMAIL as string
                    );
                }
            } catch (e) {
                console.error('Failed to send admin notification email:', e);
            }

            return { success: true, message: 'Submitted for approval' };
        }),

    // Upload verification document
    uploadVerificationDocument: vendorProcedure
        .input(z.object({
            documentUrl: z.string().url(),
            documentType: z.string().min(1, 'Document type is required'),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user!.id;

            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: userId }
            });

            if (!vendor) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'VENDOR_NOT_FOUND'
                });
            }

            // Create new verification document record
            const newDoc = await ctx.prisma.vendorVerificationDocument.create({
                data: {
                    vendorId: vendor.id,
                    type: input.documentType,
                    url: input.documentUrl
                }
            });

            // Count documents
            const count = await ctx.prisma.vendorVerificationDocument.count({
                where: { vendorId: vendor.id }
            });

            return { success: true, documentCount: count, document: newDoc };
        }),

    // Get pending vendors (admin only)
    getPendingVendors: adminProcedure
        .input(z.object({
            limit: z.number().min(1).max(50).default(20),
            cursor: z.number().default(0),
        }))
        .query(async ({ ctx, input }) => {
            const skip = input.cursor;
            const limit = input.limit;

            const vendors = await ctx.prisma.vendor.findMany({
                where: {
                    approvalStatus: 'PENDING',
                    submittedForApproval: true,
                },
                take: limit + 1,
                skip,
                orderBy: {
                    submittedAt: 'desc'
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            firstName: true,
                            lastName: true,
                        }
                    },
                    documents: true // Include documents for count
                }
            });

            let nextCursor: number | undefined = undefined;
            if (vendors.length > limit) {
                vendors.pop();
                nextCursor = skip + limit;
            }

            return {
                vendors,
                nextCursor,
            };
        }),

    // Get vendor details for approval review (admin only)
    getVendorApprovalDetails: adminProcedure
        .input(z.object({ vendorId: z.string() }))
        .query(async ({ ctx, input }) => {
            const vendor = await ctx.prisma.vendor.findUnique({
                where: { id: input.vendorId },
                include: {
                    owner: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                            emailVerified: true,
                            phoneVerified: true,
                        }
                    },
                    openingHours: true,
                    addresses: true,
                    documents: true, // Include the new documents relation
                    _count: {
                        select: {
                            productItems: true,
                        }
                    }
                }
            });

            if (!vendor) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'VENDOR_NOT_FOUND'
                });
            }

            return vendor;
        }),

    // Approve vendor (admin only)
    approveVendor: adminProcedure
        .input(z.object({ vendorId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const adminId = ctx.user!.id;

            const vendor = await ctx.prisma.vendor.findUnique({
                where: { id: input.vendorId },
                include: {
                    owner: true
                }
            });

            if (!vendor) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'VENDOR_NOT_FOUND'
                });
            }

            if (vendor.approvalStatus === 'APPROVED') {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'ALREADY_APPROVED'
                });
            }

            // Update vendor status to approved
            const updated = await ctx.prisma.vendor.update({
                where: { id: input.vendorId },
                data: {
                    approvalStatus: 'APPROVED',
                    approvalDate: new Date(),
                    approvedById: adminId,
                    declineReason: null, // Clear any previous decline reason
                }
            });

            // Send approval email
            try {
                await sendVendorApprovalEmail(
                    vendor.email || vendor.owner?.email || '',
                    vendor.name,
                    process.env.FUDEX_ONBOARDING_EMAIL as string
                );
            } catch (e) {
                console.error('Failed to send approval email:', e);
            }

            return { success: true, message: 'Vendor approved' };
        }),

    // Decline vendor (admin only) - reason is required
    declineVendor: adminProcedure
        .input(z.object({
            vendorId: z.string(),
            reason: z.string().min(10, 'Decline reason must be at least 10 characters'),
        }))
        .mutation(async ({ ctx, input }) => {
            const vendor = await ctx.prisma.vendor.findUnique({
                where: { id: input.vendorId },
                include: {
                    owner: true
                }
            });

            if (!vendor) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'VENDOR_NOT_FOUND'
                });
            }

            // Update vendor status to declined
            const updated = await ctx.prisma.vendor.update({
                where: { id: input.vendorId },
                data: {
                    approvalStatus: 'DECLINED',
                    declineReason: input.reason,
                    submittedForApproval: false, // Allow resubmission
                }
            });

            // Send decline email with reason
            try {
                await sendVendorDeclineEmail(
                    vendor.email || vendor.owner?.email || '',
                    vendor.name,
                    input.reason,
                    process.env.FUDEX_ONBOARDING_EMAIL as string
                );
            } catch (e) {
                console.error('Failed to send decline email:', e);
            }

            return { success: true, message: 'Vendor declined' };
        }),
});
