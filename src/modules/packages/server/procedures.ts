import { createTRPCRouter, adminProcedure, publicProcedure, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { calculateDeliveryFee, getServiceFee } from "@/lib/deliveryFeeCalculator";
import { v4 as uuidv4 } from "uuid";
import {
    initializePaystackTransaction,
    verifyPaystackTransaction,
} from "@/lib/paystack";

// ========== ADMIN PROCEDURES ==========
export const packageAdminRouter = createTRPCRouter({
    // Create a new package
    createPackage: adminProcedure
        .input(
            z.object({
                name: z.string().min(1),
                slug: z.string().min(1),
                description: z.string().optional(),
                coverImage: z.string().optional(),
                isActive: z.boolean().default(true),
                isPreorder: z.boolean().default(false),
                deliveryDate: z.date().optional(),
                orderCloseDate: z.date().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if slug already exists
            const existing = await ctx.prisma.package.findUnique({
                where: { slug: input.slug },
            });
            if (existing) {
                throw new Error("Package with this slug already exists");
            }

            return ctx.prisma.package.create({
                data: input,
            });
        }),

    // Update package
    updatePackage: adminProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1).optional(),
                slug: z.string().min(1).optional(),
                description: z.string().optional().nullable(),
                coverImage: z.string().optional().nullable(),
                isActive: z.boolean().optional(),
                isPreorder: z.boolean().optional(),
                deliveryDate: z.date().optional().nullable(),
                orderCloseDate: z.date().optional().nullable(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;

            // If slug is being updated, check if it's already taken
            if (data.slug) {
                const existing = await ctx.prisma.package.findFirst({
                    where: {
                        slug: data.slug,
                        id: { not: id },
                    },
                });
                if (existing) {
                    throw new Error("Package with this slug already exists");
                }
            }

            return ctx.prisma.package.update({
                where: { id },
                data,
            });
        }),

    // Delete package
    deletePackage: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Check if package has orders
            const orderCount = await ctx.prisma.packageOrder.count({
                where: { packageId: input.id },
            });
            if (orderCount > 0) {
                throw new Error("Cannot delete package with existing orders");
            }

            return ctx.prisma.package.delete({
                where: { id: input.id },
            });
        }),

    // List all packages (admin view)
    listPackages: adminProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(50),
                cursor: z.string().nullish(),
                isActive: z.boolean().optional(),
            }).optional()
        )
        .query(async ({ ctx, input }) => {
            const limit = input?.limit ?? 50;
            const { cursor, isActive } = input ?? {};

            const where: any = {};
            if (isActive !== undefined) {
                where.isActive = isActive;
            }

            const items = await ctx.prisma.package.findMany({
                where,
                take: limit + 1,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: { createdAt: "desc" },
                include: {
                    _count: {
                        select: {
                            categories: true,
                            orders: true,
                        },
                    },
                },
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem?.id;
            }

            return {
                items,
                nextCursor,
            };
        }),

    // Get package by ID (admin view with all details)
    getPackageById: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.package.findUnique({
                where: { id: input.id },
                include: {
                    categories: {
                        include: {
                            items: {
                                orderBy: { createdAt: "desc" },
                            },
                            _count: {
                                select: { items: true },
                            },
                        },
                        orderBy: { order: "asc" },
                    },
                },
            });
        }),

    // ========== CATEGORY MANAGEMENT ==========
    createCategory: adminProcedure
        .input(
            z.object({
                packageId: z.string(),
                name: z.string().min(1),
                slug: z.string().min(1),
                description: z.string().optional(),
                order: z.number().default(0),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if slug already exists for this package
            const existing = await ctx.prisma.packageCategory.findUnique({
                where: {
                    packageId_slug: {
                        packageId: input.packageId,
                        slug: input.slug,
                    },
                },
            });
            if (existing) {
                throw new Error("Category with this slug already exists in this package");
            }

            return ctx.prisma.packageCategory.create({
                data: input,
            });
        }),

    updateCategory: adminProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1).optional(),
                slug: z.string().min(1).optional(),
                description: z.string().optional().nullable(),
                order: z.number().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;

            // If slug is being updated, check if it's already taken
            if (data.slug) {
                const category = await ctx.prisma.packageCategory.findUnique({
                    where: { id },
                });
                if (category) {
                    const existing = await ctx.prisma.packageCategory.findFirst({
                        where: {
                            packageId: category.packageId,
                            slug: data.slug,
                            id: { not: id },
                        },
                    });
                    if (existing) {
                        throw new Error("Category with this slug already exists in this package");
                    }
                }
            }

            return ctx.prisma.packageCategory.update({
                where: { id },
                data,
            });
        }),

    deleteCategory: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Check if category has items
            const itemCount = await ctx.prisma.packageItem.count({
                where: { categoryId: input.id },
            });
            if (itemCount > 0) {
                throw new Error("Cannot delete category with existing items");
            }

            return ctx.prisma.packageCategory.delete({
                where: { id: input.id },
            });
        }),

    // ========== PACKAGE ITEM MANAGEMENT ==========
    createPackageItem: adminProcedure
        .input(
            z.object({
                packageId: z.string(),
                categoryId: z.string(),
                name: z.string().min(1),
                slug: z.string().min(1),
                description: z.string().optional(),
                price: z.number().min(0),
                currency: z.string().default("NGN"),
                images: z.array(z.string()).default([]),
                isActive: z.boolean().default(true),
                inStock: z.boolean().default(true),
                details: z.any().optional(), // JSON field for flexible data
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if slug already exists for this package
            const existing = await ctx.prisma.packageItem.findUnique({
                where: {
                    packageId_slug: {
                        packageId: input.packageId,
                        slug: input.slug,
                    },
                },
            });
            if (existing) {
                throw new Error("Package item with this slug already exists in this package");
            }

            return ctx.prisma.packageItem.create({
                data: input,
            });
        }),

    updatePackageItem: adminProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1).optional(),
                slug: z.string().min(1).optional(),
                description: z.string().optional().nullable(),
                price: z.number().min(0).optional(),
                currency: z.string().optional(),
                images: z.array(z.string()).optional(),
                isActive: z.boolean().optional(),
                inStock: z.boolean().optional(),
                categoryId: z.string().optional(),
                details: z.any().optional().nullable(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;

            // If slug is being updated, check if it's already taken
            if (data.slug) {
                const item = await ctx.prisma.packageItem.findUnique({
                    where: { id },
                });
                if (item) {
                    const existing = await ctx.prisma.packageItem.findFirst({
                        where: {
                            packageId: item.packageId,
                            slug: data.slug,
                            id: { not: id },
                        },
                    });
                    if (existing) {
                        throw new Error("Package item with this slug already exists in this package");
                    }
                }
            }

            return ctx.prisma.packageItem.update({
                where: { id },
                data,
            });
        }),

    deletePackageItem: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Check if item has orders
            const orderCount = await ctx.prisma.packageOrderItem.count({
                where: { packageItemId: input.id },
            });
            if (orderCount > 0) {
                throw new Error("Cannot delete package item with existing orders");
            }

            return ctx.prisma.packageItem.delete({
                where: { id: input.id },
            });
        }),
});

// ========== PUBLIC PROCEDURES ==========
export const packagePublicRouter = createTRPCRouter({
    // Get active packages
    listActivePackages: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.package.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                coverImage: true,
                isPreorder: true,
                deliveryDate: true,
                orderCloseDate: true,
                createdAt: true,
            },
        });
    }),

    // Get package by slug (public view)
    getPackageBySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ ctx, input }) => {
            const packageData = await ctx.prisma.package.findUnique({
                where: { slug: input.slug },
                include: {
                    categories: {
                        where: {},
                        include: {
                            items: {
                                where: { isActive: true },
                                orderBy: { createdAt: "desc" },
                            },
                            _count: {
                                select: { items: true },
                            },
                        },
                        orderBy: { order: "asc" },
                    },
                },
            });

            if (!packageData || !packageData.isActive) {
                throw new Error("Package not found");
            }

            return packageData;
        }),

    // Get package category with items
    getPackageCategory: publicProcedure
        .input(
            z.object({
                packageSlug: z.string(),
                categorySlug: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const packageData = await ctx.prisma.package.findUnique({
                where: { slug: input.packageSlug },
                include: {
                    categories: {
                        where: { slug: input.categorySlug },
                        include: {
                            items: {
                                where: { isActive: true },
                                orderBy: { createdAt: "desc" },
                            },
                        },
                    },
                },
            });

            if (!packageData || !packageData.isActive) {
                throw new Error("Package not found");
            }

            const category = packageData.categories[0];
            if (!category) {
                throw new Error("Category not found");
            }

            return {
                package: {
                    id: packageData.id,
                    name: packageData.name,
                    slug: packageData.slug,
                    description: packageData.description,
                    coverImage: packageData.coverImage,
                    isPreorder: packageData.isPreorder,
                    deliveryDate: packageData.deliveryDate,
                    orderCloseDate: packageData.orderCloseDate,
                },
                category,
            };
        }),

    // Get package item by ID
    getPackageItemById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const item = await ctx.prisma.packageItem.findUnique({
                where: { id: input.id },
                include: {
                    category: {
                        include: {
                            package: true,
                        },
                    },
                },
            });

            if (!item || !item.isActive) {
                throw new Error("Package item not found");
            }

            return item;
        }),

    // Create package order
    createPackageOrder: protectedProcedure
        .input(
            z.object({
                packageId: z.string(),
                items: z.array(
                    z.object({
                        packageItemId: z.string(),
                        quantity: z.number().min(1),
                    })
                ),
                // Recipient details
                recipientName: z.string().min(1),
                recipientPhone: z.string().min(1),
                recipientAddressLine1: z.string().min(1),
                recipientAddressLine2: z.string().optional(),
                recipientCity: z.string().min(1),
                recipientState: z.string().optional(),
                recipientAreaId: z.string().optional(),
                recipientCustomArea: z.string().optional(),
                // Sender details
                senderName: z.string().min(1),
                // Delivery details
                deliveryDate: z.date(),
                timeSlot: z.string(), // e.g., "08:00-10:00"
                // Card customization
                cardType: z.enum(["ADMIN_CREATED", "CUSTOM"]),
                customCardMessage: z.string().optional(),
                // Notes
                notes: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user!.id;

            // Validate package exists and is active
            const packageData = await ctx.prisma.package.findUnique({
                where: { id: input.packageId },
            });
            if (!packageData || !packageData.isActive) {
                throw new Error("Package not found or inactive");
            }

            // Validate all package items exist and are active
            const packageItems = await ctx.prisma.packageItem.findMany({
                where: {
                    id: { in: input.items.map((i) => i.packageItemId) },
                    packageId: input.packageId,
                    isActive: true,
                    inStock: true,
                },
            });

            if (packageItems.length !== input.items.length) {
                throw new Error("Some package items are not available");
            }

            // Create a map for quick lookup
            const itemsMap = new Map(packageItems.map((item) => [item.id, item]));

            // Calculate totals
            let productAmount = 0;
            for (const orderItem of input.items) {
                const packageItem = itemsMap.get(orderItem.packageItemId);
                if (!packageItem) continue;
                productAmount += packageItem.price * orderItem.quantity;
            }

            // Calculate delivery fee (use recipient area if available)
            const deliveryFee = await calculateDeliveryFee(
                ctx.prisma,
                input.recipientAreaId || null
            );
            const serviceFee = await getServiceFee(ctx.prisma);

            const totalAmount = productAmount + deliveryFee + serviceFee;

            // Create package order
            const packageOrder = await ctx.prisma.packageOrder.create({
                data: {
                    userId,
                    packageId: input.packageId,
                    status: "PENDING",
                    recipientName: input.recipientName,
                    recipientPhone: input.recipientPhone,
                    recipientAddressLine1: input.recipientAddressLine1,
                    recipientAddressLine2: input.recipientAddressLine2,
                    recipientCity: input.recipientCity,
                    recipientState: input.recipientState,
                    recipientAreaId: input.recipientAreaId,
                    recipientCustomArea: input.recipientCustomArea,
                    senderName: input.senderName,
                    deliveryDate: input.deliveryDate,
                    timeSlot: input.timeSlot,
                    cardType: input.cardType,
                    customCardMessage: input.customCardMessage,
                    totalAmount,
                    productAmount,
                    deliveryFee,
                    serviceFee,
                    platformFee: 0, // Can be calculated if needed
                    notes: input.notes,
                    items: {
                        create: input.items.map((orderItem) => {
                            const packageItem = itemsMap.get(orderItem.packageItemId)!;
                            return {
                                packageItemId: orderItem.packageItemId,
                                quantity: orderItem.quantity,
                                unitPrice: packageItem.price,
                                totalPrice: packageItem.price * orderItem.quantity,
                            };
                        }),
                    },
                },
                include: {
                    items: {
                        include: {
                            packageItem: true,
                        },
                    },
                    package: true,
                },
            });

            return packageOrder;
        }),

    // Get user's package orders
    getMyPackageOrders: protectedProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(50),
                cursor: z.string().nullish(),
                status: z.enum([
                    "PENDING",
                    "PAID",
                    "PREPARING",
                    "ASSIGNED",
                    "DELIVERED",
                    "CANCELLED",
                    "ACCEPTED",
                    "READY",
                    "OUT_FOR_DELIVERY",
                ]).optional(),
            }).optional()
        )
        .query(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const limit = input?.limit ?? 50;
            const { cursor, status } = input ?? {};

            const where: any = { userId };
            if (status) {
                where.status = status;
            }

            const items = await ctx.prisma.packageOrder.findMany({
                where,
                take: limit + 1,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: { createdAt: "desc" },
                include: {
                    package: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            coverImage: true,
                        },
                    },
                    items: {
                        include: {
                            packageItem: {
                                select: {
                                    id: true,
                                    name: true,
                                    images: true,
                                    price: true,
                                },
                            },
                        },
                    },
                },
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem?.id;
            }

            return {
                items,
                nextCursor,
            };
        }),

    // Get package order by ID
    getPackageOrderById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const userId = ctx.user!.id;

            const order = await ctx.prisma.packageOrder.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
                include: {
                    package: true,
                    items: {
                        include: {
                            packageItem: true,
                        },
                    },
                    payment: true,
                },
            });

            if (!order) {
                throw new Error("Package order not found");
            }

            return order;
        }),

    // Create payment for package order
    createPackagePayment: protectedProcedure
        .input(
            z.object({
                packageOrderId: z.string(),
                callbackUrl: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user!.id;

            // Fetch package order with user and payment info
            const packageOrder = await ctx.prisma.packageOrder.findUnique({
                where: { id: input.packageOrderId },
                include: {
                    user: true,
                    payment: true,
                },
            });

            if (!packageOrder) {
                throw new Error("Package order not found");
            }

            if (packageOrder.userId !== userId) {
                throw new Error("Unauthorized: This order does not belong to you");
            }

            // Check if order already has a payment
            if (packageOrder.payment) {
                if (packageOrder.payment.status === "COMPLETED") {
                    throw new Error("Payment already completed for this order");
                }
                if (packageOrder.payment.status === "FAILED") {
                    await ctx.prisma.packagePayment.delete({
                        where: { id: packageOrder.payment.id },
                    });
                } else if (packageOrder.payment.status === "PENDING") {
                    // Verify with Paystack
                    try {
                        const verification = await verifyPaystackTransaction(
                            packageOrder.payment.providerRef
                        );

                        if (verification.status && verification.data.status === "success") {
                            if (!packageOrder.payment.paidAt) {
                                await ctx.prisma.packagePayment.update({
                                    where: { id: packageOrder.payment.id },
                                    data: {
                                        paidAt: new Date(verification.data.paid_at || new Date()),
                                        status: "COMPLETED",
                                    },
                                });
                            }
                            throw new Error("Payment already completed for this order");
                        } else {
                            await ctx.prisma.packagePayment.delete({
                                where: { id: packageOrder.payment.id },
                            });
                        }
                    } catch (error: any) {
                        if (error.message === "Payment already completed for this order") {
                            throw error;
                        }
                        await ctx.prisma.packagePayment.delete({
                            where: { id: packageOrder.payment.id },
                        }).catch(() => { });
                    }
                }
            }

            // Validate order amount
            if (packageOrder.totalAmount <= 0) {
                throw new Error("Invalid order amount");
            }

            // Generate unique reference
            const reference = `PKG-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

            // Get user email for Paystack
            const userEmail = packageOrder.user.email;
            if (!userEmail) {
                throw new Error("User email is required for payment");
            }

            // Build callback URL
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
                ? process.env.NEXT_PUBLIC_BASE_URL
                : process.env.VERCEL_URL
                    ? `https://${process.env.VERCEL_URL}`
                    : "http://localhost:3000";
            const callbackUrl =
                input.callbackUrl ||
                `${baseUrl}/packages/orders/${packageOrder.id}/payment-callback?reference=${reference}`;

            // Initialize Paystack transaction
            let paystackResponse;
            try {
                paystackResponse = await initializePaystackTransaction({
                    email: userEmail,
                    amount: packageOrder.totalAmount,
                    reference,
                    callback_url: callbackUrl,
                    metadata: {
                        packageOrderId: packageOrder.id,
                        userId: userId,
                        custom_fields: [
                            {
                                display_name: "Package Order ID",
                                variable_name: "package_order_id",
                                value: packageOrder.id,
                            },
                        ],
                    },
                    currency: packageOrder.currency || "NGN",
                });
            } catch (error) {
                throw new Error(
                    `Failed to initialize payment: ${error instanceof Error ? error.message : "Unknown error"}`
                );
            }

            if (!paystackResponse.status || !paystackResponse.data) {
                throw new Error(
                    paystackResponse.message || "Failed to initialize payment"
                );
            }

            // Create payment record in database
            const payment = await ctx.prisma.packagePayment.create({
                data: {
                    packageOrderId: packageOrder.id,
                    userId,
                    amount: packageOrder.totalAmount,
                    currency: packageOrder.currency,
                    provider: "paystack",
                    providerRef: paystackResponse.data.reference,
                    status: "PENDING",
                },
            });

            return {
                payment,
                checkoutUrl: paystackResponse.data.authorization_url,
                reference: paystackResponse.data.reference,
            };
        }),
});

// Combined router
export const packageRouter = createTRPCRouter({
    admin: packageAdminRouter,
    public: packagePublicRouter,
});
